'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND, SOLUTIONS } from '@/lib/constants';
import { BRANDS as BRAND_ITEMS } from '@/lib/brands';
import { SOLUTION_CARDS } from './SolutionsCarouselSection';
import { useExperience } from '@/store/useExperience';

/**
 * Fixed top navigation — wordmark, full menu (eGlu-style horizontal links
 * on desktop, hamburger sheet on mobile) and a single CTA. Fades in only
 * after the preloader completes, then stays pinned at the top.
 *
 * Two of the menu items are dropdown triggers: "Our Solutions" opens a
 * themed mega-panel of all nine services, and "Brands" opens a compact
 * panel of the audio brands Cinesphere carries (Focal, Harman Kardon).
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
      className="relative block h-6 w-[120px] shrink-0 sm:h-8 sm:w-[240px] md:w-[300px] lg:hidden xl:block xl:w-[280px]"
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
              height: `${bar.height.toFixed(3)}px`,
              backgroundColor: bar.color,
              animationDelay: `${bar.delay.toFixed(3)}s`,
              animationDuration: `${bar.duration.toFixed(3)}s`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Menu model                                                          */
/* ------------------------------------------------------------------ */

type DropdownKind = 'solutions' | 'brands';
interface MenuItem {
  label: string;
  href?: string;
  dropdown?: DropdownKind;
}

