'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { STATS } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * StatsBandSection — "Numbers that sound right."
 * -----------------------------------------------
 * A dark interlude band below the Solutions carousel. The signature:
 * each stat is styled like a channel on a mixing console — a live
 * champagne equalizer meter above a gold number that COUNTS UP from
 * zero when the band scrolls into view, with the label beneath, all
 * seated on hairline channel dividers.
 */

/** Equalizer meter — five bars riffing on the site's .soundbar pulse. */
const BAR_DELAYS = [0, 0.35, 0.18, 0.5, 0.08];

function EqualizerMeter({ paused }: { paused: boolean }) {
  return (
    <div aria-hidden className="flex h-8 items-end gap-[5px]">
      {BAR_DELAYS.map((delay, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-champagne/70 ${
            paused ? '' : 'soundbar'
          }`}
          style={{
            height: `${40 + ((i * 37) % 60)}%`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Counts 0 → value with an ease-out curve once `start` is true. */
function CountUp({
  value,
  suffix,
  start,
}: {
  value: number;
  suffix: string;
  start: boolean;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const duration = 1800;

    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return (
    <>
      {n}
      {suffix}
    </>
  );
}

export function StatsBandSection() {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const bandRef = useRef<HTMLElement>(null);
  const inView = useInView(bandRef, { once: true, margin: '-15% 0px' });

  // Reduced motion: skip the count-up, land on final values instantly.
  const still = reducedMotion;

  return (
    <section
      ref={bandRef}
      className="relative z-10 w-full overflow-hidden bg-piano py-10 md:py-12 lg:py-14"
    >
      {/* Background — Unsplash speaker-grille close-up, tone-graded into
          the black/gold theme and heavily darkened for legibility. */}
      <img
        src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=2000&q=70"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-40 brightness-[0.55] contrast-[1.05] sepia-[0.3] saturate-[1.1]"
        loading="lazy"
        draggable={false}
      />
      {/* Dark wash so the console reads over the photo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/80"
      />

      {/* Ambient champagne wash behind the console. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[80vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.08),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-[7vw] lg:px-12">
        <p className="eyebrow">Why Cinesphere</p>
        <h2 className="display mt-2 text-2xl text-ivory md:text-3xl lg:text-4xl">
          Numbers that sound right.
        </h2>

        <dl className="mt-8 grid grid-cols-2 gap-y-8 md:mt-10 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-l border-white/10 pl-6 md:pl-8"
            >
              <EqualizerMeter paused={still} />
              <dt className="text-gold display mt-3 text-4xl md:text-5xl">
                {still ? (
                  <>
                    {stat.value}
                    {stat.suffix}
                  </>
                ) : (
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    start={inView}
                  />
                )}
              </dt>
              <dd className="eyebrow mt-3 text-ivory-faint">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
