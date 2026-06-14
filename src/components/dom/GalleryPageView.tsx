'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import { PROJECTS } from '@/lib/gallery';
import {
  GalleryLightbox,
  type LightboxSelection,
} from './GalleryLightbox';
import { useExperience } from '@/store/useExperience';

/* Scroll-reveal: each card fades and rises into place, staggered left-to-right
   within its row (delay derived from the column index). No blur here — a blur
   on a bright image over the black page bleeds a light halo past the card's
   rounded edge. Collapses to nothing under reduced motion. */
const EASE = [0.16, 1, 0.3, 1] as const;
const cardV = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: (i % 3) * 0.08 },
  }),
};

/* These projects ship source photos with a thicker baked-in white matte, so
   they need a heavier crop to push the border off the card edges. */
const EXTRA_CROP = new Set(['project-13', 'project-15']);

/**
 * GalleryPageView — the dedicated /gallery page.
 * ----------------------------------------------
 * Reuses the site's fixed Navigation and footer. Projects are laid out in a
 * responsive grid; each project shows its MAIN (.1) cover image.
 *
 * Clicking a project opens the shared full-screen lightbox, which previews
 * that project's images and continues into the next project once the current
 * one is exhausted. Data comes from PROJECTS in src/lib/gallery.ts.
 */
export function GalleryPageView() {
  const [selection, setSelection] = useState<LightboxSelection | null>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  return (
    <>
      <Navigation />

      <main id="top" className="relative z-10 min-h-screen bg-piano">
        {/* Header — clears the fixed nav with generous top padding. */}
        <header className="px-[7vw] pb-12 pt-32 md:pb-16 md:pt-40">
          <p className="eyebrow">Gallery</p>
          <h1 className="display mt-3 text-4xl text-ivory md:text-6xl">
            Our latest works.
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ivory-muted md:text-base">
            Auditoriums, home theatres, seminar halls and studios — 80+
            projects delivered. Tap a project to preview its photos.
          </p>
          <Link
            href="/#top"
            className="mt-6 inline-flex items-center gap-2 font-sans text-xs text-champagne transition-colors hover:text-champagne-light"
          >
            <span aria-hidden>←</span> Back to home
          </Link>
        </header>

        {/* Projects — main (.1) cover image leads each project. */}
        <div className="grid grid-cols-1 gap-8 px-[7vw] pb-20 sm:grid-cols-2 md:gap-10 md:pb-28 lg:grid-cols-3">
          {PROJECTS.map((project, pIndex) => {
            const count = 1 + project.more.length;
            const coverScale = EXTRA_CROP.has(project.id)
              ? 'scale-[1.28] group-hover:scale-[1.34]'
              : 'scale-[1.12] group-hover:scale-[1.18]';
            return (
              <motion.article
                key={project.id}
                custom={pIndex}
                variants={reducedMotion ? undefined : cardV}
                initial={reducedMotion ? false : 'hidden'}
                whileInView={reducedMotion ? undefined : 'show'}
                viewport={{ once: true, margin: '-12% 0px' }}
                className="flex flex-col"
              >
                {/* Main / cover image (the ".1" serial) — opens the preview. */}
                <button
                  type="button"
                  onClick={() =>
                    setSelection({ projectIndex: pIndex, imageIndex: 0 })
                  }
                  aria-label={`Open ${project.label} preview`}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-carbon text-left"
                >
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={project.main}
                      alt={`${project.label} — Cinesphere`}
                      className={`h-full w-full object-cover brightness-[0.9] transition-transform duration-700 ease-out group-hover:brightness-100 ${coverScale}`}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Photo-count badge — hints there's more to see. */}
                  {count > 1 && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[11px] font-medium text-ivory backdrop-blur-sm">
                      {count} photos
                    </span>
                  )}

                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="eyebrow">{project.label}</span>
                  </span>
                </button>
              </motion.article>
            );
          })}
        </div>
      </main>

      <FooterSection />

      {/* Shared full-screen preview — walks across all projects. */}
      <GalleryLightbox
        projects={PROJECTS}
        selection={selection}
        onClose={() => setSelection(null)}
      />
    </>
  );
}