const MENU: MenuItem[] = [
  { label: 'Home', href: '/#top' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Solutions', dropdown: 'solutions' },
  { label: 'Brands', dropdown: 'brands', href: '/brands' },
  { label: 'Our Clients', href: '/clients' },
  { label: 'Gallery', href: '/gallery' },
];

/* The brand roster lives in src/lib/brands.ts (shared with the dedicated
   /brands page) and is imported above as BRAND_ITEMS. */

/* The dropdown's media pane reuses the exact images from the Solutions
   section cards (SOLUTION_CARDS, same order as SOLUTIONS), so the photo
   shown for each service always matches its card and the two never drift. */
const SOLUTION_MEDIA = SOLUTION_CARDS.map((c) => c.image ?? '');

/* The same warm grade the cards apply, so the dropdown matches their look.
   (The local conference-room shot is shown ungraded, exactly as on its card.) */
const SOLUTION_MEDIA_FILTER =
  'sepia(0.5) saturate(1.45) hue-rotate(-12deg) brightness(0.9) contrast(1.05)';

/* Shared panel chrome — the site's warm ivory editorial surface (same as
   the Solutions / Clients light sections), so the dropdown reads as part of
   the theme rather than a dark floating box. Dark text, champagne accents. */
const PANEL_SHELL =
  'overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f7f2e8] shadow-[0_26px_70px_-18px_rgba(0,0,0,0.45)] ring-1 ring-champagne/20';

/* Stagger config for the solutions list entrance. */
const LIST_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.06 } },
};
const LIST_ITEM = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function SolutionsPanel({
  close,
  reducedMotion,
}: {
  close: () => void;
  reducedMotion: boolean;
}) {
  const [active, setActive] = useState(0);

  // Warm the image cache when the panel opens so hover crossfades are smooth.
  useEffect(() => {
    SOLUTION_MEDIA.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return (
    <div className={`w-[min(96vw,760px)] ${PANEL_SHELL}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne-deep/50 to-transparent" />
      <div className="flex">
        {/* Left — solutions list */}
        <div className="flex-1 p-3">
          <div className="mb-1 px-3 pt-1.5">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-champagne-deep">
              Our Solutions
            </span>
          </div>
          <motion.ul
            className="flex flex-col"
            variants={reducedMotion ? undefined : LIST_STAGGER}
            initial={reducedMotion ? false : 'hidden'}
            animate={reducedMotion ? undefined : 'show'}
          >
            {SOLUTIONS.map((s, i) => (
              <motion.li key={s} variants={reducedMotion ? undefined : LIST_ITEM}>
                <Link
                  href="/#dolby-atmos"
                  onClick={close}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                >
                  <span
                    className={`w-5 flex-none font-sans text-[11px] font-semibold tabular-nums transition-colors ${
                      active === i
                        ? 'text-champagne-deep'
                        : 'text-champagne-deep/55'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex-1 font-sans text-[13px] leading-snug transition-colors ${
                      active === i
                        ? 'text-champagne-deep'
                        : 'text-[#1d1d1f]/85'
                    }`}
                  >
                    {s}
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Right — media pane: crossfades + slowly zooms the active solution's
            photo, with a champagne label that fades up. */}
        <div className="relative m-3 ml-0 w-[42%] flex-none self-stretch overflow-hidden rounded-xl bg-[#141416]">
          <AnimatePresence>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.img
                src={SOLUTION_MEDIA[active]}
                alt={SOLUTIONS[active]}
                className="h-full w-full object-cover"
                draggable={false}
                style={
                  SOLUTION_MEDIA[active] === '/images/conference-room.webp'
                    ? undefined
                    : { filter: SOLUTION_MEDIA_FILTER }
                }
                initial={reducedMotion ? false : { scale: 1 }}
                animate={reducedMotion ? undefined : { scale: 1.08 }}
                transition={{ duration: 7, ease: 'linear' }}
              />
              {/* legibility gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              {/* label */}
              <motion.div
                className="absolute inset-x-0 bottom-0 p-4"
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.06,
                }}
              >
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-champagne">
                  Solution
                </span>
                <span className="mt-1 block font-sans text-sm font-medium leading-snug text-white">
                  {SOLUTIONS[active]}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function BrandsPanel({
  close,
  reducedMotion,
}: {
  close: () => void;
  reducedMotion: boolean;
}) {
  return (
    <div className={`w-[min(96vw,680px)] ${PANEL_SHELL}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne-deep/50 to-transparent" />
      <div className="p-4">
        <div className="mb-3 px-1">
          <span className="font-sans text-xs font-semibold uppercase tracking-wide text-champagne-deep">
            Brands We Carry
          </span>
        </div>
        {/* Logo wall — each tile links through to the full /brands page. */}
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          variants={reducedMotion ? undefined : LIST_STAGGER}
          initial={reducedMotion ? false : 'hidden'}
          animate={reducedMotion ? undefined : 'show'}
        >
          {BRAND_ITEMS.map((b) => (
            <motion.div
              key={b.name}
              variants={reducedMotion ? undefined : LIST_ITEM}
            >
              <Link
                href="/brands"
                onClick={close}
                className="group flex h-full flex-col items-center gap-2.5 rounded-2xl border border-champagne/20 bg-champagne/[0.04] p-3 transition-all duration-300 hover:border-champagne-deep/30 hover:bg-champagne/[0.09]"
              >
                {/* Squared logo chip — white for dark marks, dark for light
                    marks; keeps every logo legible. */}
                <span
                  className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl ${
                    b.chip === 'dark'
                      ? 'bg-[#141416]'
                      : 'bg-white ring-1 ring-black/[0.04]'
                  }`}
                >
                  <img
                    src={b.logo}
                    alt={b.name}
                    loading="lazy"
                    decoding="async"
                    className={`max-h-[58%] w-auto max-w-[74%] object-contain transition-transform duration-300 group-hover:scale-[1.06] ${
                      b.filter ?? ''
                    }`}
                    draggable={false}
                  />
                </span>
                <span className="text-center font-sans text-[12.5px] font-medium leading-tight text-[#1d1d1f]">
                  {b.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Explore all brands → /brands (right-aligned text button) */}
        <div className="mt-4 flex justify-end">
          <Link
            href="/brands"
            onClick={close}
            className="group inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-champagne-deep transition-colors hover:text-champagne"
          >
            Explore all brands
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Small chevron that flips when its menu is open. */
function Chevron({ open, size = 9 }: { open: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      aria-hidden
      className={`transition-transform duration-300 ${
        open ? 'rotate-180 text-champagne' : ''
      }`}
    >
      <path
        d="M2.5 4L5 6.5L7.5 4"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navigation() {
  const ready = useExperience((s) => s.ready);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<DropdownKind | null>(null);
  const [mobileSub, setMobileSub] = useState<DropdownKind | null>(null);

  const closeAll = () => {
    setOpen(false);
    setMobileSub(null);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 top-4 z-30 mx-auto flex max-w-7xl items-center justify-between rounded-full bg-black/55 px-5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_46px_-6px_rgba(205,178,133,0.22),inset_0_1px_0_rgba(238,220,181,0.08)] backdrop-blur-xl backdrop-saturate-150 md:inset-x-10 md:px-8"
    >
      <Link
        href="/#top"
        aria-label={BRAND.name}
        className="relative flex items-center"
      >
        {/* soft glow behind the logo for legibility on the translucent bar */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-12 w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
          style={{
            background:
              'radial-gradient(ellipse, rgba(205,178,133,0.5), rgba(255,255,255,0.22) 45%, transparent 72%)',
          }}
        />
        <img
          src="/images/cinesphere-logo.webp"
          alt={BRAND.name}
          className="relative z-10 h-7 w-auto object-contain md:h-8"
          draggable={false}
        />
      </Link>

      {/* Live multi-colour audio-frequency waveform — sits in the gap
          between the wordmark and the menu (hidden at lg where the full
          menu is tight, returns at xl). */}
      <NavWave animate={!reducedMotion} />

      {/* Desktop menu */}
      <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
        {MENU.map((item) =>
          item.dropdown ? (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(item.dropdown!)}
              onMouseLeave={() => setOpenMenu(null)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setOpenMenu(null);
              }}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  onFocus={() => setOpenMenu(item.dropdown!)}
                  className={`flex items-center gap-1 font-sans text-xs transition-colors ${
                    openMenu === item.dropdown
                      ? 'text-ivory'
                      : 'text-ivory/80 hover:text-ivory'
                  }`}
                >
                  {item.label}
                  <Chevron open={openMenu === item.dropdown} />
                </Link>
              ) : (
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === item.dropdown}
                  onFocus={() => setOpenMenu(item.dropdown!)}
                  onClick={() =>
                    setOpenMenu(
                      openMenu === item.dropdown ? null : item.dropdown!,
                    )
                  }
                  className={`flex items-center gap-1 font-sans text-xs transition-colors ${
                    openMenu === item.dropdown
                      ? 'text-ivory'
                      : 'text-ivory/80 hover:text-ivory'
                  }`}
                >
                  {item.label}
                  <Chevron open={openMenu === item.dropdown} />
                </button>
              )}

              <AnimatePresence>
                {openMenu === item.dropdown && (
                  <motion.div
                    initial={
                      reducedMotion
                        ? { x: '-50%' }
                        : { opacity: 0, y: 8, x: '-50%' }
                    }
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={
                      reducedMotion
                        ? { opacity: 0, x: '-50%' }
                        : { opacity: 0, y: 8, x: '-50%' }
                    }
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 top-full z-40 pt-3"
                  >
                    {item.dropdown === 'solutions' ? (
                      <SolutionsPanel
                        close={() => setOpenMenu(null)}
                        reducedMotion={reducedMotion}
                      />
                    ) : (
                      <BrandsPanel
                        close={() => setOpenMenu(null)}
                        reducedMotion={reducedMotion}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href!}
              className="font-sans text-xs text-ivory/80 transition-colors hover:text-ivory"
            >
              {item.label}
            </Link>
          ),
        )}
        <Link
          href="/contact"
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
            className="absolute left-4 right-4 top-full mt-2 flex max-h-[78vh] flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-[rgba(22,22,23,0.92)] p-4 backdrop-blur-xl lg:hidden"
          >
            {MENU.map((item) =>
              item.dropdown && !item.href ? (
                <div key={item.label}>
                  <button
                    type="button"
                    aria-expanded={mobileSub === item.dropdown}
                    onClick={() =>
                      setMobileSub(
                        mobileSub === item.dropdown ? null : item.dropdown!,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-sans text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
                  >
                    {item.label}
                    <Chevron open={mobileSub === item.dropdown} size={11} />
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileSub === item.dropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-0.5 py-1 pl-3">
                          {item.dropdown === 'solutions'
                            ? SOLUTIONS.map((s, i) => (
                                <Link
                                  key={s}
                                  href="/#dolby-atmos"
                                  onClick={closeAll}
                                  className="flex items-start gap-2.5 rounded-md px-3 py-2 font-sans text-[13px] leading-snug text-ivory/70 transition-colors hover:bg-white/5 hover:text-ivory"
                                >
                                  <span className="text-champagne/80">
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  {s}
                                </Link>
                              ))
                            : BRAND_ITEMS.map((b) => (
                                <div
                                  key={b.name}
                                  className="flex items-center gap-3 rounded-md px-3 py-2"
                                >
                                  <span
                                    className={`flex h-7 w-11 flex-none items-center justify-center overflow-hidden rounded-md ${
                                      b.chip === 'dark'
                                        ? 'bg-[#141416]'
                                        : 'bg-white'
                                    }`}
                                  >
                                    <img
                                      src={b.logo}
                                      alt={b.name}
                                      loading="lazy"
                                      decoding="async"
                                      className={`max-h-4 w-auto max-w-[82%] object-contain ${
                                        b.filter ?? ''
                                      }`}
                                      draggable={false}
                                    />
                                  </span>
                                  <span className="flex-1 font-sans text-[13px] text-ivory/80">
                                    {b.name}
                                  </span>
                                  {b.featured && (
                                    <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-champagne/80">
                                      Featured
                                    </span>
                                  )}
                                </div>
                              ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={closeAll}
                  className="rounded-lg px-3 py-2.5 font-sans text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href="/contact"
              onClick={closeAll}
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
