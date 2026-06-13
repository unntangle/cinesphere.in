'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * SolutionsCarouselSection — Scenes 05–07 merged (Our Solutions)
 * ---------------------------------------------------------------
 * Apple-style horizontal showcase: the section pins as a light
 * editorial panel, and a row of large rounded media cards — one per
 * solution, each with a caption beneath it — glides RIGHT → LEFT,
 * one by one, driven by vertical scroll.
 *
 * To change the cards, edit SOLUTION_CARDS below: swap `image` paths
 * (drop new files in /public), adjust captions, add or remove cards —
 * the scroll distance adapts to the count automatically.
 */

/** Scroll runway in viewport-heights — scales with the card count. */
const CAROUSEL_SCREENS = 1 + 0.45 * 9;

interface SolutionCard {
  title: string;
  /** Bold lead-in phrase (dark), Apple-caption style. */
  lead: string;
  /** Rest of the caption (muted gray). */
  rest: string;
  /** Optional — cards without an image render a typographic tile. */
  image?: string;
  /** 'cover' fills the card; 'contain' letterboxes product shots on black. */
  fit?: 'cover' | 'contain';
}

const SOLUTION_CARDS: SolutionCard[] = [
  {
    title: 'Audio / Video Display Solutions',
    lead: 'High-impact displays with immersive audio,',
    rest: 'tuned for clarity and presence in any environment.',
    image:
      'https://images.unsplash.com/photo-1635788798247-92a15f830a3b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Conference, Boardroom & Tele-Conference Studios',
    lead: 'Seamless AV integration',
    rest: 'for clear communication and smooth collaboration across distances.',
    image: '/images/conference-room.webp',
  },
  {
    title: 'E-Class Rooms & Seminar Halls',
    lead: 'Cutting-edge learning spaces',
    rest: 'with technology built for dynamic teaching, training and presentations.',
    image:
      'https://images.unsplash.com/photo-1755995286639-0164e827640a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Home Theatre Solutions',
    lead: 'Cinema-grade sound and picture,',
    rest: 'designed and calibrated around your space.',
    image:
      'https://images.unsplash.com/photo-1776303054657-4d21e2a6ef18?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Multi-Room Audio & Background Music',
    lead: 'Music in every room,',
    rest: 'beautifully synchronised — with paging and background music for business spaces.',
    image:
      'https://images.unsplash.com/photo-1711127093141-caea1718c784?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Auditoriums AV',
    lead: 'Large-venue sound, vision and control,',
    rest: 'engineered for auditoriums where every seat deserves the best.',
    image:
      'https://images.unsplash.com/photo-1722321974501-059dff03e970?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Digital Signage & LED Video Wall',
    lead: 'Engaging content at any scale,',
    rest: 'from single displays to seamless LED video walls.',
    image:
      'https://images.unsplash.com/photo-1562342918-28657524a992?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Intelligent Solutions & Stage Lighting',
    lead: 'Smart automation and dramatic lighting,',
    rest: 'bringing rooms and stages to life at the touch of a button.',
    image:
      'https://images.unsplash.com/photo-1626220777023-61ac837f0871?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Surveillance Solutions',
    lead: 'Round-the-clock protection,',
    rest: 'with surveillance systems that integrate cleanly into your AV setup.',
    image:
      'https://images.unsplash.com/photo-1496368077930-c1e31b4e5b44?auto=format&fit=crop&w=1600&q=80',
  },
];

/* Track geometry (desktop): card 54vw + 4vw gap, 7vw padding each side.
   The end translate is derived from the card count so adding/removing
   cards keeps the last card landing neatly at the right edge. */
const CARD_VW = 54;
const GAP_VW = 4;
const PAD_VW = 7;
const TRACK_VW =
  SOLUTION_CARDS.length * CARD_VW + (SOLUTION_CARDS.length - 1) * GAP_VW;
const TRACK_END_PCT = -(((TRACK_VW - (100 - 2 * PAD_VW)) / TRACK_VW) * 100);

export function SolutionsCarouselSection({ scene }: { scene: SceneDef }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // The track glides right → left as the section scrubs; the endpoint
  // is derived from the card count (see TRACK_END_PCT above).
  const trackX = useTransform(
    scrollYProgress,
    [0.06, 0.94],
    ['0%', `${TRACK_END_PCT.toFixed(2)}%`],
  );

  const still = reducedMotion;

  return (
    <section
      ref={sectionRef}
      id={scene.id}
      data-scene={scene.index}
      className="section-light relative z-10 w-full"
      style={{ height: `${CAROUSEL_SCREENS * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden">
        {/* Header — eyebrow + display title. Staggers into view (rising
            out of a soft blur) the first time the section appears. */}
        <motion.div
          initial={still ? undefined : 'hidden'}
          whileInView={still ? undefined : 'show'}
          viewport={{ once: true, margin: '-20%' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
          }}
          className="px-[7vw] pb-10 md:pb-14"
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
              show: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="eyebrow"
          >
            {scene.copy.eyebrow}
          </motion.p>
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
              show: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="display mt-3 text-4xl md:text-5xl lg:text-6xl"
          >
            Solutions for every space.
          </motion.h2>
        </motion.div>

        {/* The horizontal track — large media cards with captions.
            Orchestrates a staggered reveal: each card lifts + fades up
            in sequence the first time the section enters the viewport. */}
        <motion.div
          initial={still ? undefined : 'hidden'}
          whileInView={still ? undefined : 'show'}
          viewport={{ once: true, margin: '-15%' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
          }}
        >
        <motion.div
          style={still ? undefined : { x: trackX }}
          className="flex w-max items-start gap-[4vw] pl-[7vw] pr-[7vw]"
        >
          {SOLUTION_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              variants={
                still
                  ? undefined
                  : {
                      hidden: { opacity: 0, y: 60, scale: 0.94 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                      },
                    }
              }
              className="w-[78vw] flex-none md:w-[54vw]"
            >
              <div className="relative h-[42vh] w-full overflow-hidden rounded-3xl bg-carbon md:h-[52vh]">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    className={`h-full w-full ${
                      card.fit === 'contain'
                        ? 'object-contain p-8'
                        : 'object-cover'
                    }`}
                    style={
                      card.image === '/images/conference-room.webp'
                        ? undefined
                        : {
                            filter:
                              'sepia(0.5) saturate(1.45) hue-rotate(-12deg) brightness(0.9) contrast(1.05)',
                          }
                    }
                    draggable={false}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-piano-fade" />
                )}

                {/* Legibility scrim + serial number & title overlay.
                    `!` overrides the .section-light .display/.eyebrow
                    colour rules, which would otherwise paint these dark. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <span className="eyebrow !text-champagne">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="display mt-2 text-lg !text-ivory md:text-xl lg:text-2xl">
                    {card.title}
                  </h3>
                </div>
              </div>
              <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-ivory-muted md:text-lg">
                <span className="font-semibold text-carbon">{card.lead}</span>{' '}
                {card.rest}
              </p>
            </motion.div>
          ))}
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
