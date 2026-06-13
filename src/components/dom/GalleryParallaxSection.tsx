'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useExperience } from '@/store/useExperience';
import { HOMEPAGE_PROJECTS } from '@/lib/gallery';
import { Button } from '@/components/ui/Button';
import {
  GalleryLightbox,
  type LightboxSelection,
} from './GalleryLightbox';

/**
 * GalleryParallaxSection — "Latest Works" living wall (homepage teaser)
 * --------------------------------------------------------------------
 * A curated handful of real projects in three columns that drift vertically
 * at DIFFERENT speeds as the section scrolls — a living mosaic rather than a
 * static grid. Each tile zooms softly on hover, reveals a champagne caption,
 * and — on click — opens the shared full-screen preview (which walks across
 * the featured projects). An "Explore the full gallery" button links to the
 * dedicated /gallery page.
 *
 * Featured projects come from HOMEPAGE_PROJECTS in src/lib/gallery.ts.
 */

/* Three columns of two tiles each; each tile references a featured project by
   its index. Aspect classes vary per tile to give the mosaic its rhythm.
   `zoom` slightly enlarges + crops a cover image to hide baked-in borders
   (e.g. Project 1's source photo has white bands top/bottom). */
const COLUMNS: { index: number; aspect: string; zoom?: boolean }[][] = [
  [
    { index: 0, aspect: 'aspect-[3/4]', zoom: true },
    { index: 3, aspect: 'aspect-square' },
  ],
  [
    { index: 1, aspect: 'aspect-square' },
    { index: 4, aspect: 'aspect-[4/5]' },
  ],
  [
    { index: 2, aspect: 'aspect-[4/5]' },
    { index: 5, aspect: 'aspect-[3/4]' },
  ],
];

/** Per-column drift: [start, end] vertical offsets across the scroll.
 *  Kept gentle so the columns don't leave large empty gaps below them. */
const COLUMN_DRIFT: [string, string][] = [
  ['3vh', '-4vh'],
  ['7vh', '-1vh'],
  ['1vh', '-6vh'],
];

export function GalleryParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [selection, setSelection] = useState<LightboxSelection | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // One transform per column — hooks called unconditionally, in order.
  const col0Y = useTransform(scrollYProgress, [0, 1], COLUMN_DRIFT[0]);
  const col1Y = useTransform(scrollYProgress, [0, 1], COLUMN_DRIFT[1]);
  const col2Y = useTransform(scrollYProgress, [0, 1], COLUMN_DRIFT[2]);
  const columnYs = [col0Y, col1Y, col2Y];

  const still = reducedMotion;

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-10 w-full overflow-hidden bg-piano py-14 md:py-20"
    >
      {/* Header. */}
      <div className="px-[7vw]">
        <p className="eyebrow">Gallery</p>
        <h2 className="display mt-3 text-3xl text-ivory md:text-4xl lg:text-5xl">
          Let&apos;s check our latest works.
        </h2>
        <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ivory-muted md:text-base">
          Auditoriums, home theatres, seminar halls and studios — 80+
          projects delivered.
        </p>
      </div>

      {/* The living wall — three columns drifting at different speeds. */}
      <div className="mt-12 grid grid-cols-2 items-start gap-4 px-[7vw] md:mt-16 md:grid-cols-3 md:gap-6">
        {COLUMNS.map((column, c) => (
          <motion.div
            key={c}
            style={still ? undefined : { y: columnYs[c] }}
            className={`flex flex-col gap-4 md:gap-6 ${
              c === 2 ? 'hidden md:flex' : ''
            }`}
          >
            {column.map(({ index, aspect, zoom }) => {
              const project = HOMEPAGE_PROJECTS[index];
              const count = 1 + project.more.length;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() =>
                    setSelection({ projectIndex: index, imageIndex: 0 })
                  }
                  aria-label={`Open ${project.label} preview`}
                  className={`group relative block w-full overflow-hidden rounded-2xl bg-carbon text-left ${aspect}`}
                >
                  <img
                    src={project.main}
                    alt={`${project.label} — Cinesphere`}
                    className={`h-full w-full object-cover brightness-[0.85] saturate-[1.05] transition-transform duration-700 ease-out group-hover:brightness-100 ${
                      zoom
                        ? 'scale-[1.3] group-hover:scale-[1.38]'
                        : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                    draggable={false}
                  />

                  {count > 1 && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[11px] font-medium text-ivory backdrop-blur-sm">
                      {count} photos
                    </span>
                  )}

                  {/* Caption — slides up on hover. */}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="eyebrow">{project.label}</span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        ))}
      </div>

      {/* Explore — through to the dedicated full gallery page. */}
      <div className="mt-8 flex justify-center px-[7vw] md:mt-10">
        <Link href="/gallery" aria-label="Explore the full gallery">
          <Button variant="ghost">
            Explore the full gallery
            <span
              aria-hidden
              className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Button>
        </Link>
      </div>

      {/* Shared full-screen preview — walks across the featured projects. */}
      <GalleryLightbox
        projects={HOMEPAGE_PROJECTS}
        selection={selection}
        onClose={() => setSelection(null)}
      />
    </section>
  );
}
