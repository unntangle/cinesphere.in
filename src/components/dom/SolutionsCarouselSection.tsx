'use client';

import { useEffect, useRef, useState } from 'react';
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

/** Scroll runway in viewport-heights — scales with the card count (11). */
const CAROUSEL_SCREENS = 1 + 0.45 * 11;

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

export const SOLUTION_CARDS: SolutionCard[] = [
  {
    title: 'Luxury Home Theatre Systems',
    lead: 'Reference-grade cinema at home,',
    rest: 'designed, installed and calibrated around the way you watch and listen.',
    image:
      'https://images.unsplash.com/photo-1650091507687-5ea34d80e674?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Private Cinemas',
    lead: 'A dedicated theatre of your own,',
    rest: 'tiered seating, true blacks and big-screen scale, built into your space.',
    image:
      'https://images.unsplash.com/photo-1687773448285-50ee470e5583?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Immersive Audio',
    lead: 'Dolby Atmos and surround sound,',
    rest: 'placing you inside the scene with height, depth and pinpoint detail.',
    image:
      'https://images.unsplash.com/photo-1504904126298-3fde501c9b31?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Acoustics',
    lead: 'Rooms tuned to sound right,',
    rest: 'with treatment and calibration that tame reflections and reveal every detail.',
    image:
      'https://images.unsplash.com/photo-1585395721167-fcaef5e1cc3f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Audiophile Systems',
    lead: 'High-fidelity two-channel sound,',
    rest: 'reference electronics and loudspeakers set up for honest, musical listening.',
    image:
      'https://images.unsplash.com/photo-1757889693087-2fc515c9471d?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Multiroom Audio Systems',
    lead: 'Music in every room,',
    rest: 'beautifully synchronised and controlled from a single app or touch panel.',
    image:
      'https://images.unsplash.com/photo-1529359744902-86b2ab9edaea?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Media Rooms',
    lead: 'A relaxed cinematic lounge,',
    rest: 'big-screen entertainment that lives comfortably in an everyday room.',
    image:
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Outdoor Entertainment Systems',
    lead: 'Cinema and sound outdoors,',
    rest: 'weatherised speakers and screens for patios, gardens and poolside.',
    image:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'LED Display Solutions',
    lead: 'Brilliant large-format LED,',
    rest: 'from premium direct-view walls to seamless big-screen video.',
    image:
      'https://images.unsplash.com/photo-1703890641448-8b56191d7bdc?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Cinema Interiors',
    lead: 'Bespoke theatre design,',
    rest: 'seating, lighting, acoustics and finishes crafted into one cohesive room.',
    image:
      'https://images.unsplash.com/photo-1710131459450-7c384b8be18f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Studio Design',
    lead: 'Purpose-built studio spaces,',
    rest: 'control rooms and production suites engineered for accurate sound.',
    image:
      'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=1600&q=80',
  },
];

/* Track geometry (desktop): card 54vw + 4vw gap, 7vw padding each side.
   The end translate is derived from the card count so adding/removing
   cards keeps the last card landing neatly at the right edge. */
/**
 * Stable anchor slug for a solution title — shared by the dedicated
 * /solutions page (section ids) and the nav dropdown (hash links) so the
 * two never drift.
 */
export const solutionSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const CARD_VW = 54;
const GAP_VW = 4;
const PAD_VW = 7;
const TRACK_VW =
  SOLUTION_CARDS.length * CARD_VW + (SOLUTION_CARDS.length - 1) * GAP_VW;
const TRACK_END_PCT = -(((TRACK_VW - (100 - 2 * PAD_VW)) / TRACK_VW) * 100);

/**
 * One solution card — the media tile (image + serial number + title) and
 * its caption beneath. Shared by the desktop scrub track and the mobile
 * stacked list so both stay identical.
 */
function SolutionCardView({
  card,
  index,
}: {
  card: SolutionCard;
  index: number;
}) {
  return (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-carbon md:aspect-auto md:h-[52vh]">
        {card.image ? (
          <img
            src={card.image}
            alt={card.title}
            className={`h-full w-full ${
              card.fit === 'contain' ? 'object-contain p-8' : 'object-cover'
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

        {/* Legibility scrim + serial number & title overlay. `!` overrides
            the .section-light .display/.eyebrow colour rules. */}
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
    </>
  );
}

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

  // Desktop drives the pinned horizontal scrub. On mobile that pattern is
  // awkward and the scrub maths assume desktop card widths; reduced motion
  // shouldn't pin at all — both fall back to a simple vertical stack.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const carousel = isDesktop && !reducedMotion;

  // Shared header (animates only in the desktop scrub).
  const header = (
    <motion.div
      initial={carousel ? 'hidden' : undefined}
      whileInView={carousel ? 'show' : undefined}
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
        className="display mt-3 text-3xl md:text-4xl lg:text-5xl"
      >
        Solutions for every space.
      </motion.h2>
    </motion.div>
  );

  // MOBILE / reduced motion — a clean vertical stack of the same cards.
  if (!carousel) {
    return (
      <section
        ref={sectionRef}
        id={scene.id}
        data-scene={scene.index}
        className="section-light relative z-10 w-full py-16 md:py-20"
      >
        {header}
        {/* Zigzag entrance — odd cards slide in from the left, even from the
            right, each as it scrolls into view. overflow-hidden keeps the
            horizontal travel from ever spilling past the viewport edge. */}
        <div className="flex flex-col gap-12 overflow-hidden px-[7vw]">
          {SOLUTION_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={
                reducedMotion
                  ? undefined
                  : { opacity: 0, x: index % 2 === 0 ? -64 : 64 }
              }
              whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <SolutionCardView card={card} index={index} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  // DESKTOP — the pinned horizontal scrub. Card width now matches CARD_VW
  // so the scrub endpoint lands the last card neatly at the right edge.
  return (
    <section
      ref={sectionRef}
      id={scene.id}
      data-scene={scene.index}
      className="section-light relative z-10 w-full"
      style={{ height: `${CAROUSEL_SCREENS * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden">
        {header}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
          }}
        >
          <motion.div
            style={{ x: trackX }}
            className="flex w-max items-start gap-[4vw] pl-[7vw] pr-[7vw]"
          >
            {SOLUTION_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 60, scale: 0.94 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="w-[54vw] flex-none"
              >
                <SolutionCardView card={card} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
