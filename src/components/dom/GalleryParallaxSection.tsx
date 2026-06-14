'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { useExperience } from '@/store/useExperience';
import { HOMEPAGE_PROJECTS } from '@/lib/gallery';
import { Button } from '@/components/ui/Button';
import {
  GalleryLightbox,
  type LightboxSelection,
} from './GalleryLightbox';

/**
 * GalleryParallaxSection — "Latest Works" wall (homepage teaser)
 * --------------------------------------------------------------
 * A curated handful of real projects in a uniform, top-aligned grid
 * (2 columns on mobile, 3 on desktop). Every tile is an equal 4/3 cell of a
 * single CSS grid, so rows and columns always line up. Each tile zooms /
 * flips softly on hover, reveals a champagne caption, and — on click — opens
 * the shared full-screen preview.
 *
 * Featured projects come from HOMEPAGE_PROJECTS in src/lib/gallery.ts.
 */

/* Six featured projects, rendered as equal cells of one grid. `zoom` slightly
   enlarges + crops a cover image to hide baked-in borders (e.g. Project 1's
   source photo has white bands top/bottom). All tiles share a 4/3 ratio. */
const TILES: { index: number; zoom?: boolean }[] = [
  { index: 0, zoom: true },
  { index: 1 },
  { index: 2 },
  { index: 3 },
  { index: 4 },
  { index: 5 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/* Header entrance — rises out of a soft blur. */
const REVEAL_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const REVEAL_ITEM: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE },
  },
};

/* Tile entrance — a pure opacity fade. No scale / slide, so every tile always
   fills its full grid cell: the wall can never look uneven mid-animation. */
const TILE_ITEM: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export function GalleryParallaxSection() {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [selection, setSelection] = useState<LightboxSelection | null>(null);
  const still = reducedMotion;

  return (
    <section
      id="projects"
      className="relative z-10 w-full overflow-hidden bg-piano py-14 md:py-20"
    >
      {/* Header — staggers into view as the section first appears. */}
      <motion.div
        initial={still ? undefined : 'hidden'}
        whileInView={still ? undefined : 'show'}
        viewport={{ once: true, margin: '-20%' }}
        variants={still ? undefined : REVEAL_CONTAINER}
        className="px-[7vw]"
      >
        <motion.p variants={still ? undefined : REVEAL_ITEM} className="eyebrow">
          Gallery
        </motion.p>
        <motion.h2
          variants={still ? undefined : REVEAL_ITEM}
          className="display mt-3 text-3xl text-ivory md:text-4xl lg:text-5xl"
        >
          Let&apos;s check our latest works.
        </motion.h2>
        <motion.p
          variants={still ? undefined : REVEAL_ITEM}
          className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ivory-muted md:text-base"
        >
          Auditoriums, home theatres, seminar halls and studios — 80+
          projects delivered.
        </motion.p>
      </motion.div>

      {/* The wall — one uniform grid: 2 columns on mobile, 3 on desktop.
          `items-start` + equal 4/3 cells keep every row and column aligned. */}
      <div className="mt-12 grid grid-cols-2 items-start gap-4 px-[7vw] md:mt-16 md:grid-cols-3 md:gap-6">
        {TILES.map(({ index, zoom }) => {
          const project = HOMEPAGE_PROJECTS[index];
          const count = 1 + project.more.length;
          return (
            <motion.button
              key={project.id}
              type="button"
              initial={still ? undefined : 'hidden'}
              whileInView={still ? undefined : 'show'}
              viewport={{ once: true, margin: '-10%' }}
              variants={still ? undefined : TILE_ITEM}
              onClick={() =>
                setSelection({ projectIndex: index, imageIndex: 0 })
              }
              aria-label={`Open ${project.label} preview`}
              className="group relative block aspect-[4/3] w-full text-left"
            >
              {/* Perspective host — isolates the 3D flip from layout. */}
              <div className="h-full w-full [perspective:1200px]">
                {/* Flipper — rotates on hover to reveal the back face. */}
                <div
                  className={`relative h-full w-full rounded-2xl shadow-[0_10px_34px_-14px_rgba(0,0,0,0.7)] [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    still ? '' : 'group-hover:[transform:rotateY(180deg)]'
                  }`}
                >
                  {/* FRONT — the project photo. */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl bg-carbon [backface-visibility:hidden]">
                    <img
                      src={project.main}
                      alt={`${project.label} — Cinesphere`}
                      className={`h-full w-full object-cover brightness-[0.9] saturate-[1.05] ${
                        zoom ? 'scale-[1.3]' : ''
                      }`}
                      loading="lazy"
                      draggable={false}
                    />

                    {count > 1 && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[11px] font-medium text-ivory backdrop-blur-sm">
                        {count} photos
                      </span>
                    )}

                    {/* Label resting at the foot of the card. */}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <span className="eyebrow">{project.label}</span>
                    </span>
                  </div>

                  {/* BACK — a mirror of the front so the flip only ever shows
                      the same photo; it rolls back when the hover ends. */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl bg-carbon [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <img
                      src={project.main}
                      alt=""
                      aria-hidden
                      className={`h-full w-full object-cover brightness-[0.9] saturate-[1.05] ${
                        zoom ? 'scale-[1.3]' : ''
                      }`}
                      loading="lazy"
                      draggable={false}
                    />

                    {count > 1 && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[11px] font-medium text-ivory backdrop-blur-sm">
                        {count} photos
                      </span>
                    )}

                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <span className="eyebrow">{project.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explore — through to the dedicated full gallery page. */}
      <div className="mt-8 flex justify-center px-[7vw] md:mt-10">
        <Link href="/gallery" aria-label="View more projects">
          <Button variant="ghost">
            View More
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
