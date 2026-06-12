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
    image: '/conference-room.webp',
  },
  {
    title: 'Conference, Boardroom & Tele-Conference Studios',
    lead: 'Seamless AV integration',
    rest: 'for clear communication and smooth collaboration across distances.',
    image: '/conference-room.webp',
  },
  {
    title: 'E-Class Rooms & Seminar Halls',
    lead: 'Cutting-edge learning spaces',
    rest: 'with technology built for dynamic teaching, training and presentations.',
    image: '/conference-room.webp',
  },
  {
    title: 'Home Theatre Solutions',
    lead: 'Cinema-grade sound and picture,',
    rest: 'designed and calibrated around your space.',
    image: '/conference-room.webp',
  },
  {
    title: 'Multi-Room Audio & Background Music',
    lead: 'Music in every room,',
    rest: 'beautifully synchronised — with paging and background music for business spaces.',
    image: '/conference-room.webp',
  },
  {
    title: 'Auditoriums AV',
    lead: 'Large-venue sound, vision and control,',
    rest: 'engineered for auditoriums where every seat deserves the best.',
    image: '/conference-room.webp',
  },
  {
    title: 'Digital Signage & LED Video Wall',
    lead: 'Engaging content at any scale,',
    rest: 'from single displays to seamless LED video walls.',
    image: '/conference-room.webp',
  },
  {
    title: 'Intelligent Solutions & Stage Lighting',
    lead: 'Smart automation and dramatic lighting,',
    rest: 'bringing rooms and stages to life at the touch of a button.',
    image: '/conference-room.webp',
  },
  {
    title: 'Surveillance Solutions',
    lead: 'Round-the-clock protection,',
    rest: 'with surveillance systems that integrate cleanly into your AV setup.',
    image: '/conference-room.webp',
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
        {/* Header — eyebrow + display title, pinned top-left. Always
            visible (no scroll gating) so it reads even while the
            section is still entering the viewport. */}
        <div className="px-[7vw] pb-10 md:pb-14">
          <p className="eyebrow">{scene.copy.eyebrow}</p>
          <h2 className="display mt-3 text-4xl md:text-5xl lg:text-6xl">
            Solutions for every space.
          </h2>
        </div>

        {/* The horizontal track — large media cards with captions. */}
        <motion.div
          style={still ? undefined : { x: trackX }}
          className="flex w-max items-start gap-[4vw] pl-[7vw] pr-[7vw]"
        >
          {SOLUTION_CARDS.map((card, index) => (
            <div key={card.title} className="w-[78vw] flex-none md:w-[54vw]">
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
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
