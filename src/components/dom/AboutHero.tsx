'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useExperience } from '@/store/useExperience';

/**
 * AboutHero
 * ---------
 * The /about hero: a single cinematic still (about-hero.png) under a
 * film-grade grade, with the title rising out of blur and a gentle scroll
 * parallax so the frame feels alive without any heavy video/frame payload.
 *
 * (The previous scroll-scrubbed frame-sequence / .mov hero has been
 * replaced by this static image per the brief.) Everything settles to a
 * still, motionless frame under prefers-reduced-motion.
 */

const HERO_DARK = '/images/about-hero-dark.webp';
const HERO_LIGHT = '/images/about-hero-light.webp';
const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  // Drive a slow Ken-Burns drift + a copy fade as the hero scrolls away.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.18]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  // 1) The room first brightens dark → light.
  const lightOpacity = useTransform(scrollYProgress, [0.05, 0.5], [0, 1]);
  // 2) Then the copy slides up into view (hidden by default at the top).
  const introOpacity = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);
  const introY = useTransform(scrollYProgress, [0.5, 0.85], [80, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="about-hero"
      className={`relative z-20 w-full bg-piano ${reducedMotion ? '' : 'h-[200vh]'}`}
    >
      {/* Sticky frame — the hero pins while the room brightens; the pin   */}
      {/* releases (scroll continues) only once it's fully lit.           */}
      <div
        className={`flex w-full items-center justify-center overflow-hidden ${
          reducedMotion ? 'h-screen min-h-[640px]' : 'sticky top-0 h-screen min-h-[640px]'
        }`}
      >
      {/* Dark base frame — gentle parallax drift (frozen for reduced motion). */}
      <motion.img
        src={HERO_DARK}
        alt=""
        aria-hidden
        style={reducedMotion ? undefined : { scale: imageScale, y: imageY }}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* Light frame — slowly cross-fades in as the hero scrolls. */}
      {!reducedMotion && (
        <motion.img
          src={HERO_LIGHT}
          alt=""
          aria-hidden
          style={{ scale: imageScale, y: imageY, opacity: lightOpacity }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}

      {/* Film-grade grade — darken the whole frame, then seat the centred
          copy on a soft dark scrim so the white title always has contrast,
          while the room stays visible toward the edges. */}
      {/* 1) Light overall wash — just tames the brightest highlights. */}
      <div aria-hidden className="absolute inset-0 bg-black/20" />
      {/* 2) Soft centre scrim — a gentle pool of shade behind the copy. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 68% 50% at 50% 47%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%)',
        }}
      />
      {/* 3) Bottom + top falloff for the scroll cue and the nav bar. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"
      />

      {/* Title — rises out of blur, then drifts up and fades on scroll. */}
      <motion.div
        style={reducedMotion ? undefined : { opacity: introOpacity, y: introY }}
        className="relative z-10 px-6 text-center"
      >
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="eyebrow"
        >
          About Cinesphere
        </motion.p>
        <motion.h1
          initial={reducedMotion ? false : { opacity: 0, y: 26, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: EASE, delay: 0.18 }}
          className="display mx-auto mt-4 max-w-4xl text-balance text-4xl [text-shadow:0_2px_30px_rgba(0,0,0,0.55)] sm:text-6xl md:text-7xl lg:text-[5.25rem]"
        >
          We tune the rooms
          <br />
          people <span className="text-gold text-gold-sweep">remember</span>.
        </motion.h1>
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.32 }}
          className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ivory/90 [text-shadow:0_1px_18px_rgba(0,0,0,0.6)] md:text-lg"
        >
          Twelve years of finest audio artistry, engineering sound and vision
          for spaces that deserve to be felt, not just heard.
        </motion.p>
      </motion.div>

      {/* Scroll cue. */}
      <motion.div
        style={reducedMotion ? undefined : { opacity: cueOpacity }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="eyebrow text-ivory-faint">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-champagne/80 to-transparent" />
      </motion.div>
      </div>
    </section>
  );
}
