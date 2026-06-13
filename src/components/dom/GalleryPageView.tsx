'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import { PROJECTS } from '@/lib/gallery';
import {
  GalleryLightbox,
  type LightboxSelection,
} from './GalleryLightbox';

/**
 * GalleryPageView — the dedicated /gallery page.
 * ----------------------------------------------
 * Reuses the site's fixed Navigation and footer. Projects are laid out in a
 * responsive grid; each project leads with its MAIN (.1) cover image, with
 * the remaining shots (.2, .3, …) as smaller supporting thumbnails beneath.
 *
 * Clicking a project (cover or any thumbnail) opens the shared full-screen
 * lightbox, which previews that project's images and continues into the next
 * project once the current one is exhausted. Data comes from PROJECTS in
 * src/lib/gallery.ts.
 */
export function GalleryPageView() {
  const [selection, setSelection] = useState<LightboxSelection | null>(null);

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
            return (
              <article key={project.id} className="flex flex-col">
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
                      className="h-full w-full object-cover brightness-[0.9] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-100"
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

                {/* Supporting shots (.2, .3, …) — smaller thumbnails. */}
                {project.more.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {project.more.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() =>
                          setSelection({
                            projectIndex: pIndex,
                            imageIndex: i + 1,
                          })
                        }
                        aria-label={`Open ${project.label} preview at image ${i + 2}`}
                        className="h-16 w-16 overflow-hidden rounded-lg bg-carbon md:h-20 md:w-20"
                      >
                        <img
                          src={src}
                          alt={`${project.label} — Cinesphere`}
                          className="h-full w-full object-cover brightness-[0.85] transition-all duration-500 hover:scale-105 hover:brightness-100"
                          loading="lazy"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </article>
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
