'use client';

import { create } from 'zustand';
import { sceneFromProgress } from '@/lib/constants';

interface ExperienceState {
  /** Global scroll progress across the whole site, 0 → 1. */
  progress: number;
  /** Active scene index, derived from progress. */
  activeScene: number;
  /** Has the preloader finished + first frame ready? */
  ready: boolean;
  /** Asset load progress 0 → 1 (driven by drei <Preload> / useProgress). */
  loadProgress: number;
  /** Reduced-motion / low-power mode (set from prefers-reduced-motion). */
  reducedMotion: boolean;

  setProgress: (p: number) => void;
  setReady: (r: boolean) => void;
  setLoadProgress: (p: number) => void;
  setReducedMotion: (r: boolean) => void;
}

export const useExperience = create<ExperienceState>((set, get) => ({
  progress: 0,
  activeScene: 0,
  // No preloader anymore — the experience is ready immediately, so the
  // nav and chapter indicator (which gate on `ready`) show right away.
  ready: true,
  loadProgress: 0,
  reducedMotion: false,

  setProgress: (p) => {
    const next = sceneFromProgress(p);
    if (next !== get().activeScene) {
      set({ progress: p, activeScene: next });
    } else {
      set({ progress: p });
    }
  },
  setReady: (ready) => set({ ready }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
