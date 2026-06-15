'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import { BRANDS, type Brand } from '@/lib/brands';
import { useExperience } from '@/store/useExperience';

/**
 * BrandsPageView — the dedicated /brands page.
 * --------------------------------------------
 * A light, editorial showcase of the audio brands Cinesphere carries:
 *   • a hero with a generative audio-reactive waveform on pure black,
 *   • a Focal spotlight wrapped in a radial audio spectrum,
 *   • a staggered grid of white logo cards,
 *   • a dark cinema CTA.
 *
 * Every section reveals on scroll via a shared blur-and-rise motion system
 * (see groupV / itemV / panelV / cardsV below), with staggered children for
 * an orchestrated, premium feel. All of it collapses to nothing under
 * prefers-reduced-motion.
 *
 * Brand data is shared with the nav dropdown via src/lib/brands.ts.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* Dark, premium background image for the CTA (Unsplash — cinema hall). */
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1759230766134-e3ff1c27d20e?auto=format&fit=crop&w=1600&q=80';

/* ----------------------------------------------------------------- */
/* Shared scroll-reveal orchestration                                */
/* ----------------------------------------------------------------- */
/* A parent stage that staggers its children. */
const groupV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
/* The signature reveal: rise up out of a soft blur. */
const itemV = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE },
  },
};
/* The Focal panel reveals as a whole (scale + blur), then staggers its copy. */
const panelV = {
  hidden: { opacity: 0, y: 40, scale: 0.985, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: EASE,
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};
/* Roster grid — a tighter stagger so cards ripple in. */
const cardsV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const cardV = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

/* ----------------------------------------------------------------- */
/* Sound visual helpers                                              */
/* ----------------------------------------------------------------- */

/**
 * HeroWave — a premium audio-reactive waveform rendered to a <canvas>.
 *
 * Many ultra-thin spline lines form one flowing ribbon. Each line samples a
 * superposition of harmonics:
 *   y = 0.8·sin(x+t) + 0.5·sin(2.3x−0.7t) + 0.3·sin(4.7x+1.2t) + 0.2·sin(8.1x−2.4t)
 * so several frequencies interfere — slow waves carry faster oscillations,
 * peaks travel, merge and dissolve. A centre envelope concentrates amplitude
 * in the middle; lines fan out there. Colour flows blue → cyan → violet →
 * magenta → white → orange → red across the frame. Drawn with additive
 * blending on black so overlaps bloom to soft white. Frozen for reduced motion.
 */
function HeroWave({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;

    const LINES = 84; // number of parallel contour lines
    const SPAN = 11; // wave cycles across the frame
    const STEP = 5; // px sampling step
    // Decorative, glow-heavy canvas — the costly part each frame is additively
    // blending 84 wide strokes, which is fill-rate (pixel-count) bound, not
    // CPU bound. So we render the backing store BELOW the display resolution
    // and let the browser upscale it; the soft bloom hides the difference
    // entirely. Lower this toward ~0.6 if a machine still struggles; raise it
    // toward 1 for more crispness.
    const RENDER_SCALE = 0.85;

    // ---- Precomputed, resolution-dependent lookup tables -----------------
    // Anything that doesn't change frame-to-frame is computed once per resize:
    // the per-column x positions, the centre envelope, and the sin/cos of each
    // harmonic at every column. In the loop we then rebuild each sample with
    // angle addition — sin(x+φ) = sin x·cos φ + cos x·sin φ — so the only trig
    // we do per frame is a handful of phase constants per line, instead of
    // ~190k Math.sin / Math.exp calls. That's what keeps the ribbon at 60fps.
    let cols = 0;
    let pxArr = new Float32Array(0);
    let envArr = new Float32Array(0);
    let s1 = new Float32Array(0);
    let c1 = new Float32Array(0);
    let s2 = new Float32Array(0);
    let c2 = new Float32Array(0);
    let s3 = new Float32Array(0);
    let c3 = new Float32Array(0);
    let s4 = new Float32Array(0);
    let c4 = new Float32Array(0);
    let gradient: CanvasGradient | null = null;

    const makeGradient = () => {
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0.0, 'rgba(0,180,255,1)'); // electric blue
      g.addColorStop(0.16, 'rgba(40,210,255,1)'); // cyan
      g.addColorStop(0.32, 'rgba(150,100,255,1)'); // violet
      g.addColorStop(0.44, 'rgba(255,90,220,1)'); // magenta
      g.addColorStop(0.5, 'rgba(255,255,255,1)'); // soft white centre
      g.addColorStop(0.64, 'rgba(255,150,60,1)'); // orange
      g.addColorStop(0.82, 'rgba(255,60,45,1)'); // red
      g.addColorStop(1.0, 'rgba(255,42,42,1)'); // deep red
      return g;
    };

    const buildTables = () => {
      cols = Math.floor(W / STEP) + 1;
      pxArr = new Float32Array(cols);
      envArr = new Float32Array(cols);
      s1 = new Float32Array(cols);
      c1 = new Float32Array(cols);
      s2 = new Float32Array(cols);
      c2 = new Float32Array(cols);
      s3 = new Float32Array(cols);
      c3 = new Float32Array(cols);
      s4 = new Float32Array(cols);
      c4 = new Float32Array(cols);
      for (let k = 0; k < cols; k++) {
        const px = k * STEP;
        const u = px / W;
        const x = u * SPAN;
        pxArr[k] = px;
        envArr[k] = Math.exp(-Math.pow((u - 0.5) / 0.33, 2)); // centre emphasis
        s1[k] = Math.sin(x);
        c1[k] = Math.cos(x);
        s2[k] = Math.sin(2.3 * x);
        c2[k] = Math.cos(2.3 * x);
        s3[k] = Math.sin(4.7 * x);
        c3[k] = Math.cos(4.7 * x);
        s4[k] = Math.sin(8.1 * x);
        c4[k] = Math.cos(8.1 * x);
      }
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
      gradient = makeGradient(); // cache — the colour stops don't change
      buildTables();
    };
    resize();

    const renderFrame = (t: number) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = gradient ?? '#fff';
      ctx.globalAlpha = 0.18;

      const cx = H / 2;
      const bandSpread = H * 0.4; // how far the ribbon fans vertically
      const ampPx = H * 0.2; // wave amplitude in px

      for (let i = 0; i < LINES; i++) {
        const norm = i / (LINES - 1) - 0.5; // -0.5 .. 0.5
        const lt = t + norm * 1.6; // per-line phase → interference + parallax

        // Phase constants for this line — computed once, then reused across
        // every column via angle addition (no per-pixel trig).
        const a1c = Math.cos(lt);
        const a1s = Math.sin(lt);
        const a2c = Math.cos(0.7 * lt);
        const a2s = Math.sin(0.7 * lt);
        const a3c = Math.cos(1.2 * lt);
        const a3s = Math.sin(1.2 * lt);
        const a4c = Math.cos(2.4 * lt);
        const a4s = Math.sin(2.4 * lt);
        const spreadBase = norm * bandSpread;

        ctx.beginPath();
        for (let k = 0; k < cols; k++) {
          const env = envArr[k];
          // wave(u, lt) reconstructed from the precomputed basis:
          const w =
            0.8 * (s1[k] * a1c + c1[k] * a1s) +
            0.5 * (s2[k] * a2c - c2[k] * a2s) +
            0.3 * (s3[k] * a3c + c3[k] * a3s) +
            0.2 * (s4[k] * a4c - c4[k] * a4s);
          const y = cx + spreadBase * (0.5 + env) + w * ampPx * env;
          if (k === 0) ctx.moveTo(pxArr[k], y);
          else ctx.lineTo(pxArr[k], y);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    // ---- Animation loop — paused when offscreen or the tab is hidden ------
    let running = false;
    let onScreen = true;

    const loop = (time: number) => {
      renderFrame(time * 0.0006); // slow, hypnotic time scale
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
      resize();
      if (reducedMotion || !running) renderFrame(0);
    };
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      if (document.hidden || !onScreen) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Only burn frames while the hero is actually in the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (reducedMotion) renderFrame(0);
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

/** A logo on its chip (light backdrop for dark marks, dark for light ones). */
function LogoChip({
  brand,
  className = '',
  imgClassName = 'max-h-[56%] w-auto max-w-[72%]',
}: {
  brand: Brand;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={`flex items-center justify-center overflow-hidden ${
        brand.chip === 'dark' ? 'bg-[#141416]' : 'bg-white'
      } ${className}`}
    >
      <img
        src={brand.logo}
        alt={brand.name}
        loading="lazy"
        decoding="async"
        className={`object-contain ${imgClassName} ${brand.filter ?? ''}`}
        draggable={false}
      />
    </span>
  );
}

/* ----------------------------------------------------------------- */
/* Page                                                              */
/* ----------------------------------------------------------------- */

export function BrandsPageView() {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const featured = BRANDS.find((b) => b.featured) ?? BRANDS[0];
  const rest = BRANDS.filter((b) => !b.featured);

  return (
    <>
      <Navigation />

      <main id="top" className="section-light relative z-10 overflow-hidden">
        {/* ============================ HERO ============================ */}
        <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-black">
          {/* generative audio-reactive waveform on pure black */}
          <HeroWave reducedMotion={reducedMotion} />

          {/* left scrim so the copy stays crisp over the wave */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0) 62%)',
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
                Audio Partners
              </motion.p>

              <motion.h1
                variants={itemV}
                className="display mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ color: 'var(--ivory)' }}
              >
                The brands behind
                <br />
                the <span className="text-gold text-gold-sweep">sound</span>.
              </motion.h1>

              <motion.p
                variants={itemV}
                className="mt-6 max-w-md font-sans text-base leading-relaxed text-ivory/70 md:text-lg"
              >
                Cinesphere designs and tunes spaces around the world&apos;s
                finest audio names, each chosen for how faithfully it renders a
                performance, from the first whisper to the final note.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ===================== FOCAL SPOTLIGHT ===================== */}
        <section className="perf-section px-[7vw] pt-20 pb-12 md:pt-28 md:pb-14">
          <motion.div
            variants={reducedMotion ? undefined : panelV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-15%' }}
            className="relative overflow-hidden rounded-[2rem] bg-[#0c0c0e] px-6 py-10 sm:px-8 sm:py-12 md:px-14 md:py-16"
          >
            {/* champagne glow + oversized brand watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-12 -top-12 h-72 w-72 rounded-full opacity-40 blur-[90px]"
              style={{
                background:
                  'radial-gradient(circle, rgba(205,178,133,0.55), transparent 70%)',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 right-2 select-none font-display text-[9rem] font-bold leading-none text-white/[0.035] md:text-[14rem]"
            >
              {featured.name}
            </span>

            <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-12">
              {/* left — editorial copy (cascades in) */}
              <div>
                <motion.p
                  variants={itemV}
                  className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-champagne"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-champagne" />
                  Featured Partner
                </motion.p>
                <motion.h2
                  variants={itemV}
                  className="mt-5 font-display text-4xl font-semibold leading-none text-ivory sm:text-5xl md:text-6xl"
                >
                  {featured.name}
                </motion.h2>
                <motion.p
                  variants={itemV}
                  className="mt-2 font-display text-lg italic text-champagne/90"
                >
                  The Spirit of Sound
                </motion.p>

                <motion.div
                  variants={itemV}
                  className="mt-7 h-px w-full bg-gradient-to-r from-champagne/45 to-transparent"
                />

                <motion.p
                  variants={itemV}
                  className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ivory/65"
                >
                  {featured.blurb}
                </motion.p>

                {/* spec-sheet meta row */}
                <motion.dl
                  variants={itemV}
                  className="mt-8 grid max-w-md grid-cols-3 gap-4"
                >
                  {[
                    ['Origin', featured.origin],
                    ['Established', '1979'],
                    ['Discipline', 'Loudspeakers'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-sans text-[10px] font-semibold uppercase tracking-wider text-champagne/60">
                        {k}
                      </dt>
                      <dd className="mt-1 font-sans text-sm text-ivory/90">{v}</dd>
                    </div>
                  ))}
                </motion.dl>
              </div>

              {/* right — radial audio spectrum encircling the logo */}
              <motion.div
                variants={itemV}
                className="relative flex items-center justify-center py-4"
              >
                {/* responsive sizing wrapper: the dial uses fixed-px bars, so
                    we scale the whole 320px ring down on small screens and
                    size the layout box to match (no overflow on phones). */}
                <div className="relative h-[256px] w-[256px] sm:h-[300px] sm:w-[300px] md:h-[320px] md:w-[320px]">
                  <div className="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.8] sm:scale-[0.9375] md:scale-100">
                    <div className="relative h-[320px] w-[320px]">
                  {/* soft glow behind the logo */}
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-2xl"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(205,178,133,0.45), transparent 70%)',
                    }}
                  />
                  {/* radial spectrum bars */}
                  <div aria-hidden className="absolute inset-0">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const angle = (i / 64) * 360;
                      const len = 14 + 22 * Math.abs(Math.sin(i * 1.7 + 4));
                      const dur = 0.9 + ((i * 7 + 9) % 9) * 0.12;
                      const delay = ((i * 5) % 14) * 0.09;
                      return (
                        <span
                          key={i}
                          className="absolute left-1/2 top-1/2"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <span
                            className="eq-bar absolute rounded-full bg-gradient-to-t from-champagne/10 to-champagne"
                            style={{
                              left: '-1.5px',
                              bottom: '118px',
                              width: '3px',
                              height: `${len}px`,
                              transformOrigin: 'center bottom',
                              animationDuration: `${dur}s`,
                              animationDelay: `${delay}s`,
                            }}
                          />
                        </span>
                      );
                    })}
                  </div>
                  {/* logo tile in the centre */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LogoChip
                      brand={featured}
                      className="h-28 w-44 rounded-2xl ring-1 ring-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
                      imgClassName="max-h-[40%] w-auto max-w-[74%]"
                    />
                  </div>
                </div>
                  </div>
                  </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ===================== BRAND ROSTER GRID ===================== */}
        <section id="roster" className="perf-section px-[7vw] pb-28">
          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-10%' }}
            className="mb-8 flex flex-wrap items-end justify-between gap-6"
          >
            <div>
              <motion.p variants={itemV} className="eyebrow">
                The Roster
              </motion.p>
              <motion.h2
                variants={itemV}
                className="display mt-2 text-3xl md:text-4xl"
              >
                Every brand we carry.
              </motion.h2>
            </div>
            <motion.span
              variants={itemV}
              className="font-sans text-sm text-[#1d1d1f]/40"
            >
              {rest.length} brands
            </motion.span>
          </motion.div>

          {/* white logo cards — ripple in with a tight stagger */}
          <motion.div
            variants={reducedMotion ? undefined : cardsV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-8%' }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {rest.map((b) => (
              <motion.div
                key={b.name}
                variants={cardV}
                whileHover={reducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="group relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_2px_10px_-6px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_16px_44px_-20px_rgba(0,0,0,0.3)]"
              >
                {/* logo */}
                <img
                  src={b.logo}
                  alt={b.name}
                  loading="lazy"
                  decoding="async"
                  className={`relative z-10 max-h-[54%] w-auto max-w-[76%] object-contain transition-transform duration-500 group-hover:scale-[1.06] ${
                    b.filter ?? ''
                  }`}
                  draggable={false}
                />
              </motion.div>
            ))}
          </motion.div>
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
            <div className="absolute inset-0 bg-black/70" />
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
              Hear them in your space.
            </motion.h2>
            <motion.p
              variants={itemV}
              className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-ivory/70"
            >
              Tell us about your room and how you listen, we&apos;ll design a
              system around the brands that suit it best.
            </motion.p>
            <motion.div variants={itemV} className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-champagne-deep px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-champagne"
              >
                Book a consultation
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
