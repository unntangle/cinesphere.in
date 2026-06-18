'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import { SOLUTION_CARDS, solutionSlug } from './SolutionsCarouselSection';
import { useExperience } from '@/store/useExperience';

/**
 * SolutionsPageView — the dedicated /solutions page.
 * --------------------------------------------------
 * Every solution Cinesphere offers, on one page:
 *   • a dark cinematic hero whose background is a live acoustics ripple
 *     field — point sources emit expanding wavefronts that interfere
 *     (see HeroAcoustics), and the cursor becomes a third source,
 *   • eleven alternating image/copy blocks that slide in from their outer
 *     edge, parallax their photo, and rise their copy out of a soft blur,
 *   • a rounded dark CTA card.
 *
 * Section ids come from solutionSlug() (shared with the nav dropdown via
 * SolutionsCarouselSection), so the "Our Solutions" menu links land on the
 * matching section here. All motion collapses under prefers-reduced-motion.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* Empty theatre w/ projector screen for the closing CTA (Unsplash). */
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1643553517154-24eb7fd86437?auto=format&fit=crop&w=1600&q=80';

/* Shared scroll-reveal system. */
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
    transition: { duration: 0.6, ease: EASE },
  },
};

/* ----------------------------------------------------------------- */
/* HeroAcoustics — a flowing sound-wave band.                          */
/* ----------------------------------------------------------------- */
/* A few stacked sine curves form one soft, glowing waveform ribbon that
   drifts across the hero — tall and bright through the middle, easing to
   nothing at the edges (a smooth bell envelope), with a gentle amplitude
   swell that follows the cursor. Drawn with additive blending on black so
   the overlapping strokes bloom into a single luminous wave. Spatial
   constants are precomputed per resize; frozen to one frame under reduced
   motion; paused when offscreen / the tab is hidden. */
function HeroAcoustics({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, on: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LINES = 6; // stacked curves → soft ribbon glow
    const STEP = 6; // px sampling along x

    let W = 0;
    let H = 0;
    let raf = 0;
    let cols = 0;
    let xs = new Float32Array(0);
    let nxs = new Float32Array(0);
    let env = new Float32Array(0); // bell envelope: 0 at edges, 1 centre
    let gradient: CanvasGradient | null = null; // multicolour spectrum

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cached rainbow spectrum gradient (matches the Brands hero / nav mark).
      gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0.0, 'rgba(0,180,255,1)'); // electric blue
      gradient.addColorStop(0.16, 'rgba(40,210,255,1)'); // cyan
      gradient.addColorStop(0.32, 'rgba(150,100,255,1)'); // violet
      gradient.addColorStop(0.44, 'rgba(255,90,220,1)'); // magenta
      gradient.addColorStop(0.5, 'rgba(255,255,255,1)'); // soft white centre
      gradient.addColorStop(0.64, 'rgba(255,150,60,1)'); // orange
      gradient.addColorStop(0.82, 'rgba(255,60,45,1)'); // red
      gradient.addColorStop(1.0, 'rgba(255,42,42,1)'); // deep red

      cols = Math.floor(W / STEP) + 1;
      xs = new Float32Array(cols);
      nxs = new Float32Array(cols);
      env = new Float32Array(cols);
      for (let i = 0; i < cols; i++) {
        const x = i * STEP;
        const nx = x / W;
        xs[i] = x;
        nxs[i] = nx;
        // smooth bell (sin^1.4) — flat at the edges, peaks in the centre
        env[i] = Math.pow(Math.sin(Math.PI * nx), 1.4);
      }
    };
    build();

    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const cy = H * 0.5;
      const amp = Math.min(H * 0.2, 190);
      const mx = mouse.current.x;
      const mOn = mouse.current.on;

      for (let l = 0; l < LINES; l++) {
        const lp = l - (LINES - 1) / 2; // -2.5..2.5
        const phase = t * 0.9 + lp * 0.22;
        const vo = lp * 3.4; // vertical offset → ribbon thickness
        const lineAlpha = 0.2 * (1 - Math.abs(lp) / LINES);
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          const nx = nxs[i];
          let swell = 1;
          if (mOn) {
            const d = (xs[i] - mx) / 200;
            swell = 1 + Math.exp(-d * d) * 0.8;
          }
          const w =
            Math.sin(nx * Math.PI * 4.4 + phase) +
            0.5 * Math.sin(nx * Math.PI * 8.2 - phase * 0.7);
          const y = cy + vo + env[i] * swell * amp * (w / 1.5);
          if (i === 0) ctx.moveTo(xs[i], y);
          else ctx.lineTo(xs[i], y);
        }
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = lineAlpha;
        ctx.strokeStyle = gradient ?? '#fff';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    let running = false;
    let onScreen = true;
    const loop = (time: number) => {
      frame(time * 0.001);
      raf = requestAnimationFrame(loop);
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
      build();
      if (reducedMotion || !running) frame(0);
    };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.current.on =
        x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      mouse.current.x = x;
    };
    const onLeave = () => {
      mouse.current.on = false;
    };
    const onVis = () => {
      if (document.hidden || !onScreen) stop();
      else start();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    document.addEventListener('visibilitychange', onVis);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (reducedMotion) frame(0);
    else start();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 z-0 h-full w-full"
    />
  );
}

