'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion';
import { BRAND, NAV_LINKS } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * Fixed top navigation — wordmark, full menu (eGlu-style horizontal links
 * on desktop, hamburger sheet on mobile) and a single CTA.
 * Fades in only after the preloader completes.
 *
 * Scroll behaviour: once the page is scrolled past 10% of the viewport,
 * scrolling DOWN slides the header up out of view; scrolling UP slides
 * it back down immediately. Always visible near the top or while the
 * mobile menu sheet is open.
 */
export function Navigation() {
  const ready = useExperience((s) => s.ready);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const threshold =
      typeof window !== 'undefined' ? window.innerHeight * 0.1 : 80;

    if (open || latest <= threshold) {
      // Near the top (or menu open) — always shown.
      setHidden(false);
    } else if (latest > previous) {
      // Scrolling down past the threshold — slide up away.
      setHidden(true);
    } else if (latest < previous) {
      // Scrolling up — slide back down.
      setHidden(false);
    }
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={
        ready
          ? hidden
            ? { opacity: 1, y: '-150%' }
            : { opacity: 1, y: 0 }
          : {}
      }
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
