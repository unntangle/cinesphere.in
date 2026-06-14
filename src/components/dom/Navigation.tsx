'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND, SOLUTIONS } from '@/lib/constants';
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
  { label: 'About Us', href: '/#home-theatre' },
  { label: 'Our Solutions', dropdown: 'solutions' },
  { label: 'Brands', dropdown: 'brands' },
  { label: 'Our Clients', href: '/#brand-vault' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact Us', href: '/#contact' },
];

/** Audio brands Cinesphere carries — each links to its homepage reveal. */
const BRAND_ITEMS = [
  {
    name: 'Focal',
    tag: 'Certified Partner',
    href: '/#sound-evolution',
    logo: '/images/focal-logo.webp',
    filter: 'brightness-[0.98] sepia-[0.85] saturate-[1.4]',
  },
  {
    name: 'Harman Kardon',
    tag: 'Authorized Dealer',
    href: '/#harman-kardon',
    logo: '/images/Harman_kardon_Logo.webp',
    filter: 'brightness-110',
  },
];

/* Shared panel chrome — dark frosted glass with a champagne top hairline,
   matching the header's own glassmorphism. */
const PANEL_SHELL =
  'overflow-hidden rounded-2xl border border-white/10 bg-[rgba(14,14,16,0.96)] shadow-[0_24px_70px_-16px_rgba(0,0,0,0.75),0_0_42px_-12px_rgba(205,178,133,0.3)] backdrop-blur-2xl';

function SolutionsPanel({ close }: { close: () => void }) {
  return (
    <div className={`w-[min(94vw,600px)] ${PANEL_SHELL}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne/70 to-transparent" />
      <div className="p-3">
        <div className="mb-1 flex items-center justify-between px-3 pt-1.5">
          <span className="eyebrow">Our Solutions</span>
          <span className="font-sans text-[11px] tracking-wide text-ivory/40">
            9 services
          </span>
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {SOLUTIONS.map((s, i) => (
            <Link
              key={s}
              href="/#dolby-atmos"
              onClick={close}
              className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
            >
              <span className="w-5 flex-none font-sans text-[11px] font-semibold tabular-nums text-champagne/55 transition-colors group-hover/item:text-champagne">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 font-sans text-[13px] leading-snug text-ivory/75 transition-colors group-hover/item:text-ivory">
                {s}
              </span>
              <span
                aria-hidden
                className="-translate-x-1 text-champagne opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
              >
                →
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/#dolby-atmos"
          onClick={close}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-champagne-deep px-4 py-2.5 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-champagne"
        >
          Explore all solutions
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function BrandsPanel({ close }: { close: () => void }) {
  return (
    <div className={`w-[min(92vw,340px)] ${PANEL_SHELL}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
      <div className="p-4">
        <div className="mb-2 px-1">
          <span className="eyebrow">Brands We Carry</span>
        </div>
        <div className="flex flex-col gap-2">
          {BRAND_ITEMS.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              onClick={close}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-colors hover:border-champagne/40 hover:bg-white/[0.06]"
            >
              <span className="flex h-8 w-16 flex-none items-center justify-center">
                <img
                  src={b.logo}
                  alt={b.name}
                  className={`max-h-6 w-auto max-w-full object-contain ${b.filter}`}
                  draggable={false}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm font-medium text-ivory">
                  {b.name}
                </span>
                <span className="block font-sans text-[11px] text-champagne/90">
                  {b.tag}
                </span>
              </span>
              <span
                aria-hidden
                className="text-ivory/35 transition-all group-hover:translate-x-0.5 group-hover:text-champagne"
              >
                →
              </span>
            </Link>
          ))}
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
      <Link href="/#top" aria-label={BRAND.name} className="flex items-center">
        <img
          src="/images/cs-logo-color.webp"
          alt={BRAND.name}
          className="h-7 w-auto object-contain md:h-8"
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

              <AnimatePresence>
                {openMenu === item.dropdown && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full z-40 pt-3"
                  >
                    {item.dropdown === 'solutions' ? (
                      <SolutionsPanel close={() => setOpenMenu(null)} />
                    ) : (
                      <BrandsPanel close={() => setOpenMenu(null)} />
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
            className="absolute left-4 right-4 top-full mt-2 flex max-h-[78vh] flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-[rgba(22,22,23,0.92)] p-4 backdrop-blur-xl lg:hidden"
          >
            {MENU.map((item) =>
              item.dropdown ? (
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
                                <Link
                                  key={b.name}
                                  href={b.href}
                                  onClick={closeAll}
                                  className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-white/5"
                                >
                                  <span className="font-sans text-[13px] text-ivory/80">
                                    {b.name}
                                  </span>
                                  <span className="font-sans text-[11px] text-champagne/80">
                                    {b.tag}
                                  </span>
                                </Link>
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
              href="/#contact"
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