/* ----------------------------------------------------------------- */
/* One solution — alternating image / copy with parallax + reveal.     */
/* Odd rows flip sides and the image slides in from its outer edge,     */
/* so the page reads as a rhythmic left-right zig-zag down the screen.  */
/* ----------------------------------------------------------------- */
function SolutionBlock({
  card,
  index,
  reducedMotion,
}: {
  card: (typeof SOLUTION_CARDS)[number];
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const flip = index % 2 === 1;
  const num = String(index + 1).padStart(2, '0');

  return (
    <section
      id={solutionSlug(card.title)}
      ref={ref}
      className={`scroll-mt-28 px-[7vw] py-16 md:py-24 ${flip ? 'bg-white' : ''}`}
    >
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* ---------- media ---------- */}
        <motion.div
          initial={
            reducedMotion
              ? false
              : { opacity: 0, x: flip ? 48 : -48, scale: 0.96 }
          }
          whileInView={
            reducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }
          }
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.8, ease: EASE }}
          className={`relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-carbon shadow-[0_30px_80px_-32px_rgba(0,0,0,0.4)] ${
            flip ? 'md:order-2' : 'md:order-1'
          }`}
        >
          {card.image ? (
            <motion.img
              src={card.image}
              alt={card.title}
              loading="lazy"
              decoding="async"
              style={reducedMotion ? undefined : { y: imgY }}
              className="absolute inset-x-0 -top-[6%] h-[112%] w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-piano-fade" />
          )}
        </motion.div>

        {/* ---------- copy ---------- */}
        <motion.div
          variants={reducedMotion ? undefined : groupV}
          initial={reducedMotion ? false : 'hidden'}
          whileInView={reducedMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-18%' }}
          className={`relative ${flip ? 'md:order-1' : 'md:order-2'}`}
        >
          {/* oversized ghost number behind the copy */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-16 -z-0 select-none font-display text-[8rem] font-bold leading-none text-[#1d1d1f]/[0.05] md:text-[11rem]"
          >
            {num}
          </span>

          <motion.div variants={itemV} className="relative flex items-center gap-3">
            <span className="font-sans text-sm font-semibold tabular-nums text-champagne-deep">
              {num}
            </span>
            <span className="h-px w-10 bg-champagne-deep/40" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-champagne-deep">
              Solution
            </span>
          </motion.div>

          <motion.h2
            variants={itemV}
            className="display relative mt-5 text-3xl md:text-4xl lg:text-5xl"
          >
            {card.title}
          </motion.h2>

          <motion.p
            variants={itemV}
            className="relative mt-6 max-w-xl font-sans text-base leading-relaxed text-[#1d1d1f]/70 md:text-lg"
          >
            <span className="font-semibold text-carbon">{card.lead}</span>{' '}
            {card.rest}
          </motion.p>

          <motion.div variants={itemV} className="relative mt-8">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-champagne-deep/30 px-6 py-2.5 font-sans text-sm font-medium text-champagne-deep transition-colors hover:bg-champagne-deep hover:text-white"
            >
              Discuss this solution
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function SolutionsPageView() {
  const reducedMotion = useExperience((s) => s.reducedMotion);

  return (
    <>
      <Navigation />

      <main id="top" className="section-light relative z-10 overflow-hidden">
        {/* ============================ HERO ============================ */}
        <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-piano px-[7vw] text-center">
          {/* live acoustics ripple field */}
          <HeroAcoustics reducedMotion={reducedMotion} />

          {/* centre scrim so the headline stays legible over the field */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'radial-gradient(ellipse 60% 54% at 50% 46%, rgba(0,0,0,0.7), rgba(0,0,0,0.28) 58%, transparent 100%)',
            }}
          />

          {/* copy */}
          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            animate={reducedMotion ? undefined : 'show'}
            className="relative z-10 mx-auto max-w-3xl"
          >
            <motion.p
              variants={itemV}
              className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-champagne"
            >
              Our Solutions
            </motion.p>
            <motion.h1
              variants={itemV}
              className="display mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ color: 'var(--ivory)' }}
            >
              Designed to be seen.
              <br />
              Engineered to be{' '}
              <span className="text-gold text-gold-sweep">heard</span>.
            </motion.h1>
            <motion.p
              variants={itemV}
              className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ivory/65 md:text-lg"
            >
              Eleven home-cinema disciplines — from a luxury home theatre to a
              dedicated private cinema — designed, installed and calibrated end
              to end by Cinesphere.
            </motion.p>
            <motion.div variants={itemV} className="mt-9 flex justify-center">
              <a
                href={`#${solutionSlug(SOLUTION_CARDS[0].title)}`}
                className="group inline-flex flex-col items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-ivory/50 transition-colors hover:text-ivory"
              >
                Scroll to explore
                <motion.span
                  aria-hidden
                  animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  ↓
                </motion.span>
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ====================== SOLUTION BLOCKS ====================== */}
        {SOLUTION_CARDS.map((card, i) => (
          <SolutionBlock
            key={card.title}
            card={card}
            index={i}
            reducedMotion={reducedMotion}
          />
        ))}

        {/* ============================ CTA ============================ */}
        <section className="px-4 py-16 sm:px-8 md:px-[6vw] md:py-20">
          <div className="relative overflow-hidden rounded-[2rem] px-6 py-20 text-center md:rounded-[2.75rem] md:px-16 md:py-24">
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
                Let&apos;s design your system.
              </motion.h2>
              <motion.p
                variants={itemV}
                className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-ivory/70"
              >
                Tell us about your space and how you want it to feel — our team
                will get back to you within a working day.
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
          </div>
        </section>
      </main>

      <FooterSection />
    </>
  );
}
