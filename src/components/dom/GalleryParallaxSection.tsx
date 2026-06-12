'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useExperience } from '@/store/useExperience';

/**
 * GalleryParallaxSection — "Latest Works" living wall
 * ----------------------------------------------------
 * A unique gallery: three columns of project tiles drift vertically at
 * DIFFERENT speeds as the section scrolls through the viewport — a
 * living mosaic rather than a static grid. Each tile zooms softly on
 * hover and reveals a champagne caption.
 *
 * Images are Unsplash placeholders (sound / cinema themed) — replace
 * the `src` values in GALLERY_COLUMNS with real project photos
 * (drop files in /public and use '/your-photo.webp').
 */

interface GalleryItem {
  src: string;
  label: string;
  /** Tailwind aspect class — varied per tile for the mosaic rhythm. */
  aspect: string;
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const GALLERY_COLUMNS: GalleryItem[][] = [
  [
    {
      src: u('photo-1489599849927-2ee91cede3ba'),
      label: 'Private Cinema · Chennai',
      aspect: 'aspect-[3/4]',
    },
    {
      src: u('photo-1478720568477-152d9b164e26'),
      label: 'Projection Suite',
      aspect: 'aspect-square',
    },
    {
      src: u('photo-1520523839897-bd0b52f945a0'),
      label: 'Studio Control Room',
      aspect: 'aspect-[4/5]',
    },
  ],
  [
    {
      src: u('photo-1517604931442-7e0c8ed2963c'),
      label: 'Auditorium AV',
      aspect: 'aspect-[4/5]',
    },
    {
      src: u('photo-1598488035139-bdbb2231ce04'),
      label: 'Home Theatre Build',
      aspect: 'aspect-[3/4]',
    },
    {
      src: u('photo-1493225457124-a3eb161ffa5f'),
      label: 'Stage & Lighting',
      aspect: 'aspect-square',
    },
  ],
  [
    {
      src: u('photo-1470225620780-dba8ba36b745'),
      label: 'Live Mixing Desk',
      aspect: 'aspect-square',
    },
    {
      src: u('photo-1583394838336-acd977736f90'),
      label: 'Listening Room',
      aspect: 'aspect-[3/4]',
    },
    {
      src: u('photo-1558618666-fcd25c85cd64'),
      label: 'Multi-Room Audio',
      aspect: 'aspect-[4/5]',
    },
  ],
];

/** Per-column drift: [start, end] vertical offsets across the scroll. */
const COLUMN_DRIFT: [string, string][] = [
  ['6vh', '-8vh'],
  ['14vh', '-2vh'],
  ['2vh', '-12vh'],
];

export function GalleryParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

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
      className="relative z-10 w-full overflow-hidden bg-piano py-20 md:py-28"
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
        {GALLERY_COLUMNS.map((column, c) => (
          <motion.div
            key={c}
            style={still ? undefined : { y: columnYs[c] }}
            className={`flex flex-col gap-4 md:gap-6 ${
              c === 2 ? 'hidden md:flex' : ''
            }`}
          >
            {column.map((item) => (
              <figure
                key={item.label}
                className={`group relative w-full overflow-hidden rounded-2xl bg-carbon ${item.aspect}`}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className="h-full w-full object-cover brightness-[0.85] saturate-[1.05] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-100"
                  loading="lazy"
                  draggable={false}
                />
                {/* Caption — slides up on hover. */}
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="eyebrow">{item.label}</span>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
