'use client';

/**
 * @deprecated No longer used.
 *
 * Asset-load progress is now read directly in the DOM `Preloader` via drei's
 * `useProgress` (which works outside the Canvas). This component previously
 * lived *inside* the Suspense boundary, where it could not report progress
 * during suspension. Kept as a stub to avoid a dangling import if referenced;
 * safe to delete.
 */
export function LoadBridge() {
  return null;
}
