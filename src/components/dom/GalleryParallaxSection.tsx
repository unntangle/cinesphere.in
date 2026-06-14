'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
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

/* Entrance reveal variants. Annotated with `Variants` so the cubic-bezier
   ease arrays are accepted as tuples. */
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
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
/* Per-column orchestrator — staggers its own tiles as the column enters. */
const TILE_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const TILE_ITEM: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};
/* Mobile-only entrance — a zigzag slide: the left column's tiles glide in
   from the left, the right column's from the right (desktop keeps TILE_ITEM
   above). overflow-hidden on the section clips the horizontal travel. */
const MOBILE_TILE_ITEM = (fromLeft: boolean): Variants => ({
  hidden: { opacity: 0, x: fromLeft ? -56 : 56 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
});

export function GalleryParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [selection, setSelection] = useState<LightboxSelection | null>(null);

  // Mobile gets a distinct zigzag tile entrance; desktop keeps its existing
  // fade-up + scale reveal. Tracked the same way as the Solutions section.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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
      {/* Header — staggers into view (rising out of a soft blur) as the
          section first appears. */}
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

      {/* The living wall — three columns drifting at different speeds. */}
      <div className="mt-12 grid grid-cols-2 items-start gap-4 px-[7vw] md:mt-16 md:grid-cols-3 md:gap-6">
        {COLUMNS.map((column, c) => (
          <motion.div
            key={c}
            initial={still ? undefined : 'hidden'}
            whileInView={still ? undefined : 'show'}
            viewport={{ once: true, margin: '-10%' }}
            variants={still ? undefined : TILE_STAGGER}
            style={still ? undefined : { y: columnYs[c] }}
            className={`flex flex-col gap-4 md:gap-6 ${
              c === 2 ? 'hidden md:flex' : ''
            }`}
          >
            {column.map(({ index, aspect, zoom }) => {
              const project = HOMEPAGE_PROJECTS[index];
              const count = 1 + project.more.length;
              return (
                <motion.button
                  key={project.id}
                  type="button"
                  variants={
                    still
                      ? undefined
                      : isDesktop
                        ? TILE_ITEM
                        : MOBILE_TILE_ITEM(c % 2 === 0)
                  }
                  onClick={() =>
                    setSelection({ projectIndex: index, imageIndex: 0 })
                  }
                  aria-label={`Open ${project.label} preview`}
                  className={`group relative block w-full text-left ${aspect}`}
                >
                  {/* Perspective host — isolates the 3D from the button's
                      own reveal transform. */}
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

                      {/* BACK — a mirror of the front so the flip only ever
                          shows the same photo (no separate back content); it
                          rolls back to the front when the hover ends. */}
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
