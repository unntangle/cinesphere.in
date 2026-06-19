'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import { StatsBandSection } from './StatsBandSection';
import { SmoothScroll } from './SmoothScroll';
import { AboutHero } from './AboutHero';
import { useExperience } from '@/store/useExperience';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BRANDS, type Brand } from '@/lib/brands';

/**
 * AboutPageView — the dedicated /about page.
 * ------------------------------------------
 * A cinematic, scroll-driven brand story for Cinesphere, built entirely from
 * the site's own motion vocabulary so it reads as a native chapter of the
 * site rather than a bolt-on page. Several bespoke, scroll-linked moments
 * give it its own character:
 *
 *   1. Hero               — scroll-scrubbed about-hero film (canvas frames,
 *                           with a graceful .mov + poster fallback).
 *   2. Reading spotlight  — the manifesto lights word-by-word as you scroll
 *                           through it, like a beam moving across the line.
 *   3. Who we are + stats  — narrative, a count-up 12+ highlight, stats band.
 *   4. Signal cable        — a vertical process rail down which a champagne
 *                           pulse travels, igniting each stage as it passes.
 *   5. What we obsess over  — pointer-reactive tilt cards with live equalizers.
 *   6. The room disappears  — cinematic interstitial; the space dissolves into
 *                           a bloom of sound.
 *   7. Credentials          — Focal + Harman Kardon authority.
 *   8. What we do           — the nine solutions as a velocity-aware marquee.
 *   9. CTA                  — "make your space unforgettable".
 *
 * Everything degrades gracefully under prefers-reduced-motion.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* next/image serves resized, modern-format (AVIF/WebP) versions of the heavy */
/* local stills (the auditorium interstitial + the two brand speaker renders) */
/* at request time. motion.create wraps the optimised <Image> so it stays     */
/* animatable for the parallax drift and wireframe→mesh cross-fade.           */
const MotionImage = motion.create(Image);

/* Shared scroll-reveal orchestration (matches the Clients / Brands pages). */
const groupV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};
const cardV: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  show: (col: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: col * 0.08 },
  }),
};

/* Per-stage copy reveal — title then body slide outward from the centre   */
/* cable (each side away from the line) and resolve into place on scroll.   */
const copyGroupV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const slideFromCenterV: Variants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 64, filter: 'blur(6px)' }),
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE },
  },
};

/* ----------------------------------------------------------------- */
/* Count-up — drives the 12+ years highlight when it scrolls in.     */
/* ----------------------------------------------------------------- */
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
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, paused]);

  return <span ref={ref}>{val}</span>;
}

