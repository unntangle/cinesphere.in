'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND, NAV_LINKS } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * Fixed top navigation — wordmark, full menu (eGlu-style horizontal links
 * on desktop, hamburger sheet on mobile) and a single CTA.
 * Fades in only after the preloader completes.
 */
export function Navigation() {
  const ready = useExperience((s) => s.ready);
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-transparent px-6 py-3 md:px-12"
    >
      <a
        href="#top"
        className="font-sans text-base font-semibold tracking-[-0.015em] text-ivory"
      >
        {BRAND.name}
      </a>

      {/* Desktop menu */}
      <nav className="hidden items-center gap-8 lg:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-sans text-xs text-ivory/80 transition-colors hover:text-ivory"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#contact"
          className="rounded-full bg-champagne-deep px-4 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-champagne"
        >
          Quick Enquiry
        </a>
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
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-sans text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-champagne-deep px-4 py-2.5 text-center font-sans text-sm font-medium text-white transition-colors hover:bg-champagne"
            >
              Quick Enquiry
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
