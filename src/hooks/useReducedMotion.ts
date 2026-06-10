'use client';

import { useEffect } from 'react';
import { useExperience } from '@/store/useExperience';

/**
 * Mirrors the OS "reduce motion" preference into the store so scenes can
 * dial down particle counts and disable heavy post-processing.
 */
export function useReducedMotion() {
  const setReducedMotion = useExperience((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setReducedMotion]);
}
