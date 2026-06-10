'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { useExperience } from '@/store/useExperience';
import { BRAND } from '@/lib/constants';

/**
 * Preloader — a hushed luxury entrance.
 *
 * drei's `useProgress` reads THREE's DefaultLoadingManager and works fine in
 * the DOM (no Canvas context needed). Important subtlety: when the scenes use
 * only procedural geometry (no textures/GLTF), the manager has nothing queued,
 * so `progress` stays at 0 forever. We therefore "force-complete" shortly after
 * mount *if and only if* no real load ever becomes active. The moment you add
 * real assets (useGLTF/useTexture), `active` flips true, `everActive` latches,
 * and we follow the genuine percentage instead.
 */
export function Preloader() {
  const { progress, active, total } = useProgress();
  const setReady = useExperience((s) => s.setReady);

  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const everActive = useRef(false);

  // Latch the first time a real load is observed.
  useEffect(() => {
    if (active || total > 0) everActive.current = true;
  }, [active, total]);

  // Smoothly ramp the displayed % toward the target every frame.
  useEffect(() => {
    let raf = 0;
    const startedAt = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      // Nothing to load and nothing ever loaded → complete after a short beat
      // so the wordmark gets a moment on screen.
      const forceComplete =
        !everActive.current && total === 0 && !active && elapsed > 600;
      const target = forceComplete ? 100 : progress;

      setDisplay((d) => {
        const next = d + (target - d) * 0.12;
        return next > 99.5 ? 100 : next;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, active, total]);

  // When the bar fills, reveal the experience.
  useEffect(() => {
    if (display >= 100 && !done) {
      const t = setTimeout(() => {
        setDone(true);
        setReady(true);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [display, done, setReady]);

  const pct = Math.round(display);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-piano"
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h1 className="display text-4xl tracking-wide md:text-6xl">
              <span className="text-gold">{BRAND.name}</span>
            </h1>
            <p className="eyebrow mt-4">{BRAND.tagline}</p>
          </motion.div>

          <div className="mt-12 h-px w-48 overflow-hidden bg-white/10">
            <div
              className="h-full bg-gold-sheen transition-[width] duration-200 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 font-sans text-xs tracking-wide text-ivory-faint">
            {pct}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
