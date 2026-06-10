'use client';

import dynamic from 'next/dynamic';
import { SmoothScroll } from '@/components/dom/SmoothScroll';
import { Navigation } from '@/components/dom/Navigation';
import { ScrollProgress } from '@/components/dom/ScrollProgress';
import { Overlay } from '@/components/dom/Overlay';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * The 3D canvas is loaded client-only (ssr: false). WebGL can't render on
 * the server, and deferring it keeps the initial HTML light + fast.
 */
const Experience = dynamic(
  () => import('@/components/canvas/Experience').then((m) => m.Experience),
  { ssr: false }
);

export default function Home() {
  // Sync OS reduced-motion preference into the store.
  useReducedMotion();

  return (
    <SmoothScroll>
      {/* Fixed WebGL film, behind everything. */}
      <Experience />

      {/* Fixed DOM chrome. */}
      <Navigation />
      <ScrollProgress />

      {/* Scrolling copy overlay — defines scroll height, drives the journey. */}
      <div>
        <Overlay />
      </div>
    </SmoothScroll>
  );
}
