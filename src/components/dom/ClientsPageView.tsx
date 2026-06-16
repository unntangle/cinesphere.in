'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import {
  CLIENTS,
  CLIENT_SECTORS,
  type Client,
  type ClientSector,
} from '@/lib/clients';
import { useExperience } from '@/store/useExperience';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ClientsPageView — the dedicated /clients page.
 * ----------------------------------------------
 * A light, editorial showcase of the organisations Cinesphere has delivered
 * for — a stylistic sibling of the /brands page, sharing its motion system
 * and palette, but with its own signature visual:
 *   • a hero with a generative multicolour cymatic mandala on black,
 *   • a filterable logo roster (pill filters by sector) with hover reveals,
 *   • a dark cinema CTA.
 *
 * Every section reveals on scroll via the same blur-and-rise motion system as
 * the brands page (groupV / itemV / cardsV / cardV), and all of it collapses
 * to nothing under prefers-reduced-motion. Client data is the single source
 * of truth in src/lib/clients.ts.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* Dark, premium background image for the CTA (Unsplash — concert hall). */
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80';

/* Multicolour sound spectrum — the same palette as the nav and footer
   waveforms, so the clients hero shares the site's audio-spectrum signature.
   Wrapped (blue → … → magenta → blue) so it forms a seamless colour wheel. */
const SPECTRUM_STOPS: [number, number, number][] = [
  [31, 123, 255], // electric blue
  [25, 200, 255], // cyan
  [39, 211, 110], // green
  [255, 210, 63], // yellow
  [255, 122, 47], // orange
  [255, 45, 85], // red
  [255, 77, 184], // magenta
  [31, 123, 255], // back to blue — closes the wheel
];
function spectrumRGB(t: number): [number, number, number] {
  const clamped = ((t % 1) + 1) % 1;
  const seg = clamped * (SPECTRUM_STOPS.length - 1);
  const i = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = SPECTRUM_STOPS[i];
  const b = SPECTRUM_STOPS[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

/* ----------------------------------------------------------------- */
/* Shared scroll-reveal orchestration (matches BrandsPageView)       */
/* ----------------------------------------------------------------- */
const groupV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemV = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};
/* Roster / sector grid — each card reveals as it scrolls into view, with a
   gentle left-to-right ripple across each row. The delay is keyed to the
   card's column (index % 5) rather than its absolute position, so the ripple
   resets every row instead of accumulating lag down a long grid. */
const cardV = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  show: (col: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: col * 0.06 },
  }),
};

/* ----------------------------------------------------------------- */
/* Hero visual — generative multicolour cymatic mandala (circular plate) */
/* ----------------------------------------------------------------- */

/**
 * CymaticField — sound made visible, rendered to a <canvas>.
 *
 * Cymatics is what you see when sound vibrates a plate scattered with fine
 * sand: the grains are flung away from the loud "antinodes" and pile up along
 * the silent nodal lines, tracing the standing wave as a geometric figure.
 * Here a field of grains obeys a circular-membrane standing-wave equation;
 * the plate is perpetually re-tuned through a sequence of (m, n) modes, so the
 * figure continually dissolves and reforms into new mandalas — concentric
 * rings crossed by radial petals — that never repeat quite the same way twice.
 *
 * Each grain is tinted across the audio spectrum by its angle on the disc (the
 * same blue → magenta palette as the nav and footer waveforms), so the rosette
 * reads as a slowly rotating colour wheel. Grains resting on a nodal line
 * brighten toward white so the lines stay crisp; grains shaken in the loud
 * regions stay dim and sparse. Drawn with additive blending on black so the
 * dense lines bloom. Settles onto one crisp figure and freezes for reduced
 * motion.
 */