/* ----------------------------------------------------------------- */
/* ExperienceDial — a studio "gain dial": a ring of gold ticks lights */
/* up in a radial sweep, a champagne arc draws itself around the rim, */
/* and the years count up in the centre. A bespoke, on-brand reveal.  */
/* ----------------------------------------------------------------- */
function ExperienceDial({ reducedMotion }: { reducedMotion: boolean }) {
  const TICKS = 60;
  const ticks = Array.from({ length: TICKS });

  const ringV = {
    hidden: {},
    show: { transition: { staggerChildren: 0.012, delayChildren: 0.15 } },
  };
  const tickV = {
    hidden: { opacity: 0.07 },
    show: (major: boolean) => ({
      opacity: major ? 1 : 0.5,
      transition: { duration: 0.4, ease: EASE },
    }),
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[400px]">
      {/* Champagne glow seated behind the dial. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_center,rgba(205,178,133,0.20),transparent_62%)] blur-2xl"
      />

      {/* Rotating tick bezel — a square layer spun around its centre so   */}
      {/* the whole ring of ticks turns in a continuous loop. Rotating an  */}
      {/* HTML div is reliable (centre origin); an SVG <g> is not.         */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={reducedMotion ? undefined : { duration: 20, ease: 'linear', repeat: Infinity }}
      >
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <motion.g
            variants={reducedMotion ? undefined : ringV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-20%' }}
          >
            {ticks.map((_, i) => {
              const major = i % 5 === 0;
              const angle = i * (360 / TICKS);
              const y2 = 52 + (major ? 20 : 11);
              return (
                <motion.line
                  key={i}
                  x1="200"
                  y1="52"
                  x2="200"
                  y2={y2}
                  stroke={major ? '#eedcb5' : '#cdb285'}
                  strokeWidth={major ? 2.4 : 1.4}
                  strokeLinecap="round"
                  transform={`rotate(${angle} 200 200)`}
                  custom={major}
                  variants={reducedMotion ? undefined : tickV}
                  style={reducedMotion ? { opacity: major ? 1 : 0.5 } : undefined}
                />
              );
            })}
          </motion.g>
        </svg>
      </motion.div>

      {/* Static dial face — guides, soft core, and the inner ring. */}
      <svg aria-hidden viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="dial-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a7f54" />
            <stop offset="50%" stopColor="#eedcb5" />
            <stop offset="100%" stopColor="#cdb285" />
          </linearGradient>
          <radialGradient id="dial-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(205,178,133,0.16)" />
            <stop offset="100%" stopColor="rgba(205,178,133,0)" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(245,245,247,0.06)" strokeWidth="1" />
        <circle cx="200" cy="200" r="120" fill="url(#dial-core)" />

        {reducedMotion ? (
          <circle cx="200" cy="200" r="120" fill="none" stroke="url(#dial-arc)" strokeWidth="3" />
        ) : (
          <motion.circle
            cx="200"
            cy="200"
            r="120"
            fill="none"
            stroke="url(#dial-arc)"
            strokeWidth="3"
            strokeLinecap="round"
            transform="rotate(-90 200 200)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 1.8, ease: EASE, delay: 0.25 }}
          />
        )}
      </svg>

      {/* Glowing head orbiting the ring — its own spun layer. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={reducedMotion ? undefined : { duration: 9, ease: 'linear', repeat: Infinity }}
      >
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <circle cx="200" cy="80" r="9" fill="#eedcb5" opacity="0.25" />
          <circle cx="200" cy="80" r="5" fill="#eedcb5" />
        </svg>
      </motion.div>

      {/* Centre read-out — HTML over the SVG for crisp type. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-rainbow text-rainbow-sweep display text-7xl leading-none md:text-8xl">
          <CountUp to={12} paused={reducedMotion} />+
        </span>
        <span className="eyebrow mt-3 uppercase text-ivory-faint">Years of experience</span>
        <span className="mt-2 font-sans text-[11px] tracking-wide text-champagne/70">
          of finest audio artistry
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Content                                                            */
/* ----------------------------------------------------------------- */

/** Manifesto lines — revealed letter-by-letter as a reading beam sweeps. */
const MANIFESTO_LINES = [
  'We don’t sell speakers.',
  'We engineer the moment a room',
  'disappears, and only the',
  'sound and the picture remain.',
];

const PROCESS = [
  {
    no: '01',
    title: 'Listen',
    body: 'We start in your space, not a showroom, learning how you’ll live in the room, the acoustics you’re fighting, and the experience you’re really after.',
  },
  {
    no: '02',
    title: 'Design',
    body: 'We draft the system end-to-end: placement, sightlines, calibration targets and cable routes, modelled before a single bracket is drilled.',
  },
  {
    no: '03',
    title: 'Engineer',
    body: 'Premium hardware from the brands we’re certified to carry, installed cleanly and invisibly. The technology hides; only the result shows.',
  },
  {
    no: '04',
    title: 'Calibrate',
    body: 'Every install is tuned by ear and by instrument until the sound is honest and the image is true, the line between “works” and “unforgettable”.',
  },
  {
    no: '05',
    title: 'Support',
    body: 'We stay on the line long after handover. One accountable team that picks up the phone, for a listening room or a full auditorium.',
  },
];

const VALUES = [
  {
    title: 'Acoustic honesty',
    body: 'Sound the way it was recorded, no gimmicks, no false loudness. Just clarity you can trust across the whole frequency range.',
  },
  {
    title: 'Invisible engineering',
    body: 'The best install is the one you never notice. Clean lines, hidden cabling, hardware that melts into the architecture.',
  },
  {
    title: 'One accountable team',
    body: 'Design, wiring and calibration under one roof. No finger-pointing between vendors, a single team that owns the result.',
  },
  {
    title: 'Care after the install',
    body: 'Our relationship doesn’t end at handover. We’re reachable, responsive and invested in how your system performs for years.',
  },
];

const CREDENTIALS = [
  {
    name: 'Focal',
    role: 'Certified Partner',
    logo: '/images/focal-logo.webp',
    tag: 'Reference loudspeakers',
    blurb:
      'Authorised to specify and install Focal’s reference loudspeakers, French acoustic engineering at the very top of the high-fidelity world.',
    // A bright, articulate response curve — Focal's high-fidelity character.
    signature:
      'M4 44 C 44 44 60 43 92 42 S 156 41 188 37 C 214 34 236 24 262 19 C 282 15 300 22 316 18',
    end: [316, 18] as number[],
  },
  {
    name: 'Harman Kardon',
    role: 'Authorized Dealer',
    logo: '/images/Harman_kardon_Logo.webp',
    tag: 'Integrated audio',
    blurb:
      'Beautiful sound, beautifully made. Official Harman Kardon audio, delivered, integrated and calibrated by Cinesphere.',
    // A warm, rounded response curve — Harman's smooth, musical voicing.
    signature:
      'M4 32 C 28 24 52 22 82 26 C 112 30 132 41 162 43 S 222 41 252 44 C 278 46 300 45 316 42',
    end: [316, 42] as number[],
  },
];

/* ----------------------------------------------------------------- */
/* WaveformUnderline — a gold sound-wave that draws itself in.        */
/* ----------------------------------------------------------------- */
function WaveformUnderline({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 24"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-3 left-0 h-3 w-full overflow-visible md:-bottom-4 md:h-4"
    >
      <motion.path
        d="M2 12 C 22 1, 38 23, 58 12 S 96 1, 116 12 S 152 23, 172 12 S 210 1, 230 12 S 266 23, 286 12 S 312 4, 318 12"
        fill="none"
        stroke="url(#about-wave-gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={reducedMotion ? undefined : { pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.5 }}
      />
      <defs>
        <linearGradient id="about-wave-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a7f54" />
          <stop offset="50%" stopColor="#eedcb5" />
          <stop offset="100%" stopColor="#9a7f54" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ----------------------------------------------------------------- */
/* SpotChar — one manifesto letter whose colour/opacity is driven by  */
/* a shared scroll MotionValue, so a "reading beam" sweeps the line    */
/* letter-by-letter, brightening each character up to white.          */
/* ----------------------------------------------------------------- */
function SpotChar({
  char,
  progress,
  range,
}: {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, ['#55555a', '#e4d2ac']);
  const opacity = useTransform(progress, range, [0.5, 1]);
  return (
    <motion.span style={{ color, opacity }} className="inline-block">
      {char}
    </motion.span>
  );
}

/* ----------------------------------------------------------------- */
/* SpotlightManifesto — the statement of intent, lit word-by-word as  */
/* you scroll through it. A bespoke, scroll-linked reveal.            */
/* ----------------------------------------------------------------- */
function SpotlightManifesto({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 55%'],
  });
  const beam = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    restDelta: 0.001,
  });

  // Total visible characters across all lines drive an even letter-by-letter
  // sweep; a small window lights a few letters at once for a soft beam edge.
  const totalChars = MANIFESTO_LINES.reduce(
    (sum, line) => sum + line.replace(/\s/g, '').length,
    0,
  );
  const windowSize = 7;
  const span = totalChars + windowSize;
  let charIndex = -1; // running index, assigned in render order

  return (
    <section className="relative bg-piano px-[7vw] py-28 md:py-40">
      <div ref={ref} className="mx-auto max-w-4xl">
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="eyebrow"
        >
          Our reason for being
        </motion.p>

        <h2 className="display mt-6 text-3xl leading-[1.18] text-ivory sm:text-4xl md:text-5xl lg:text-[3.6rem]">
          {reducedMotion ? (
            <span className="text-champagne">
              We don’t sell speakers. We engineer the moment a room disappears,
              and only the sound and the picture remain.
            </span>
          ) : (
            MANIFESTO_LINES.map((line, li) => (
              <span key={li} className="block">
                {line.split(' ').map((word, wi, words) => (
                  <Fragment key={wi}>
                    <span className="inline-block whitespace-nowrap">
                      {word.split('').map((ch, ci) => {
                        charIndex += 1;
                        const start = charIndex / span;
                        const end = (charIndex + windowSize) / span;
                        return (
                          <SpotChar
                            key={ci}
                            char={ch}
                            progress={beam}
                            range={[start, end]}
                          />
                        );
                      })}
                    </span>
                    {wi < words.length - 1 ? ' ' : ''}
                  </Fragment>
                ))}
              </span>
            ))
          )}
        </h2>

        {/* Gold waveform settles in beneath the statement — a signal at rest. */}
        <div className="relative mt-8 h-4 max-w-md">
          <WaveformUnderline reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* CableStage — one stop on the vertical signal cable. Its node       */
/* ignites (glow + lift) as the champagne pulse passes it.            */
/* ----------------------------------------------------------------- */
function CableStage({
  step,
  index,
  total,
  fill,
  reducedMotion,
}: {
  step: (typeof PROCESS)[number];
  index: number;
  total: number;
  fill: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const at = (index + 0.5) / total;
  const lit = useTransform(fill, [at - 0.08, at + 0.02], [0, 1]);
  const glow = useTransform(lit, [0, 1], [0, 1]);
  const nodeScale = useTransform(lit, [0, 1], [1, 1.12]);
  const left = index % 2 === 0;

  return (
    <motion.li
      initial={reducedMotion ? false : { opacity: 0 }}
      whileInView={reducedMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -16% 0px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`relative flex items-start gap-6 md:gap-0 ${
        left ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Copy — one half on desktop, full width with left rail on mobile. */}
      <motion.div
        variants={reducedMotion ? undefined : copyGroupV}
        custom={left ? 1 : -1}
        initial={reducedMotion ? false : 'hidden'}
        whileInView={reducedMotion ? undefined : 'show'}
        viewport={{ once: true, margin: '0px 0px -18% 0px' }}
        className={`order-2 flex-1 pb-14 md:order-none md:pb-20 ${
          left ? 'md:pr-24 md:text-right' : 'md:pl-24 md:text-left'
        }`}
      >
        <motion.h3
          variants={reducedMotion ? undefined : slideFromCenterV}
          custom={left ? 1 : -1}
          className="display text-2xl md:text-3xl"
        >
          {step.title}
        </motion.h3>
        <motion.p
          variants={reducedMotion ? undefined : slideFromCenterV}
          custom={left ? 1 : -1}
          className={`mt-3 font-sans text-sm leading-relaxed text-[#1d1d1f]/65 md:text-[0.95rem] ${
            left ? 'md:ml-auto' : ''
          } max-w-sm`}
        >
          {step.body}
        </motion.p>
      </motion.div>

      {/* Node — pinned to the rail's true centre (matches the cable and    */}
      {/* travelling pulse) so every stage sits dead-on the line, regardless */}
      {/* of which side the copy is on. */}
      <div className="relative z-10 order-1 flex-none md:absolute md:left-1/2 md:top-0 md:order-none md:w-14 md:-translate-x-1/2">
        <motion.span
          style={reducedMotion ? undefined : { scale: nodeScale }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-champagne/50 bg-[#f7f2e8] font-sans text-sm font-semibold text-champagne-deep shadow-[0_4px_14px_-6px_rgba(154,127,84,0.55)]"
        >
          {step.no}
          {/* Ignition glow ring — opacity rides the pulse. */}
          <motion.span
            aria-hidden
            style={reducedMotion ? { opacity: 0.6 } : { opacity: glow }}
            className="absolute inset-0 rounded-full shadow-[0_0_0_5px_rgba(205,178,133,0.20),0_0_26px_8px_rgba(205,178,133,0.5)]"
          />
          {/* Sonar ripples — the stage rings out as the sound arrives. */}
          {!reducedMotion && (
            <motion.span
              aria-hidden
              style={{ opacity: glow }}
              className="pointer-events-none absolute inset-0"
            >
              {[0, 0.9].map((d, i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-champagne/50"
                  animate={{ scale: [1, 2.3], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity, delay: d }}
                />
              ))}
            </motion.span>
          )}
        </motion.span>
      </div>

      {/* Spacer for the opposite column on desktop. */}
      <div className="order-3 hidden flex-1 md:order-none md:block" />
    </motion.li>
  );
}

/* ----------------------------------------------------------------- */
/* SignalCable — vertical process rail. A faint track runs down the   */
/* centre; a gold line draws as you scroll; a glowing pulse rides its */
/* leading edge, lighting each stage in turn.                         */
/* ----------------------------------------------------------------- */
function SignalCable({ reducedMotion }: { reducedMotion: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 72%', 'end 72%'],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });
  const pulseTop = useTransform(fill, (v) => `${v * 100}%`);

  return (
    <section className="section-light perf-section relative overflow-hidden px-[7vw] py-24 md:py-32">
      <motion.div
        variants={reducedMotion ? undefined : groupV}
        initial={reducedMotion ? false : 'hidden'}
        whileInView={reducedMotion ? undefined : 'show'}
        viewport={{ once: true, margin: '-15%' }}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.p variants={itemV} className="eyebrow">
          The signal path
        </motion.p>
        <motion.h2 variants={itemV} className="display mt-3 text-3xl md:text-5xl">
          From silence to
          <br className="hidden sm:block" /> standing ovation.
        </motion.h2>
        <motion.p
          variants={itemV}
          className="mx-auto mt-4 max-w-lg font-sans text-sm leading-relaxed text-[#1d1d1f]/55 md:text-base"
        >
          Five deliberate stages that turn a raw space into an experience worth
          remembering, follow the signal as it travels.
        </motion.p>
      </motion.div>

      <div ref={railRef} className="relative mx-auto mt-16 max-w-5xl">
        {/* Centre cable — left rail on mobile, true centre on desktop. */}
        <div className="pointer-events-none absolute bottom-0 left-7 top-0 w-px md:left-1/2 md:-translate-x-1/2">
          <div className="absolute inset-0 bg-[#1d1d1f]/12" />
          <motion.div
            className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-champagne via-champagne-deep to-champagne"
            style={{ scaleY: reducedMotion ? 1 : fill }}
          />
          {!reducedMotion && (
            <motion.span
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: pulseTop }}
            >
              {/* Travelling sound head riding the leading edge. */}
              <span className="block h-2.5 w-2.5 rounded-full bg-champagne-deep shadow-[0_0_0_5px_rgba(205,178,133,0.22),0_0_24px_6px_rgba(205,178,133,0.6)]" />
              {/* Concentric waves radiating from the head as it travels —   */}
              {/* sound propagating down the signal path.                    */}
              {[0, 0.6, 1.2].map((delay, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-champagne/60"
                  animate={{ scale: [1, 7], opacity: [0.55, 0] }}
                  transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity, delay }}
                />
              ))}
            </motion.span>
          )}
        </div>

        <ol className="relative ml-0 list-none pl-0">
          {PROCESS.map((step, i) => (
            <CableStage
              key={step.no}
              step={step}
              index={i}
              total={PROCESS.length}
              fill={fill}
              reducedMotion={reducedMotion}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* TiltCard — value card that tips toward the cursor, with a live     */
/* equalizer accent that runs on hover.                               */
/* ----------------------------------------------------------------- */
function TiltCard({
  title,
  body,
  col,
  reducedMotion,
}: {
  title: string;
  body: string;
  col: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 150, damping: 18 });
  const sRotY = useSpring(rotY, { stiffness: 150, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const lx = e.clientX - r.left;
    const ly = e.clientY - r.top;
    const px = lx / r.width - 0.5;
    const py = ly / r.height - 0.5;
    rotY.set(px * 9);
    rotX.set(-py * 9);
    el.style.setProperty('--x', `${lx}px`);
    el.style.setProperty('--y', `${ly}px`);
  };
  const onLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  const eqBars = [0, 0.18, 0.36, 0.12, 0.28];

  return (
    <motion.div
      ref={ref}
      custom={col}
      variants={reducedMotion ? undefined : cardV}
      initial={reducedMotion ? false : 'hidden'}
      whileInView={reducedMotion ? undefined : 'show'}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reducedMotion
          ? undefined
          : { rotateX: sRotX, rotateY: sRotY, transformPerspective: 900 }
      }
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-7 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow] duration-300 [transform-style:preserve-3d] hover:border-champagne/50 hover:shadow-[0_22px_60px_-26px_rgba(205,178,133,0.6)] md:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(140px_140px_at_var(--x,50%)_var(--y,0%),rgba(205,178,133,0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div aria-hidden className="flex h-7 items-end gap-[3px]">
        {eqBars.map((d, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full bg-champagne-deep/70 ${
              reducedMotion
                ? ''
                : 'eq-bar [animation-play-state:paused] group-hover:[animation-play-state:running]'
            }`}
            style={{ height: `${42 + ((i * 31) % 58)}%`, animationDelay: `${d}s` }}
          />
        ))}
      </div>
      <h3 className="display mt-5 text-lg md:text-xl">{title}</h3>
      <p className="mt-2.5 font-sans text-sm leading-relaxed text-[#1d1d1f]/65">
        {body}
      </p>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- */
/* RoomDisappears — cinematic interstitial. The space parallax-drifts */
/* behind a deep grade while a bloom of equalizer light rises through */
/* it, delivering the manifesto: the room dissolves into pure sound.  */
/* ----------------------------------------------------------------- */
function RoomDisappears({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // The auditorium breathes slightly while the section is pinned.
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.26]);
  // Content slides up into place and stays visible while the room lights up.
  const contentY = useTransform(scrollYProgress, [0, 0.5], ['16%', '0%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section
      ref={ref}
      className={`relative w-full bg-piano ${reducedMotion ? '' : 'h-[200vh]'}`}
    >
      {/* Sticky frame — the auditorium pins to the viewport while the */}
      {/* content slides up through it as you scroll.                  */}
      <div
        className={`flex w-full items-center justify-center overflow-hidden px-[7vw] py-28 md:py-36 ${
          reducedMotion ? 'relative min-h-[88vh]' : 'sticky top-0 min-h-screen'
        }`}
      >
      <MotionImage
        src="/images/Our craft-image.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        quality={80}
        style={reducedMotion ? undefined : { scale: bgScale }}
        className="object-cover opacity-80"
        draggable={false}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.70) 100%)',
        }}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-piano to-transparent"
      />

      <motion.div
        style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-3xl text-center"
      >
        <motion.div
          variants={reducedMotion ? undefined : groupV}
          initial={reducedMotion ? false : 'hidden'}
          whileInView={reducedMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-20%' }}
        >
        <motion.p variants={itemV} className="eyebrow">
          Our craft, in one idea
        </motion.p>
        <motion.h2
          variants={itemV}
          className="display mt-5 text-3xl leading-[1.12] text-ivory sm:text-4xl md:text-6xl"
        >
          The best technology is the kind
          <br className="hidden sm:block" /> you{' '}
          <span className="text-gold text-gold-sweep">forget</span> is there.
        </motion.h2>
        <motion.p
          variants={itemV}
          className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ivory/70 md:text-lg"
        >
          When the wiring vanishes, the speakers melt into the walls and the
          calibration is honest, the equipment stops being the point. The room
          disappears, and the experience is all that’s left.
        </motion.p>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- */
/* CredentialCard — a certification plaque rather than a plain logo card.  */
/* A gold gleam orbits the border, a spinning wax-seal stamp marks it as   */
/* authorised, and a brand-specific frequency signature draws in along the */
/* foot — Cinesphere's calibration craft, expressed as an object.          */
/* ----------------------------------------------------------------- */
function CertSeal({
  index,
  reducedMotion,
}: {
  index: number;
  reducedMotion: boolean;
}) {
  const pathId = `cred-seal-${index}`;
  return (
    <span className="pointer-events-none relative block h-[68px] w-[68px] flex-none">
      {/* Soft gold bloom seated behind the stamp. */}
      <span
        aria-hidden
        className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_center,rgba(205,178,133,0.30),transparent_70%)] blur-[6px]"
      />
      {/* Spinning ring of certification micro-text. */}
      <motion.span
        aria-hidden
        className="absolute inset-0"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 18, ease: 'linear', repeat: Infinity }
        }
      >
        <svg viewBox="0 0 68 68" className="h-full w-full">
          <defs>
            <path
              id={pathId}
              d="M34 34 m -24 0 a 24 24 0 1 1 48 0 a 24 24 0 1 1 -48 0"
              fill="none"
            />
          </defs>
          <circle cx="34" cy="34" r="31" fill="none" stroke="rgba(205,178,133,0.32)" strokeWidth="1" />
          <circle cx="34" cy="34" r="20.5" fill="none" stroke="rgba(205,178,133,0.20)" strokeWidth="1" />
          <text
            fill="#cdb285"
            fontSize="6.1"
            letterSpacing="1.35"
            style={{ fontFamily: 'var(--font-sans), sans-serif', fontWeight: 600 }}
          >
            <textPath href={`#${pathId}`} startOffset="0">
              AUTHORIZED PARTNER · CINESPHERE ·
            </textPath>
          </text>
        </svg>
      </motion.span>
      {/* Static centre monogram — a gold verification tick. */}
      <span className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
          <path
            d="M5 12.5 L10 17.5 L19 7"
            fill="none"
            stroke="#eedcb5"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------- */
/* SignatureCurve — each brand's "tuned signature": a frequency-response */
/* line that draws itself in as the card enters view, then settles with  */
/* a glowing head at its leading edge. A literal, on-brand fingerprint.   */
/* ----------------------------------------------------------------- */
function SignatureCurve({
  d,
  end,
  active,
  index,
  reducedMotion,
}: {
  d: string;
  end: number[];
  active: boolean;
  index: number;
  reducedMotion: boolean;
}) {
  const gradId = `cred-sig-${index}`;
  return (
    <svg
      viewBox="0 0 320 64"
      preserveAspectRatio="none"
      className="h-14 w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a7f54" />
          <stop offset="55%" stopColor="#e4d2ac" />
          <stop offset="100%" stopColor="#eedcb5" />
        </linearGradient>
      </defs>
      {/* Faint zero line for the response to read against. */}
      <line x1="0" y1="40" x2="320" y2="40" stroke="rgba(245,245,247,0.07)" strokeWidth="1" />
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={
          reducedMotion
            ? undefined
            : active
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
        }
        transition={{ duration: 1.5, ease: EASE, delay: 0.45 }}
      />
      {/* Glowing head that lands once the line has drawn. */}
      <motion.circle
        cx={end[0]}
        cy={end[1]}
        r="3.2"
        fill="#eedcb5"
        initial={reducedMotion ? false : { opacity: 0, scale: 0 }}
        animate={
          reducedMotion
            ? undefined
            : active
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0 }
        }
        transition={{ duration: 0.5, ease: EASE, delay: 1.7 }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(238,220,181,0.85))' }}
      />
    </svg>
  );
}

/* ----------------------------------------------------------------- */
/* CredentialCard (continued)                                          */
/* ----------------------------------------------------------------- */
function CredentialCard({
  c,
  index,
  reducedMotion,
}: {
  c: (typeof CREDENTIALS)[number];
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12%' });
  const delay = index * 0.16;

  const onMove = (e: React.MouseEvent) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
      animate={
        reducedMotion
          ? undefined
          : inView
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 30, scale: 0.96 }
      }
      transition={{ duration: 0.8, ease: EASE, delay }}
      whileHover={
        reducedMotion ? undefined : { y: -8, transition: { duration: 0.3, ease: EASE } }
      }
      className="group relative h-full overflow-hidden rounded-3xl p-[1.5px]"
    >
      {/* Faint static rim so the border reads as a full ring. */}
      <span aria-hidden className="absolute inset-0 rounded-3xl bg-white/10" />

      {/* Gold gleam that perpetually orbits the card border. */}
      {!reducedMotion && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 215deg, rgba(238,220,181,0.95) 300deg, rgba(205,178,133,0.45) 335deg, transparent 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 7,
            ease: 'linear',
            repeat: Infinity,
            delay: index * 1.4,
          }}
        />
      )}

      {/* Inner plaque — covers the gleam, leaving only the glowing edge. */}
      <div className="relative z-10 flex h-full flex-col rounded-[calc(1.5rem-1.5px)] bg-[#0e0e11] p-8 text-left transition-colors duration-300 group-hover:bg-[#121216] md:p-9">
        {/* Pointer-tracked champagne glow. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(260px_260px_at_var(--x,50%)_var(--y,50%),rgba(205,178,133,0.16),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {/* Certificate registration marks at opposing corners. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-champagne/25"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-4 right-4 h-3 w-3 border-b border-r border-champagne/25"
        />

        {/* Header — logo plate alongside the spinning certification seal. */}
        <div className="relative flex items-stretch justify-between gap-4">
          <span className="relative flex h-[68px] flex-1 items-center justify-start overflow-hidden rounded-2xl bg-[#141416] px-5 ring-1 ring-white/[0.05]">
            <img
              src={c.logo}
              alt={c.name}
              loading="lazy"
              decoding="async"
              className="relative z-10 max-h-8 w-auto max-w-[80%] object-contain object-left opacity-90 brightness-0 invert transition-transform duration-300 group-hover:scale-[1.04]"
              draggable={false}
            />
          </span>
          <CertSeal index={index} reducedMotion={reducedMotion} />
        </div>

        {/* Identity. */}
        <span className="eyebrow relative mt-7">{c.role}</span>
        <h3 className="display relative mt-1 text-xl text-ivory md:text-2xl">
          {c.name}
        </h3>
        <p className="relative mt-3 font-sans text-sm leading-relaxed text-ivory-muted">
          {c.blurb}
        </p>

        {/* Tuned signature — the brand's frequency fingerprint, drawn on view. */}
        <div className="relative mt-7">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ivory-faint">
              Tuned signature
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-champagne/70">
              {c.tag}
            </span>
          </div>
          <SignatureCurve
            d={c.signature}
            end={c.end}
            active={inView}
            index={index}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Verification footer — a live, accountable partnership. */}
        <div className="relative mt-auto flex items-center gap-2.5 border-t border-white/[0.06] pt-5">
          <span className="relative flex h-1.5 w-1.5">
            {!reducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-champagne/70" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-champagne shadow-[0_0_8px_2px_rgba(205,178,133,0.55)]" />
          </span>
          <span className="font-sans text-xs text-ivory-faint">Active partnership</span>
          <span aria-hidden className="ml-auto font-sans text-xs tracking-wide text-ivory-faint">
            Verified by Cinesphere
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- */
/* Brand spotlight — brand logos rise through the centre band one at a  */
/* time, alternating sides (right, left, right…). Each lights to full   */
/* as it crosses the middle of the pinned stage and fades as it leaves, */
/* in the spirit of the reference scroll. Driven by scroll progress.    */
/* ----------------------------------------------------------------- */
/* Brand marks for the dark spotlight rail, sourced from /brands/white/.  */
/* Each mark is forced to a clean white silhouette via brightness-0 +     */
/* invert (applied on the <img> below), which renders ANY transparent     */
/* logo white regardless of its original colour — so dark-coloured marks  */
/* show up too (a plain screen blend would drop them on the black         */
/* section). Filenames with '&' are URL-encoded as %26 so they resolve.   */
/* Harman Kardon has no white file, so it falls back to its original      */
/* /images logo (also transparent, so the same trick renders it white).   */
/* NOTE: this assumes every file is transparent. A file with an opaque    */
/* (e.g. white) background will show as a solid white box and must be      */
/* re-exported with its alpha channel preserved.                          */
const WHITE_LOGOS: Record<string, string> = {
  Focal: '/brands/white/focal-logo.webp',
  'Bang & Olufsen': '/brands/white/B%26O.webp',
  'JBL Synthesis': '/brands/white/JBL.webp',
  'Bowers & Wilkins': '/brands/white/B%26W.webp',
  'M&K Sound': '/brands/white/MK.webp',
  'Sonus faber': '/brands/white/sonus-faber.webp',
  Klipsch: '/brands/white/klipsch.webp',
  QSC: '/brands/white/QSC.webp',
  Barco: '/brands/white/barco.webp',
  Arcam: '/brands/white/arcam.webp',
  BenQ: '/brands/white/benq.webp',
  Epson: '/brands/white/EPSON.webp',
  Sony: '/brands/white/sony.webp',
  Christie: '/brands/white/christie.webp',
  Denon: '/brands/white/denon.webp',
  Marantz: '/brands/white/marantz.webp',
  'Optimal Audio': '/brands/white/optimalaudio.webp',
  Revel: '/brands/white/revel.webp',
  Bose: '/brands/white/bose.webp',
  'British Acoustics': '/brands/white/british-acoustics.webp',
  'U&K Sound': '/brands/white/uandksound-logo.webp',
};

/* British Acoustics and U&K Sound have white marks in /brands/white/ but are
   not part of the shared roster (lib/brands.ts), so they're appended here for
   the About brand wall only — name + logo are all the wall needs. Add them to
   lib/brands.ts too if they should also appear in the nav "Brands" dropdown
   and the /brands page. */
const EXTRA_BRANDS: Brand[] = [
  {
    name: 'British Acoustics',
    logo: '/brands/white/british-acoustics.webp',
    chip: 'dark',
    origin: '',
    code: '',
    blurb: '',
  },
  {
    name: 'U&K Sound',
    logo: '/brands/white/uandksound-logo.webp',
    chip: 'dark',
    origin: '',
    code: '',
    blurb: '',
  },
];

/* The full wall shown on /about: the shared roster plus any extras that aren't
   already in it. British Acoustics and U&K Sound now also live in the shared
   roster (lib/brands.ts), so we dedupe by name — keeping the first occurrence —
   to avoid duplicate React keys (and duplicate logos) on the wall. */
const WALL_BRANDS: Brand[] = [...BRANDS, ...EXTRA_BRANDS].filter(
  (b, i, arr) => arr.findIndex((x) => x.name === b.name) === i,
);

/* The two spotlight rails, balanced so both columns carry a similar number of
   logos. Each array is that column's top-to-bottom order, so reordering names
   — or moving one between LEFT_RAIL and RIGHT_RAIL — is all it takes to retune
   the layout. Emblem / monogram marks lead each column with wordmarks woven
   in to keep the two sides even. */
const LEFT_RAIL = [
  'Bang & Olufsen',
  'Focal',
  'JBL Synthesis',
  'Denon',
  'Bowers & Wilkins',
  'QSC',
  'M&K Sound',
  'Sony',
  'Optimal Audio',
  'Sonus faber',
  'U&K Sound',
];
const RIGHT_RAIL = [
  'Klipsch',
  'Barco',
  'Christie',
  'Bose',
  'Marantz',
  'Harman Kardon',
  'Arcam',
  'BenQ',
  'Epson',
  'Revel',
  'British Acoustics',
];

/* Name -> Brand lookup so each rail array can reference brands by name. */
const BY_NAME: Record<string, Brand> = Object.fromEntries(
  WALL_BRANDS.map((b) => [b.name, b]),
);

/* Uniform canvas for every mark, so they all occupy the same footprint
   regardless of artwork aspect ratio — object-contain letterboxes each logo
   inside this identical box (wide wordmarks cap on width, compact marks on
   height), which keeps the wall visually even. */
const LOGO_CANVAS =
  'flex h-[120px] w-[340px] items-center justify-center 2xl:h-[150px] 2xl:w-[420px]';

/* Optional per-logo scale nudge for marks whose artwork carries extra built-in
   padding, so they read at a similar visual size to the rest. Omit a brand for
   no change (1 = unchanged). */
const LOGO_SCALE: Record<string, string> = {
  Bose: 'scale-[1.4]',
};

const SPAN = 0.06;

function ZigItem({
  brand,
  onRight,
  active,
  progress,
}: {
  brand: Brand;
  onRight: boolean;
  active: number;
  progress: MotionValue<number>;
}) {
  const y = useTransform(progress, [active - SPAN, active + SPAN], [300, -300]);
  const opacity = useTransform(
    progress,
    [active - SPAN, active - SPAN * 0.45, active, active + SPAN * 0.45, active + SPAN],
    [0, 0.18, 1, 0.18, 0],
  );
  // Zoom-in reveal: the mark punches up past 1 and snaps into sharp focus as
  // it crosses the centre (its fully-revealed state), then eases back down and
  // softens again as it leaves — so the active logo "zooms in" in the middle.
  const scale = useTransform(
    progress,
    [active - SPAN, active, active + SPAN],
    [0.8, 1.12, 0.8],
  );
  const blurPx = useTransform(
    progress,
    [active - SPAN, active, active + SPAN],
    [10, 0, 10],
  );
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 ${
        onRight ? 'right-[6vw] 2xl:right-[10vw]' : 'left-[6vw] 2xl:left-[10vw]'
      }`}
    >
      <motion.div
        style={{ y, opacity, scale, filter }}
        className="will-change-[transform,filter]"
      >
        <div className={LOGO_CANVAS}>
          <img
            src={WHITE_LOGOS[brand.name] ?? brand.logo}
            alt={brand.name}
            loading="lazy"
            decoding="async"
            className={`max-h-full max-w-full object-contain brightness-0 invert ${
              LOGO_SCALE[brand.name] ?? ''
            }`}
            draggable={false}
          />
        </div>
      </motion.div>
    </div>
  );
}

function ZigZagBrands({ progress }: { progress: MotionValue<number> }) {
  // Weave the two rails into ONE alternating sequence — left, right, left,
  // right … — so exactly one logo is lit at a time and the spotlight zigzags
  // from side to side as you scroll, instead of the two sides arriving in
  // matched pairs. Each step gets its own peak spread evenly across the run
  // (0.14 → 1.0), so the final mark peaks right at the end (the pin's release
  // point) and — since brandsProgress is clamped at 1 — holds there rather than
  // fading back out, keeping the last logo lit as the scroll hands back.
  const leftBrands = LEFT_RAIL.map((n) => BY_NAME[n]).filter(
    (b): b is Brand => Boolean(b),
  );
  const rightBrands = RIGHT_RAIL.map((n) => BY_NAME[n]).filter(
    (b): b is Brand => Boolean(b),
  );

  const sequence: { brand: Brand; onRight: boolean }[] = [];
  const rows = Math.max(leftBrands.length, rightBrands.length);
  for (let i = 0; i < rows; i += 1) {
    if (leftBrands[i]) sequence.push({ brand: leftBrands[i], onRight: false });
    if (rightBrands[i]) sequence.push({ brand: rightBrands[i], onRight: true });
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {sequence.map((s, k, arr) => (
        <ZigItem
          key={s.brand.name}
          brand={s.brand}
          onRight={s.onRight}
          active={0.14 + (0.86 * k) / Math.max(1, arr.length - 1)}
          progress={progress}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* CredentialsAuthoritySection — the "Certified authority" stage.       */
/* On xl screens it pins to the viewport while you scroll; the two       */
/* partner plaques hold the centre as the brand rails stream upward on   */
/* the left and downward on the right — a cinematic, scroll-linked        */
/* moment in the spirit of the reference film. Below xl (and under       */
/* reduced motion) it degrades to a calm, static two-up layout.          */
/* ----------------------------------------------------------------- */
function CredentialsAuthoritySection({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    restDelta: 0.001,
  });
  // Pinned-window choreography: first the wireframe resolves into the
  // finished speaker (early in the pin), then the brand logos run their
  // spotlight. The logo run is mapped to COMPLETE exactly at the pin's
  // release point (~0.8 = where the sticky stage unpins), so the scroll
  // hands back the instant the last row of logos is fully lit, with no
  // trailing locked scroll afterwards.
  const wireOpacity = useTransform(smooth, [0.24, 0.32], [1, 0]);
  const meshOpacity = useTransform(smooth, [0.28, 0.36], [0, 1]);
  const brandsProgress = useTransform(smooth, [0.38, 0.8], [0, 1]);

  return (
    <>
      <section
        ref={ref}
        className={`relative w-full bg-piano ${
          reducedMotion ? '' : 'xl:h-[700vh]'
        }`}
      >
        {/* Pinned stage — stays fixed through the whole section on xl. */}
        <div
          className={`relative flex w-full flex-col items-center justify-center overflow-hidden px-[7vw] py-24 md:py-32 ${
            reducedMotion ? '' : 'xl:sticky xl:top-0 xl:h-screen xl:justify-start xl:pb-0 xl:pt-[150px]'
          }`}
        >
          {/* Brand spotlight — xl + motion only. */}
          {!reducedMotion && (
            <div aria-hidden className="absolute inset-0 z-0 hidden xl:block">
              <ZigZagBrands progress={brandsProgress} />
            </div>
          )}

          {/* Heading — held near the top of the pinned stage. */}
          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-15%' }}
            className="relative z-20 text-center"
          >
            <motion.h2
              variants={reducedMotion ? undefined : itemV}
              className="display text-4xl text-ivory md:text-6xl"
            >
              BRANDS
            </motion.h2>
            <motion.p
              variants={reducedMotion ? undefined : itemV}
              className="mt-3 font-sans text-sm uppercase tracking-[0.28em] text-champagne/70"
            >
              We Deal With
            </motion.p>
          </motion.div>

          {/* Brand render — wireframe resolves into the finished speaker.   */}
          {/* On xl it is anchored to the bottom and grown to fill the stage, */}
          {/* so the speaker reaches the bottom edge of the viewport.         */}
          <motion.div
            initial={
              reducedMotion ? false : { opacity: 0, scale: 0.96, filter: 'blur(10px)' }
            }
            whileInView={
              reducedMotion ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }
            }
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative z-10 mx-auto mt-8 h-[44vh] w-full max-w-[80vw] md:mt-10 md:h-[60vh] xl:absolute xl:inset-x-0 xl:bottom-0 xl:top-[250px] xl:z-0 xl:mt-0 xl:h-auto xl:max-w-none"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[110%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.07),transparent_68%)] blur-2xl"
            />
            <MotionImage
              src="/images/brands-wireframe.webp"
              alt="Wireframe render of a reference loudspeaker"
              fill
              sizes="(min-width: 1280px) 90vw, 80vw"
              quality={85}
              style={reducedMotion ? { opacity: 0 } : { opacity: wireOpacity }}
              className="object-contain object-bottom"
              draggable={false}
            />
            <MotionImage
              src="/images/brands-mesh.webp"
              alt="The premium audio brands Cinesphere is trusted to carry"
              fill
              sizes="(min-width: 1280px) 90vw, 80vw"
              quality={85}
              style={reducedMotion ? { opacity: 1 } : { opacity: meshOpacity }}
              className="pointer-events-none object-contain object-bottom"
              draggable={false}
            />
          </motion.div>

          {/* Mobile / tablet brand grid — the scroll spotlight is xl-only, */}
          {/* so below xl show every brand as a clean white-on-dark grid.    */}
          <motion.div
            variants={reducedMotion ? undefined : groupV}
            initial={reducedMotion ? false : 'hidden'}
            whileInView={reducedMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-10%' }}
            className="relative z-20 mt-2 w-full max-w-md xl:hidden"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {WALL_BRANDS.map((b) => (
                <motion.div
                  key={b.name}
                  variants={reducedMotion ? undefined : itemV}
                  className="flex aspect-[3/2] items-center justify-center rounded-xl border border-champagne/15 bg-white/[0.03] p-4"
                >
                  <img
                    src={WHITE_LOGOS[b.name] ?? b.logo}
                    alt={b.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-9 w-auto max-w-[78%] object-contain brightness-0 invert"
                    draggable={false}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------------- */
/* Page                                                               */
/* ----------------------------------------------------------------- */
export function AboutPageView() {
  // Standalone route — mirror OS reduce-motion into the store ourselves.
  useReducedMotion();
  const reducedMotion = useExperience((s) => s.reducedMotion);

  return (
    <>
      <Navigation />

      <SmoothScroll>
        <main id="top" className="relative z-10">
          {/* 1 ── HERO (scroll-scrubbed about-hero film) ────────────── */}
          <AboutHero />

          {/* 2 ── MANIFESTO (reading spotlight) ─────────────────────── */}
          <SpotlightManifesto reducedMotion={reducedMotion} />

          {/* 3 ── WHO WE ARE + EXPERIENCE DIAL ─────────────────────── */}
          <section className="relative overflow-hidden bg-piano px-[7vw] pb-20 pt-6 md:pb-28">
            {/* Faint champagne wash pooled on the dial side. */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-[-12%] top-1/2 h-[80vh] w-[60vw] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.06),transparent_65%)]"
            />

            <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.05fr_0.95fr] md:gap-12 lg:gap-20">
              {/* Left — editorial copy on a gold accent rail. */}
              <motion.div
                variants={reducedMotion ? undefined : groupV}
                initial={reducedMotion ? false : 'hidden'}
                whileInView={reducedMotion ? undefined : 'show'}
                viewport={{ once: true, margin: '-15%' }}
                className="relative md:pl-7"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-1 hidden h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-transparent via-champagne/60 to-transparent md:block"
                />
                <motion.p variants={itemV} className="eyebrow">
                  Who we are
                </motion.p>
                <motion.h2
                  variants={itemV}
                  className="display mt-3 text-3xl md:text-4xl lg:text-5xl"
                >
                  Chennai’s studio for
                  <br className="hidden md:block" /> finest audio artistry.
                </motion.h2>
                <motion.p
                  variants={itemV}
                  className="mt-6 max-w-md font-sans text-base leading-relaxed text-ivory-muted md:text-lg"
                >
                  Cinesphere designs, installs and calibrates premium audio and
                  video systems across homes and businesses: home theatres,
                  boardrooms, auditoriums, e-class rooms and studios. Advanced
                  technology, invisible engineering, and service that earns the
                  trust of more than a hundred clients.
                </motion.p>

                <motion.div
                  variants={itemV}
                  className="mt-7 flex items-center gap-3 font-sans text-xs uppercase tracking-[0.18em] text-ivory-faint"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-champagne shadow-[0_0_10px_2px_rgba(205,178,133,0.55)]" />
                  Chennai, India
                  <span aria-hidden className="h-px w-8 bg-champagne/40" />
                  Finest Audio Artistry
                </motion.div>
              </motion.div>

              {/* Right — the experience dial. */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
                whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <ExperienceDial reducedMotion={reducedMotion} />
                <p className="mx-auto mt-7 max-w-sm text-center font-sans text-sm leading-relaxed text-ivory-muted">
                  Reducing defects and cost, generating ideas that create the
                  best AV solutions, led by a skilled team that makes us a true
                  leader in audio and video.
                </p>
              </motion.div>
            </div>
          </section>

          {/* 4 ── SIGNAL CABLE (light) — vertical pulse process ─────── */}
          <SignalCable reducedMotion={reducedMotion} />

          {/* Stats console band — reused from the homepage. */}
          <StatsBandSection />

          {/* 5 ── WHAT WE OBSESS OVER (light) ───────────────────────── */}
          <section className="section-light perf-section px-[7vw] pb-24 pt-4 md:pb-32">
            <motion.div
              variants={reducedMotion ? undefined : groupV}
              initial={reducedMotion ? false : 'hidden'}
              whileInView={reducedMotion ? undefined : 'show'}
              viewport={{ once: true, margin: '-15%' }}
              className="max-w-2xl"
            >
              <motion.p variants={itemV} className="eyebrow">
                What we obsess over
              </motion.p>
              <motion.h2
                variants={itemV}
                className="display mt-3 text-3xl md:text-4xl lg:text-5xl"
              >
                The details you’ll
                <br className="hidden sm:block" /> never have to think about.
              </motion.h2>
            </motion.div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <TiltCard
                  key={v.title}
                  title={v.title}
                  body={v.body}
                  col={i % 4}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </section>

          {/* 6 ── THE ROOM DISAPPEARS (dark, cinematic) ─────────────── */}
          <RoomDisappears reducedMotion={reducedMotion} />

          {/* 7 ── CREDENTIALS (dark) ────────────────────────────────── */}
          <CredentialsAuthoritySection reducedMotion={reducedMotion} />

          {/* 9 ── CTA (dark, cinematic) ─────────────────────────────── */}
          <section className="relative bg-[#f7f2e8] px-4 py-16 sm:px-8 md:px-[6vw] md:py-20">
            <div className="relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:rounded-[2.75rem] md:px-16 md:py-20">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={reducedMotion ? false : { scale: 1.12 }}
                whileInView={reducedMotion ? undefined : { scale: 1 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 1.6, ease: EASE }}
              >
                <img
                  src="https://images.unsplash.com/photo-1626683164688-9ea28b9276c6?q=80&w=2400&auto=format&fit=crop"
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
                  className="display text-3xl text-ivory md:text-5xl"
                >
                  Let’s make your space
                  <br className="hidden sm:block" /> unforgettable.
                </motion.h2>
                <motion.p
                  variants={itemV}
                  className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-ivory/70"
                >
                  From a single listening room to a full auditorium, tell us what
                  you have in mind, and our team will get back to you within a
                  working day.
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
      </SmoothScroll>
    </>
  );
}
