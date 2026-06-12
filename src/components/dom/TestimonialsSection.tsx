'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * TestimonialsSection — "Liner Notes"
 * ------------------------------------
 * A unique light-theme testimonials chapter styled like an album's
 * track list: client names sit on the left as numbered tracks (the
 * active one pulses a tiny champagne equalizer), and the selected
 * review "plays" on the right as a large editorial pull-quote with an
 * oversized quotation mark. Crossfades on switch.
 *
 * Auto-plays: advances to the next track every AUTOPLAY_MS in a loop,
 * pausing while the pointer hovers (or focus is inside) the section,
 * and entirely disabled for reduced-motion users. Clicking a track
 * resets the timer.
 */

const AUTOPLAY_MS = 6000;

const BAR_DELAYS = [0, 0.4, 0.2];

function MiniEqualizer() {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[3px]">
      {BAR_DELAYS.map((delay, i) => (
        <span
          key={i}
          className="soundbar w-[2.5px] rounded-full bg-champagne-deep"
          style={{ height: `${55 + i * 20}%`, animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const current = TESTIMONIALS[active];

  // Auto-advance in a loop; the `active` dependency restarts the timer
  // after every change (including manual clicks).
  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setTimeout(
      () => setActive((i) => (i + 1) % TESTIMONIALS.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(id);
  }, [active, paused, reducedMotion]);

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="section-light relative z-10 w-full overflow-hidden py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-[7vw] lg:px-12">
        <p className="eyebrow">Testimonials</p>
        <h2 className="display mt-3 text-3xl md:text-4xl lg:text-5xl">
          What our clients say.
        </h2>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-16 lg:gap-24">
          {/* Track list — numbered client names; active one "plays". */}
          <div
            role="tablist"
            aria-label="Client testimonials"
            className="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-0 md:overflow-visible"
          >
            {TESTIMONIALS.map((t, i) => {
              const isActive = i === active;
              return (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`flex flex-none items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors md:w-full md:rounded-none md:border-b md:border-black/10 md:px-0 md:py-5 ${
                    isActive
                      ? 'bg-black/[0.04] md:bg-transparent'
                      : 'opacity-55 hover:opacity-90'
                  }`}
                >
                  <span className="eyebrow !tracking-luxe">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-sans text-sm md:text-base ${
                      isActive
                        ? 'font-semibold text-carbon'
                        : 'text-ivory-muted'
                    }`}
                  >
                    {t.name}
                  </span>
                  {isActive && <MiniEqualizer />}
                </button>
              );
            })}
          </div>

          {/* The playing quote — oversized mark + editorial pull-quote. */}
          <div className="relative min-h-[16rem] md:min-h-[20rem]">
            <span
              aria-hidden
              className="display text-gold pointer-events-none absolute -top-8 left-0 text-[7rem] leading-none opacity-60 md:-top-12 md:text-[10rem]"
            >
              &ldquo;
            </span>

            <AnimatePresence mode="wait">
              <motion.figure
                key={current.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-6 pt-10 md:pl-10 md:pt-14"
              >
                <blockquote className="display text-xl leading-snug text-carbon md:text-2xl lg:text-[1.7rem]">
                  {current.quote}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {/* Champagne monogram in place of a photo. */}
                  <span className="display flex h-11 w-11 items-center justify-center rounded-full bg-gold-sheen text-base text-white">
                    {current.name.replace('Mr. ', '').charAt(0)}
                  </span>
                  <span>
                    <span className="block font-sans text-sm font-semibold text-carbon">
                      {current.name}
                    </span>
                    <span className="eyebrow mt-0.5 block">
                      Cinesphere Client
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
