'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useExperience } from '@/store/useExperience';
import { clamp } from '@/lib/utils';

/**
 * SmoothScroll
 * ------------
 * Drives the entire site with Lenis. We:
 *   1. Run Lenis off GSAP's ticker (single RAF loop, no jank).
 *   2. Push global scroll progress (0–1) into the zustand store on every
 *      frame, so the WebGL canvas can react without prop-drilling.
 *   3. Keep ScrollTrigger in sync so any GSAP timelines stay aligned.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const setProgress = useExperience((s) => s.setProgress);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // "infinite precision" feel — small wheel multiplier, high lerp
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    /**
     * Scene sections in scroll order. Progress is derived from their real
     * geometry (not raw scroll/limit) so sections of *any* height — e.g.
     * the 300vh pinned hero video or tall light panels — still map to
     * exactly 1/N of canvas progress each, keeping the 3D scenes in sync
     * with the DOM chapter on screen.
     *
     * A virtual "anchor" sweeps the full document height (top of page at
     * scroll 0 → bottom of page at max scroll); the scene containing the
     * anchor is active, and the anchor's position within it provides the
     * fractional part.
     */
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scene]')
    ).sort(
      (a, b) => Number(a.dataset.scene ?? 0) - Number(b.dataset.scene ?? 0)
    );

    const progressFromSections = (scroll: number, limit: number): number => {
      const docHeight = limit + window.innerHeight;
      const anchor = (scroll / limit) * docHeight; // document-space sweep

      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        const top = rect.top + scroll;
        const bottom = top + rect.height;
        if (anchor < bottom || i === sections.length - 1) {
          const local = clamp((anchor - top) / Math.max(1, rect.height));
          return (i + local) / sections.length;
        }
      }
      return 0;
    };

    lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
      const p =
        sections.length && limit > 0
          ? progressFromSections(scroll, limit)
          : limit > 0
            ? scroll / limit
            : 0;
      setProgress(p);
      ScrollTrigger.update();
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [setProgress]);

  return <>{children}</>;
}