function CymaticField({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let tHue = 0; // running time (s) — slowly rotates the colour wheel

    // Grain count adapts to the device. A capable desktop reads as a dense
    // mandala; phones and low-core / data-saver machines get a far lighter
    // field so the per-grain simulation never competes with scrolling.
    const nav =
      typeof navigator !== 'undefined'
        ? (navigator as Navigator & {
            connection?: { saveData?: boolean };
            deviceMemory?: number;
          })
        : undefined;
    const lowPower =
      !!nav &&
      ((nav.hardwareConcurrency ?? 8) <= 4 ||
        (nav.deviceMemory ?? 8) <= 4 ||
        nav.connection?.saveData === true ||
        (typeof window !== 'undefined' && window.innerWidth < 768));
    const COUNT = lowPower ? 700 : 1300; // grains of sand on the plate
    // Decorative, glow-heavy canvas → render the backing store below the
    // display resolution and let the browser upscale it (the additive bloom
    // hides it). Per-grain drawing is the main cost, so we also cap device
    // pixels at 1×. Lower toward ~0.7 if a machine still struggles.
    const RENDER_SCALE = 0.9;

    // Mode sequence for a CIRCULAR plate — (m, n) = (nodal diameters,
    // nodal circles). m sets the petal count (2·m), n the number of rings;
    // together they trace a mandala. The plate rests on one figure, then
    // tunes to the next, forever.
    const MODES: [number, number][] = [
      [3, 2], [5, 1], [2, 3], [6, 2], [4, 3],
      [8, 1], [3, 4], [5, 3], [7, 2], [4, 4],
    ];
    const HOLD = 3.0; // seconds resting on a crisp figure
    const MORPH = 2.2; // seconds tuning to the next figure
    const PERIOD = HOLD + MORPH;
    const INV_2PI = 1 / (Math.PI * 2);

    // ---- Precomputed colour/size palette --------------------------------
    // Every grain's colour depends on just two things: its angle on the disc
    // (→ hue) and how "settled" it is (→ brightness, alpha, size). We quantise
    // those into bins and precompute the rgba string + size for each bin ONCE.
    // During draw we bucket grains into these bins and stroke each bucket with
    // a single fillStyle — removing ~1600 per-frame string allocations and
    // collapsing thousands of fillStyle changes into a few hundred.
    const HUE_BINS = 64;
    const SET_BINS = 8;
    const NB = HUE_BINS * SET_BINS;
    const styleLUT: string[] = new Array(NB);
    const sizeLUT = new Float32Array(NB);
    const buckets: number[][] = Array.from({ length: NB }, () => []);
    for (let hb = 0; hb < HUE_BINS; hb++) {
      const [br, bg, bbv] = spectrumRGB((hb + 0.5) / HUE_BINS);
      for (let sb = 0; sb < SET_BINS; sb++) {
        const settled = (sb + 0.5) / SET_BINS;
        const a = 0.12 + settled * 0.8;
        const lift = settled * 0.32; // nodal grains lift toward white
        const rr = (br + (255 - br) * lift) | 0;
        const gg = (bg + (255 - bg) * lift) | 0;
        const bb = (bbv + (255 - bbv) * lift) | 0;
        const idx = hb * SET_BINS + sb;
        styleLUT[idx] = `rgba(${rr},${gg},${bb},${a.toFixed(3)})`;
        sizeLUT[idx] = 0.7 + settled * 1.4;
      }
    }

    // Grains live in plate-local coords centred on the disc: x, y ∈ [-1, 1]
    // with x² + y² ≤ 1. `theta` is cached each step for the colour lookup.
    type Grain = { x: number; y: number; amp: number; theta: number };
    let grains: Grain[] = [];
    const seed = () => {
      grains = Array.from({ length: COUNT }, () => {
        const r = Math.sqrt(Math.random()); // uniform over the disc area
        const a = Math.random() * Math.PI * 2;
        return { x: r * Math.cos(a), y: r * Math.sin(a), amp: 0, theta: a };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Cap at the display resolution, then scale down — never up.
      const scale = Math.min(window.devicePixelRatio || 1, 1) * RENDER_SCALE;
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.max(1, Math.floor(W * scale));
      canvas.height = Math.max(1, Math.floor(H * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    resize();
    seed();

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Standing-wave amplitude on a circular membrane (a vibrating drumhead).
    // The angular term cos(m·θ) carves m nodal diameters (2·m petals); the
    // radial term cos(π·n·ρ) carves n nodal circles. Zero on the nodal lines,
    // ±1 at the antinodes — grains settle where this is ~0, tracing a ringed
    // rosette.
    const membrane = (x: number, y: number, m: number, n: number) => {
      const rho = Math.hypot(x, y); // 0 at the centre → 1 at the rim
      const theta = Math.atan2(y, x);
      return Math.cos(m * theta) * Math.cos(Math.PI * n * rho);
    };

    // The (possibly fractional) mode + agitation energy at time t.
    const modeAt = (t: number): [number, number, number] => {
      const idx = Math.floor(t / PERIOD) % MODES.length;
      const nextIdx = (idx + 1) % MODES.length;
      const local = t % PERIOD;
      if (local <= HOLD) return [MODES[idx][0], MODES[idx][1], 0];
      const p = easeInOut((local - HOLD) / MORPH);
      const m = MODES[idx][0] + (MODES[nextIdx][0] - MODES[idx][0]) * p;
      const n = MODES[idx][1] + (MODES[nextIdx][1] - MODES[idx][1]) * p;
      return [m, n, Math.sin(p * Math.PI)]; // energy peaks mid-tune
    };

    // The plate — a disc seated to the right, centred in the area BELOW the
    // fixed navigation so its top edge never tucks under the header.
    const plate = () => {
      const topInset = 104; // clearance for the fixed nav bar
      const radius = Math.min(W * (W > H ? 0.3 : 0.42), (H - topInset) * 0.46);
      const cx = W * (W > H ? 0.64 : 0.5);
      const cy = topInset + radius + (H - topInset - radius * 2) / 2;
      return { radius, cx, cy };
    };

    // Advance every grain one step: it hops a distance proportional to how
    // loud the membrane is beneath it, so grains drift off the antinodes and
    // settle onto the quiet nodal rings and diameters. Grains that wander
    // past the rim are reflected back into the disc.
    const step = (t: number) => {
      const [m, n, agit] = modeAt(t);
      const vibration = 0.018 + agit * 0.024;
      const minWalk = 0.0006; // grains never fully freeze — a faint shimmer
      for (const g of grains) {
        g.amp = Math.abs(membrane(g.x, g.y, m, n));
        const s = Math.max(minWalk, g.amp * vibration);
        g.x += (Math.random() * 2 - 1) * s;
        g.y += (Math.random() * 2 - 1) * s;
        let rho = Math.hypot(g.x, g.y);
        if (rho > 1) {
          const theta = Math.atan2(g.y, g.x);
          rho = rho < 2 ? 2 - rho : 1; // reflect at the rim
          g.x = Math.cos(theta) * rho;
          g.y = Math.sin(theta) * rho;
        }
        g.theta = Math.atan2(g.y, g.x); // cached for the colour bucket
      }
    };

    const draw = () => {
      const { radius, cx, cy } = plate();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // faint champagne glow seating the disc
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.15);
      glow.addColorStop(0, 'rgba(205,178,133,0.14)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // a hairline rim, so the disc reads as a plate
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(205,178,133,0.12)';
      ctx.stroke();

      // Bucket every grain into its precomputed colour/size bin …
      for (let i = 0; i < NB; i++) buckets[i].length = 0;
      for (const g of grains) {
        const settled = 1 - Math.min(1, g.amp * 2.4);
        let sb = (settled * SET_BINS) | 0;
        if (sb >= SET_BINS) sb = SET_BINS - 1;
        let hv = g.theta * INV_2PI + 0.5 + tHue * 0.02;
        hv -= Math.floor(hv); // wrap into [0,1)
        let hb = (hv * HUE_BINS) | 0;
        if (hb >= HUE_BINS) hb = HUE_BINS - 1;
        const arr = buckets[hb * SET_BINS + sb];
        arr.push(cx + g.x * radius, cy + g.y * radius);
      }

      // … then draw each bucket with a single fillStyle (additive bloom).
      ctx.globalCompositeOperation = 'lighter';
      for (let b = 0; b < NB; b++) {
        const arr = buckets[b];
        if (arr.length === 0) continue;
        ctx.fillStyle = styleLUT[b];
        const sz = sizeLUT[b];
        for (let k = 0; k < arr.length; k += 2) {
          ctx.fillRect(arr[k], arr[k + 1], sz, sz);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const settleStill = () => {
      // run the simulation forward onto the first crisp figure, then freeze
      for (let i = 0; i < 200; i++) step(1.0);
      draw();
    };

    // ---- Animation loop — paused when offscreen or the tab is hidden ------
    let running = false;
    let onScreen = true;

    // Cap the simulation at ~30fps. The figure morphs slowly, so 30fps looks
    // identical to 60 here, but it hands roughly half of every frame back to
    // the browser for scrolling and painting — the difference between a hero
    // that fights the scroll and one the page glides under.
    const FRAME_MS = 1000 / 30;
    let lastFrame = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - lastFrame < FRAME_MS) return;
      lastFrame = time;
      tHue = time * 0.001;
      step(tHue);
      draw();
    };
    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onResize = () => {
      resize();
      seed();
      if (reducedMotion || !running) settleStill();
    };
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      if (document.hidden || !onScreen) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Only run the simulation while the hero is actually in the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (reducedMotion) settleStill();
    else start();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}

/* ----------------------------------------------------------------- */
/* Logo card — shared between the sector rows and the full roster.   */
/* ----------------------------------------------------------------- */

/**
 * A white (or colour-filled) logo card with an editorial hover: the logo
 * frosts over and the client's name rises in champagne, framed by two gold
 * rules that draw outward from the centre. Mirrors the homepage marquee card
 * so the language is consistent across the site.
 */
function ClientCard({ client }: { client: Client }) {
  const filled = Boolean(client.bg);
  const filledFit =
    (client.fit ?? 'cover') === 'contain' ? 'object-contain' : 'object-cover';
  const isContainFill = filled && (client.fit ?? 'cover') === 'contain';

  return (
    <div
      className={`group/card relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl border border-black/[0.07] shadow-[0_2px_10px_-6px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-champagne/50 hover:shadow-[0_16px_44px_-20px_rgba(205,178,133,0.5)] ${
        filled ? (isContainFill ? 'p-5' : 'p-0') : 'p-6'
      }`}
      style={{ backgroundColor: client.bg ?? '#ffffff' }}
    >
      <img
        src={client.logo}
        alt={client.name}
        loading="lazy"
        decoding="async"
        className={
          filled
            ? `h-full w-full ${filledFit} transition-transform duration-500 group-hover/card:scale-[1.04]`
            : 'max-h-[58%] w-auto max-w-[78%] object-contain transition-transform duration-500 group-hover/card:scale-[1.06]'
        }
        draggable={false}
      />

      {/* Editorial name reveal. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 px-4 text-center opacity-0 backdrop-blur-0 transition-[opacity,backdrop-filter] duration-300 group-hover/card:opacity-100 group-hover/card:backdrop-blur-md">
        <span
          aria-hidden
          className="h-px w-0 bg-champagne-deep/60 transition-[width] duration-500 ease-out group-hover/card:w-10"
        />
        <span className="font-sans text-sm font-semibold tracking-wide text-champagne-deep md:text-[15px]">
          {client.name}
        </span>
        <span
          aria-hidden
          className="h-px w-0 bg-champagne-deep/60 transition-[width] duration-500 ease-out group-hover/card:w-10"
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Page                                                              */
/* ----------------------------------------------------------------- */

/* Filter pills — "All" plus each client sector. */
const FILTERS: ('All' | ClientSector)[] = [
  'All',
  ...CLIENT_SECTORS.map((s) => s.name),
];

export function ClientsPageView() {
  // Mirror the OS "reduce motion" preference into the store for this route.
  // The homepage does this through its experience shell; the standalone
  // /clients page must do it itself, or reduced-motion users would still get
  // the fully animated cymatic hero.
  useReducedMotion();
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [filter, setFilter] = useState<'All' | ClientSector>('All');
  const visible =
    filter === 'All'
      ? CLIENTS
      : CLIENTS.filter((client) => client.sector === filter);

  return (
    <>
      <Navigation />

      <main id="top" className="section-light relative z-10 overflow-hidden">
        {/* ============================ HERO ============================ */}
        <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-black pt-28 md:pt-32">
          {/* generative multicolour cymatic mandala on pure black */}
          <CymaticField reducedMotion={reducedMotion} />

          {/* left scrim so the copy stays crisp over the field */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 34%, rgba(0,0,0,0) 64%)',
            }}
          />

          {/* copy — staggered reveal on mount */}
          <div className="relative z-10 w-full px-[7vw]">
            <motion.div
              variants={reducedMotion ? undefined : groupV}
              initial={reducedMotion ? false : 'hidden'}
              animate={reducedMotion ? undefined : 'show'}
              className="max-w-xl"
            >
              <motion.p
                variants={itemV}
                className="font-sans text-sm font-semibold tracking-wide text-champagne"
              >
                Our Clients
              </motion.p>

              <motion.h1
                variants={itemV}
                className="display mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ color: 'var(--ivory)' }}
              >
                Names that set
                <br />
                the <span className="text-gold text-gold-sweep">standard</span>.
              </motion.h1>

              <motion.p
                variants={itemV}
                className="mt-6 max-w-md font-sans text-base leading-relaxed text-ivory/70 md:text-lg"
              >
                From landmark hotels and universities to global enterprises,
                Cinesphere has tuned the sound and vision of spaces that hold
                themselves to the highest bar.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ===================== ROSTER (filterable) ===================== */}
        <section id="roster" className="px-[7vw] pb-24 pt-12 md:pt-16">
          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-12%' }}
            className="max-w-2xl"
          >
            <motion.h2
              variants={itemV}
              className="display text-3xl md:text-4xl lg:text-5xl"
            >
              Every client we&apos;ve served.
            </motion.h2>
            <motion.p
              variants={itemV}
              className="mt-4 font-sans text-sm leading-relaxed text-ivory-muted md:text-base"
            >
              Trusted across hospitality, education, industry and lifestyle.
              Filter the roster by sector.
            </motion.p>
          </motion.div>

          {/* pill filters + live count */}
          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-10%' }}
            className="mt-8 flex flex-wrap items-center gap-2.5"
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <motion.button
                  key={f}
                  variants={itemV}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 font-sans text-xs font-medium transition-colors duration-300 ${
                    active
                      ? 'bg-champagne-deep text-white shadow-[0_8px_22px_-12px_rgba(154,127,84,0.9)]'
                      : 'border border-black/10 text-carbon/75 hover:border-champagne/60 hover:text-champagne-deep'
                  }`}
                >
                  {f}
                </motion.button>
              );
            })}
            <motion.span
              variants={itemV}
              className="ml-auto font-sans text-sm text-[#1d1d1f]/40"
            >
              {visible.length} {visible.length === 1 ? 'client' : 'clients'}
            </motion.span>
          </motion.div>

          {/* common grid — each card reveals on scroll-in (whileInView), and
              the whole grid re-reveals whenever the filter changes: the keyed
              container remounts the cards, so those in view animate from
              hidden again. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={false}
              exit={
                reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.18 } }
              }
              className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
            >
              {visible.map((client, i) => (
                <motion.div
                  key={client.name}
                  custom={i % 5}
                  variants={reducedMotion ? undefined : cardV}
                  initial={reducedMotion ? false : 'hidden'}
                  whileInView={reducedMotion ? undefined : 'show'}
                  viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                >
                  <ClientCard client={client} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ===================== CTA ===================== */}
        <section className="perf-section relative overflow-hidden px-[7vw] py-28 text-center md:py-36">
          {/* dark premium background image — slow Ken Burns zoom on reveal */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={reducedMotion ? false : { scale: 1.12 }}
            whileInView={reducedMotion ? undefined : { scale: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <img
              src={CTA_IMAGE}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/72" />
          </motion.div>

          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-15%' }}
            className="relative mx-auto max-w-2xl"
          >
            <motion.h2
              variants={itemV}
              className="display text-3xl md:text-5xl"
              style={{ color: 'var(--ivory)' }}
            >
              Join the roster.
            </motion.h2>
            <motion.p
              variants={itemV}
              className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-ivory/70"
            >
              Whatever you&apos;re building: a hotel, a campus, a boardroom or a
              home, we&apos;ll design a system that lives up to your name.
            </motion.p>
            <motion.div variants={itemV} className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-champagne-deep px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-champagne"
              >
                Start a project
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <FooterSection />
    </>
  );
}
