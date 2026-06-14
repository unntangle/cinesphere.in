'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Project } from '@/lib/gallery';

/**
 * GalleryLightbox — shared full-screen project preview.
 * -----------------------------------------------------
 * Walks the WHOLE project list: prev/next move through the current project's
 * images and, once a project is exhausted, continue into the next/previous
 * project (wrapping around at the ends). The label, counter and thumbnail
 * strip update to whichever project is currently showing.
 *
 * Controlled by `selection` (which project + image to open on); pass `null`
 * to close. Supports keyboard arrows, Esc / backdrop / × to close, and body
 * scroll-lock. Used by both the homepage teaser and the /gallery page.
 */

export interface LightboxSelection {
  projectIndex: number;
  imageIndex: number;
}

const imagesOf = (p: Project) => [p.main, ...p.more];

export function GalleryLightbox({
  projects,
  selection,
  onClose,
}: {
  projects: Project[];
  selection: LightboxSelection | null;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ p: 0, i: 0 });

  // Jump to the clicked project/image whenever a new selection opens.
  useEffect(() => {
    if (selection) setPos({ p: selection.projectIndex, i: selection.imageIndex });
  }, [selection]);

  // Step forward/back across ALL projects (wraps at the ends).
  const advance = (dir: number) =>
    setPos(({ p, i }) => {
      const total = projects.length;
      if (dir > 0) {
        if (i < imagesOf(projects[p]).length - 1) return { p, i: i + 1 };
        return { p: (p + 1) % total, i: 0 };
      }
      if (i > 0) return { p, i: i - 1 };
      const pp = (p - 1 + total) % total;
      return { p: pp, i: imagesOf(projects[pp]).length - 1 };
    });

  // Keyboard controls + body scroll-lock while open.
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') advance(1);
      else if (e.key === 'ArrowLeft') advance(-1);
    };
    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // advance is safe to omit: it only uses the stable `projects` prop and
    // functional setState, so it never reads stale values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, projects, onClose]);

  // Safe derived values (also valid when closed — the JSX just won't render).
  const project = projects[pos.p] ?? projects[0];
  const images = imagesOf(project);
  const count = images.length;
  const current = Math.min(pos.i, count - 1);

  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          key="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.label} preview`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm"
        >
          {/* Top bar — label + counter + close. */}
          <div
            className="flex items-center justify-between px-5 py-4 md:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline gap-3">
              <span className="eyebrow">{project.label}</span>
              <span className="font-sans text-xs text-ivory-muted">
                {current + 1} / {count}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ivory/80 transition-colors hover:bg-white/10 hover:text-ivory"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          {/* Fixed prev/next arrows — pinned to the viewport edges and
              vertically centred, so they never shift with the image size. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              advance(-1);
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory transition-colors hover:bg-white/20 md:left-6"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6L9 12L15 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              advance(1);
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory transition-colors hover:bg-white/20 md:right-6"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Stage — current image. */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-4 md:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={images[current]}
                src={images[current]}
                alt={`${project.label} — Cinesphere`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="max-h-full max-w-full rounded-xl object-contain"
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnail strip — current project's images. */}
          {count > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto px-4 py-5 md:py-6"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPos({ p: pos.p, i })}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-14 w-14 flex-none overflow-hidden rounded-lg transition-all md:h-16 md:w-16 ${
                    i === current
                      ? 'ring-2 ring-champagne'
                      : 'opacity-55 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
