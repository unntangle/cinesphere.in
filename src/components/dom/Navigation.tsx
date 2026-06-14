'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND, NAV_LINKS } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * Fixed top navigation — wordmark, full menu (eGlu-style horizontal links
 * on desktop, hamburger sheet on mobile) and a single CTA. Fades in only
 * after the preloader completes, then stays pinned at the top.
 */
/**
 * NavWave — a live multicolour audio-spectrum brand mark beside the
 * wordmark: a faint full-width hairline baseline with a row of thin bars
 * across it, each coloured along the rainbow (electric blue → cyan → green
 * → yellow → orange → red → magenta) and bouncing like a frequency meter.
 * A gentle height envelope + a travelling animation delay make the activity
 * ripple across the line. Pure CSS (.soundbar); frozen for reduced motion.
 */
const SPECTRUM_BARS = 64;
const SPECTRUM_STOPS = [
  '#1f7bff',
  '#19c8ff',
  '#27d36e',
  '#ffd23f',
  '#ff7a2f',
  '#ff2d55',
  '#ff4db8',
];

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function spectrumColor(t: number) {
  const seg = t * (SPECTRUM_STOPS.length - 1);
  const i = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = hexToRgb(SPECTRUM_STOPS[i]);
  const b = hexToRgb(SPECTRUM_STOPS[i + 1]);
  const ch = (k: 'r' | 'g' | 'b') => Math.round(a[k] + (b[k] - a[k]) * f);
  return `rgb(${ch('r')}, ${ch('g')}, ${ch('b')})`;
}

const SPECTRUM = Array.from({ length: SPECTRUM_BARS }, (_, i) => {
  const t = i / (SPECTRUM_BARS - 1);
  // Wide, slightly left-of-centre envelope + per-bar spikiness gives a
  // frequency-spectrum silhouette; near-flat (tiny) bars at the edges.
  const env = Math.exp(-(((t - 0.42) / 0.34) ** 2));
  const spike = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + 0.6));
  return {
    color: spectrumColor(t),
    height: 2 + 13 * env * spike,
    delay: (i / SPECTRUM_BARS) * 1.1, // travelling ripple across the bars
    duration: 0.8 + (i % 5) * 0.13,
  };
});

function NavWave({ animate }: { animate: boolean }) {
  return (
    <span
      aria-hidden
      className="relative block h-6 w-[120px] shrink-0 sm:h-8 sm:w-[280px] md:w-[360px]"
    >
      {/* Baseline — a faint full-width multicolour hairline, faded at ends. */}
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,#1f7bff,#27d36e,#ffd23f,#ff7a2f,#ff4db8)] opacity-30 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]" />

      {/* Bars — centred on the baseline, bouncing like a spectrum. */}
      <span className="absolute inset-0 flex items-center justify-between">
        {SPECTRUM.map((bar, i) => (
          <span
            key={i}
            className={`w-[1.5px] rounded-full sm:w-[2px] md:w-[3px] ${animate ? 'soundbar' : ''}`}
            style={{
              height: `${bar.height}px`,
              backgroundColor: bar.color,
              animationDelay: `${bar.delay}s`,
              animationDuration: `${bar.duration}s`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

export function Navigation() {
  const ready = useExperience((s) => s.ready);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 top-4 z-30 mx-auto flex max-w-7xl items-center justify-between rounded-full bg-black/55 px-5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_46px_-6px_rgba(205,178,133,0.22),inset_0_1px_0_rgba(238,220,181,0.08)] backdrop-blur-xl backdrop-saturate-150 md:inset-x-10 md:px-8"
    >
      <Link href="/#top" aria-label={BRAND.name} className="flex items-center">
        <img
          src="/images/cs-logo-color.webp"
          alt={BRAND.name}
          className="h-7 w-auto object-contain md:h-8"
          draggable={false}
        />
      </Link>

      {/* Live multi-colour audio-frequency waveform — sits in the gap
          between the wordmark and the menu. */}
      <NavWave animate={!reducedMotion} />

      {/* Desktop menu */}
      <nav className="hidden items-center gap-8 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-sans text-xs text-ivory/80 transition-colors hover:text-ivory"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/#contact"
          className="rounded-full bg-champagne-deep px-4 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-champagne"
        >
          Let&apos;s Talk
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
      >
        <span
          className={`h-px w-6 bg-ivory transition-transform duration-300 ${
            open ? 'translate-y-[6px] rotate-45' : ''
          }`}
        />
        <span
          className={`h-px w-6 bg-ivory transition-opacity duration-300 ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`h-px w-6 bg-ivory transition-transform duration-300 ${
            open ? '-translate-y-[6px] -rotate-45' : ''
          }`}
        />
      </button>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 right-4 top-full mt-2 flex flex-col gap-1 rounded-2xl border border-white/10 bg-[rgba(22,22,23,0.92)] p-4 backdrop-blur-xl lg:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-sans text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-champagne-deep px-4 py-2.5 text-center font-sans text-sm font-medium text-white transition-colors hover:bg-champagne"
            >
              Let&apos;s Talk
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
