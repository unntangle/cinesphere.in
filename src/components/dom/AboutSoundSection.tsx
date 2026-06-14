'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * AboutSoundSection — Scene 02 (About Us)
 * ----------------------------------------
 * The 12y-section headphones image fills the stage behind a dark
 * cinematic grade, and an ELECTRIC AUDIO SIGNAL — a glowing, crackling
 * waveform with phosphor trails — arcs between the ear cups. The copy
 * sits above, with a counting "12+ Years of Experience" gold highlight.
 */

const GOLD_CORE = '238,220,181';
const GOLD_MID = '205,178,133';
const GOLD_DEEP = '154,127,84';
const GOLD_HOT = '249,240,220'; // near-white hot core

/** Deterministic pseudo-random — stable per (i, seed) pair. */
function hash(i: number, seed: number) {
  const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const smooth = (p: number) => p * p * (3 - 2 * p);

/** Count-up number — runs 0 → `to` when it scrolls into view. */
function CountUp({ to, paused }: { to: number; paused: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [val, setVal] = useState(paused ? to : 0);

  useEffect(() => {
    if (paused) {
      setVal(to);
      return;
    }
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const DURATION = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, paused]);

  return <span ref={ref}>{val}</span>;
}

/* ------------------------------------------------------------------ */
/* Cinematic electric signal                                           */
/* ------------------------------------------------------------------ */

function ElectricWaveCanvas({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const STEPS = 220;

    /** Fixed programme level — constant tall waves, no swelling/quieting. */
    const dynamics = (_t: number) => 0.95;

    /** Build the signal. Crackle noise is INTERPOLATED between frames so
     *  the line writhes smoothly instead of strobing — far more filmic. */
    const buildPath = (t: number) => {
      const mid = h / 2;
      const fFrame = t * 16;
      const f0 = Math.floor(fFrame);
      const frac = smooth(fFrame - f0);
      const master = dynamics(t);
      const pts: [number, number][] = [];

      for (let i = 0; i <= STEPS; i++) {
        const u = i / STEPS;
        const env = Math.pow(Math.sin(Math.PI * u), 0.85);

        const cell = Math.floor(u * 26);
        const burst = hash(cell, Math.floor(t * 4)) > 0.74 ? 1.15 : 0.45;

        const tone =
          Math.sin(u * 46 + t * 2.6) * 0.4 + Math.sin(u * 95 - t * 4.2) * 0.25;
        const crackle =
          (lerp(hash(i, f0), hash(i, f0 + 1), frac) - 0.5) * 1.0;

        const y = mid + (tone + crackle) * env * burst * master * (h * 0.2);
        pts.push([u * w, y]);
      }
      return { pts, master };
    };

    const strokePath = (pts: [number, number][]) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
    };

    const drawFrame = (t: number, trails: boolean) => {
      const mid = h / 2;

      if (trails) {
        // Short phosphor persistence — a whisper of afterimage, not a blob.
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      const { pts, master } = buildPath(t);

      // Breathing light pool beneath the energy centre.
      const pool = ctx.createRadialGradient(w / 2, mid, 0, w / 2, mid, w * 0.42);
      pool.addColorStop(0, `rgba(${GOLD_DEEP},${0.04 * master})`);
      pool.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, w, h);

      // Baseline carrier through the cups.
      const base = ctx.createLinearGradient(0, 0, w, 0);
      base.addColorStop(0, `rgba(${GOLD_MID},0)`);
      base.addColorStop(0.5, `rgba(${GOLD_MID},0.3)`);
      base.addColorStop(1, `rgba(${GOLD_MID},0)`);
      ctx.strokeStyle = base;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      // Temperature-graded glow — restrained.
      // 1) Deep warm bloom, very soft.
      ctx.filter = 'blur(12px)';
      ctx.strokeStyle = `rgba(${GOLD_DEEP},${0.14 * master})`;
      ctx.lineWidth = 5;
      strokePath(pts);

      // 2) Gold halo.
      ctx.filter = 'blur(4px)';
      ctx.strokeStyle = `rgba(${GOLD_MID},${0.25 * master})`;
      ctx.lineWidth = 2;
      strokePath(pts);

      // 3) Fine core with a modest bloom.
      ctx.filter = 'blur(0.4px)';
      ctx.strokeStyle = `rgba(${GOLD_HOT},${0.8 * Math.min(1, master + 0.1)})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = `rgba(${GOLD_CORE},0.6)`;
      ctx.shadowBlur = 9;
      strokePath(pts);
      ctx.shadowBlur = 0;
      ctx.filter = 'none';
    };

    if (paused) {
      drawFrame(2300, false);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    // Only animate while on screen — the per-frame blur/shadow work here is
    // expensive, so suspending it off-screen keeps scrolling smooth.
    let running = false;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      drawFrame(time / 1000, true);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: '150px' },
    );
    io.observe(canvas);

    return () => {
      stopLoop();
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

/* ------------------------------------------------------------------ */

export function AboutSoundSection({ scene }: { scene: SceneDef }) {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const { copy } = scene;

  // Orchestrated reveal — children stagger in as the section enters view.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  // Eyebrow: letters breathe IN from wide tracking, like a film title card.
  const eyebrowV = {
    hidden: { opacity: 0, letterSpacing: '0.6em' },
    show: {
      opacity: 1,
      letterSpacing: '0.02em',
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    },
  };
  // Title words: rise out of blur one by one — a focus pull per word.
  const wordV = {
    hidden: { opacity: 0, y: '0.6em', filter: 'blur(10px)' },
    show: {
      opacity: 1,
      y: '0em',
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };
  // Gold highlight: racks into focus from oversized blur — a lens pull.
  const goldV = {
    hidden: { opacity: 0, scale: 1.18, filter: 'blur(14px)' },
    show: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };
  // Body: quiet drift up out of soft blur.
  const bodyV = {
    hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const titleWords = copy.title.split(' ');

  return (
    <section
      id={scene.id}
      data-scene={scene.index}
      className="relative -mt-[60vh] flex min-h-screen w-full items-center justify-center overflow-hidden bg-piano py-32"
    >
      {/* Background image, graded dark so the theme stays seamless. */}
      <img
        src="/images/12y-section.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-90 md:opacity-60"
        draggable={false}
      />
      {/* Cinematic grade: vignette + centre clarity for the copy.
          MOBILE-ONLY: the wide background gets cropped to a narrow strip on
          phones, so it uses a lighter wash to stay visible. Desktop keeps
          its original, deeper grade unchanged. */}
      <div
        aria-hidden
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.72) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Electric signal — a compact, intense burst sitting only in the
          gap between the ear cups, like the reference. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[78%] z-0 h-36 w-[44vw] -translate-x-1/2 -translate-y-1/2 md:h-44 md:w-[17vw] md:max-w-sm"
      >
        <ElectricWaveCanvas paused={reducedMotion} />
      </div>

      {/* Centre copy — orchestrated cinematic text reveal. */}
      <motion.div
        variants={reducedMotion ? undefined : container}
        initial={reducedMotion ? undefined : 'hidden'}
        whileInView={reducedMotion ? undefined : 'show'}
        viewport={{ once: true, margin: '-20%' }}
        className="relative z-10 max-w-3xl px-6 text-center"
      >
        {copy.eyebrow && (
          <motion.p variants={eyebrowV} className="eyebrow">
            {copy.eyebrow}
          </motion.p>
        )}

        {/* Title — each word pulls into focus in sequence. */}
        <h2 className="display mt-4 text-xl md:text-2xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={wordV}
              className="inline-block will-change-transform"
            >
              {word}
              {i < titleWords.length - 1 ? '\u00A0' : ''}
            </motion.span>
          ))}
        </h2>

        {/* The highlight — racks into focus, then counts up + sheen sweep. */}
        <motion.p
          variants={goldV}
          className="text-gold text-gold-sweep display mt-6 text-3xl will-change-transform md:mt-8 md:text-5xl"
        >
          <CountUp to={12} paused={reducedMotion} />+ Years of Experience
        </motion.p>

        {copy.body && (
          <motion.p
            variants={bodyV}
            className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ivory-muted md:text-lg"
          >
            {copy.body}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
