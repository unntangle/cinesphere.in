'use client';

import { SmoothScroll } from '@/components/dom/SmoothScroll';
import { Navigation } from '@/components/dom/Navigation';
import { Overlay } from '@/components/dom/Overlay';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * NOTE: the 3D WebGL canvas (speaker cone, sound waves, particle scenes)
 * has been removed from the homepage. The scene components still live in
 * src/components/canvas/ if they're ever needed again — re-mount
 * <Experience /> here to restore them.
 */

export default function Home() {
  // Sync OS reduced-motion preference into the store.
  useReducedMotion();

  return (
    <SmoothScroll>
      {/* Fixed DOM chrome. */}
      <Navigation />

      {/* Scrolling copy overlay — defines scroll height, drives the journey. */}
      <div>
        <Overlay />
      </div>
    </SmoothScroll>
  );
}
