'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * HarmanRevealSection — Scene 04 (Harman Kardon Authorized Dealer)
 * ----------------------------------------------------------------
 * A self-contained sticky chapter: the Citation tower image is
 * DUPLICATED into two copies that begin stacked dead-centre, then
 * glide apart — one to the LEFT, its mirrored twin to the RIGHT —
 * like curtains parting. In the gap they unveil, the "Authorized
 * Dealer of" line wipes upward into view with the Harman Kardon
 * logo settling in beneath it, over a soft champagne glow.
 *
 * Timing (the stage pins when the section reaches the viewport top):
 *   0.00–0.08  pinned, at rest (both copies overlapped centre)
 *   0.08–0.45  the pair splits left / right — and IN SYNC with the
 *              movement, "Authorized Dealer of" wipes up into the gap
 *              with the Harman Kardon logo trailing just behind it
 *   0.45–1.00  finished composition holds
 */

/** Scroll runway in viewport-heights — kept tight: the reveal finishes
 *  around 60% of the pin, so a short runway means the section releases
 *  soon after the composition settles instead of holding for extra
 *  scrolls. */
const REVEAL_SCREENS = 1.7;

/* ------------------------------------------------------------------ */
/* Subtle circular sound waves — concentric champagne rings expanding  */
/* from the centre behind the speakers, like ripples of sound.         */
/* ------------------------------------------------------------------ */

const RIPPLE_DELAYS = [0, 1.1, 2.2, 3.3, 4.4];

function SoundRipples({ paused }: { paused: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[55%] z-0 h-0 w-0"
    >
      {RIPPLE_DELAYS.map((delay) => (
        <span
          key={delay}
          className="sound-ripple absolute left-0 top-0 h-[110vh] w-[110vh] rounded-full border border-champagne/40 shadow-[0_0_30px_rgba(205,178,133,0.12),inset_0_0_30px_rgba(205,178,133,0.08)] md:h-[140vh] md:w-[140vh]"
          style={
            paused
              ? {
                  animation: 'none',
                  transform: 'translate(-50%, -50%) scale(0.85)',
                  opacity: 0.14,
                }
              : { animationDelay: `${delay}s` }
          }
        />
      ))}
    </div>
  );
}

export function HarmanRevealSection({ scene }: { scene: SceneDef }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // The duplicated pair splits apart. Each copy is centred with a -50%
  // self-translate, then pushed outward in vw — framer interpolates the
  // matching calc() strings. (Desktop distances; mobile uses a smaller
  // pair rendered separately below.)
  const leftX = useTransform(
    scrollYProgress,
    [0.08, 0.45],
    ['calc(-50% - 0vw)', 'calc(-50% - 26vw)'],
  );
  const rightX = useTransform(
    scrollYProgress,
    [0.08, 0.45],
    ['calc(-50% + 0vw)', 'calc(-50% + 26vw)'],
  );

  // Mobile split distances (tighter stage).
  const leftXm = useTransform(
    scrollYProgress,
    [0.08, 0.45],
    ['calc(-50% - 0vw)', 'calc(-50% - 30vw)'],
  );
  const rightXm = useTransform(
    scrollYProgress,
    [0.08, 0.45],
    ['calc(-50% + 0vw)', 'calc(-50% + 30vw)'],
  );

  // Centre lockup — revealed strictly BETWEEN the speakers: the clip
  // edges travel in the SAME vw units as the speaker offsets, so the
  // visible window is always exactly the gap between the two towers
  // (each tower's body overhangs the clip edge, hiding it). Only after
  // the speakers settle (0.45) does the clip open fully so the whole
  // lockup is guaranteed visible on any viewport.
  const centerClip = useTransform(
    scrollYProgress,
    [0.1, 0.45, 0.6],
    [
      'inset(0% calc(50% - 0vw) 0% calc(50% - 0vw))',
      'inset(0% calc(50% - 26vw) 0% calc(50% - 26vw))',
      'inset(0% calc(50% - 50vw) 0% calc(50% - 50vw))',
    ],
  );
  const logoOpacity = useTransform(scrollYProgress, [0.16, 0.42], [0, 1]);
  const logoY = useTransform(scrollYProgress, [0.16, 0.42], ['24px', '0px']);

  // Supporting description — settles in last, after the logo lands.
  const descOpacity = useTransform(scrollYProgress, [0.34, 0.55], [0, 1]);
  const descY = useTransform(scrollYProgress, [0.34, 0.55], ['20px', '0px']);

  // The resting speaker's entrance — once the section pins, the tower
  // slowly fades up from black before the split begins.
  const speakerFade = useTransform(scrollYProgress, [0.0, 0.1], [0, 1]);

  // The mirrored twin is invisible while the copies are stacked — the
  // speaker artwork isn't perfectly centred in its own canvas, so a
  // flipped copy would spill out from behind the original. It fades in
  // just as the split begins, when the offset can no longer be seen.
  const mirrorOpacity = useTransform(scrollYProgress, [0.08, 0.16], [0, 1]);

  // Floor shadows track their speakers' fades.
  const reflectionFadeL = useTransform(speakerFade, (v) => v);
  const reflectionFadeR = useTransform(mirrorOpacity, (v) => v);

  // Ambient glow breathes in as the curtains part.
  const glowOpacity = useTransform(scrollYProgress, [0.08, 0.4], [0, 1]);

  const still = reducedMotion; // show the finished composition statically

  return (
    <section
      ref={sectionRef}
      id={scene.id}
      data-scene={scene.index}
      className="relative z-10 w-full bg-piano"
      style={{ height: `${REVEAL_SCREENS * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Soft champagne glow behind the centre lockup. */}
        <motion.div
          aria-hidden
          style={still ? undefined : { opacity: glowOpacity }}
          className="absolute left-1/2 top-[55%] z-0 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.16),rgba(205,178,133,0.05)_45%,transparent_70%)]"
        />

        {/* Subtle circular sound waves rippling out behind the stage —
            ambient from the moment the section pins, so the resting
            single speaker already breathes with sound. */}
        <div aria-hidden className="absolute inset-0 z-0">
          <SoundRipples paused={still} />
        </div>

        {/* Centre lockup — clipped to the gap between the parting
            speakers; opens outward from the centre with the split.
            Nudged below true centre (pt) to match the speakers, which
            sit low in the stage to minimise the black band beneath. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pt-[10vh]">
          <motion.div
            style={still ? undefined : { clipPath: centerClip }}
            className="flex w-full flex-col items-center px-6 text-center"
          >
            <p className="display text-2xl leading-tight text-ivory md:text-4xl lg:text-5xl">
              Authorized <span className="text-gold">Dealer</span> of
            </p>

            {/* Harman Kardon logo — the webp artwork is already white,
                so it sits on black with no filter inversion needed.
                Nudged right (x) because the ® glyph pads the right edge
                of the file, pulling the wordmark optically off-centre;
                the offset lives in the motion style so framer's y/opacity
                animation doesn't overwrite it. */}
            <motion.img
              src="/Harman_kardon_Logo.webp"
              alt="Harman Kardon"
              style={
                still
                  ? { x: '3%' }
                  : { opacity: logoOpacity, y: logoY, x: '3%' }
              }
              className="mt-6 h-12 w-auto object-contain md:mt-8 md:h-16 lg:h-20"
              draggable={false}
            />

            {/* Supporting copy — spec block in the Focal section's
                voice: eyebrow + hairline rule + muted body text. */}
            <motion.div
              style={still ? undefined : { opacity: descOpacity, y: descY }}
              className="mt-10 w-full max-w-xl md:mt-12"
            >
              <div className="flex items-baseline justify-between border-b border-white/15 pb-2">
                <span className="eyebrow">HARMAN KARDON</span>
                <span className="font-sans text-xs tracking-wide text-ivory-faint">
                  CITATION SERIES
                </span>
              </div>
              <p className="mt-4 font-sans text-sm leading-relaxed text-ivory-muted md:text-base">
                Beautiful sound, beautifully made — since 1953, Harman Kardon
                has shaped audio where engineering meets sculpture. As an
                authorized dealer, Cinesphere brings you genuine systems,
                expert calibration and seamless installation, backed by full
                manufacturer warranty.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Mirror reflections — the real grounding cue on a black floor:
            a flipped copy of each tower rendered ABOVE the artwork
            (z-[29], the canvas is opaque), with a mask that (a) keeps
            the flipped file's top padding fully transparent so it never
            dims the real base, then (b) shows the reflected base fading
            into the floor within a few vh. */}
        <motion.img
          src="/HM-CT.webp"
          alt=""
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% - 26vw)', scaleY: -1, opacity: 0.45 }
              : { x: leftX, scaleY: -1, opacity: reflectionFadeL }
          }
          className="absolute left-1/2 top-[calc(55%_+_24vh)] z-[29] hidden h-[78vh] max-w-[32vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] blur-[1.5px] [mask-image:linear-gradient(to_bottom,transparent_9%,rgba(0,0,0,0.5)_11%,rgba(0,0,0,0.14)_19%,transparent_28%)] md:block"
          draggable={false}
        />
        <motion.img
          src="/HM-CT.webp"
          alt=""
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% + 26vw)', scaleY: -1, scaleX: -1, opacity: 0.45 }
              : { x: rightX, scaleY: -1, scaleX: -1, opacity: reflectionFadeR }
          }
          className="absolute left-1/2 top-[calc(55%_+_24vh)] z-[29] hidden h-[78vh] max-w-[32vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] blur-[1.5px] [mask-image:linear-gradient(to_bottom,transparent_9%,rgba(0,0,0,0.5)_11%,rgba(0,0,0,0.14)_19%,transparent_28%)] md:block"
          draggable={false}
        />
        <motion.img
          src="/HM-CT.webp"
          alt=""
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% - 30vw)', scaleY: -1, opacity: 0.45 }
              : { x: leftXm, scaleY: -1, opacity: reflectionFadeL }
          }
          className="absolute left-1/2 top-[calc(55%_+_14.2vh)] z-[29] h-[46vh] max-w-[52vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] blur-[1.5px] [mask-image:linear-gradient(to_bottom,transparent_9%,rgba(0,0,0,0.5)_11%,rgba(0,0,0,0.14)_19%,transparent_28%)] md:hidden"
          draggable={false}
        />
        <motion.img
          src="/HM-CT.webp"
          alt=""
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% + 30vw)', scaleY: -1, scaleX: -1, opacity: 0.45 }
              : { x: rightXm, scaleY: -1, scaleX: -1, opacity: reflectionFadeR }
          }
          className="absolute left-1/2 top-[calc(55%_+_14.2vh)] z-[29] h-[46vh] max-w-[52vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] blur-[1.5px] [mask-image:linear-gradient(to_bottom,transparent_9%,rgba(0,0,0,0.5)_11%,rgba(0,0,0,0.14)_19%,transparent_28%)] md:hidden"
          draggable={false}
        />

        {/* Floor shadows — realistic two-layer grounding rendered above
            the artwork (its canvas is opaque): a wide, dim pool of
            ambient floor light + a soft dark contact core right under
            the base. Each wrapper shares its speaker's x transform. */}
        <motion.div
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% - 26vw)' }
              : { x: leftX, opacity: reflectionFadeL }
          }
          className="absolute left-1/2 top-[calc(55%_+_31.2vh)] z-30 hidden h-[6vh] w-[20vw] md:block"
        >
          <div className="absolute inset-0 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.1),rgba(205,178,133,0.03)_55%,transparent_72%)] blur-xl" />
          <div className="absolute left-1/2 top-[6%] h-[30%] w-[44%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),rgba(0,0,0,0.22)_55%,transparent_78%)] blur-[5px]" />
        </motion.div>
        <motion.div
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% + 26vw)' }
              : { x: rightX, opacity: reflectionFadeR }
          }
          className="absolute left-1/2 top-[calc(55%_+_31.2vh)] z-30 hidden h-[6vh] w-[20vw] md:block"
        >
          <div className="absolute inset-0 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.1),rgba(205,178,133,0.03)_55%,transparent_72%)] blur-xl" />
          <div className="absolute left-1/2 top-[6%] h-[30%] w-[44%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),rgba(0,0,0,0.22)_55%,transparent_78%)] blur-[5px]" />
        </motion.div>
        <motion.div
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% - 30vw)' }
              : { x: leftXm, opacity: reflectionFadeL }
          }
          className="absolute left-1/2 top-[calc(55%_+_18.2vh)] z-30 h-[4.5vh] w-[34vw] md:hidden"
        >
          <div className="absolute inset-0 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.1),rgba(205,178,133,0.03)_55%,transparent_72%)] blur-lg" />
          <div className="absolute left-1/2 top-[6%] h-[30%] w-[44%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),rgba(0,0,0,0.22)_55%,transparent_78%)] blur-[4px]" />
        </motion.div>
        <motion.div
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% + 30vw)' }
              : { x: rightXm, opacity: reflectionFadeR }
          }
          className="absolute left-1/2 top-[calc(55%_+_18.2vh)] z-30 h-[4.5vh] w-[34vw] md:hidden"
        >
          <div className="absolute inset-0 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.1),rgba(205,178,133,0.03)_55%,transparent_72%)] blur-lg" />
          <div className="absolute left-1/2 top-[6%] h-[30%] w-[44%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),rgba(0,0,0,0.22)_55%,transparent_78%)] blur-[4px]" />
        </motion.div>

        {/* THE DUPLICATED PAIR — desktop. Both copies start stacked at
            centre; the left copy slides left, the mirrored right copy
            slides right. Vertically centred on the viewport midline so
            the whole composition reads middle-aligned with the lockup.
            (y lives in the motion style — a class translate would be
            overwritten by framer's inline transform.) */}
        <motion.img
          src="/HM-CT.webp"
          alt="Harman Kardon Citation speaker"
          style={
            still
              ? { x: 'calc(-50% - 26vw)', y: '-50%' }
              : { x: leftX, y: '-50%', opacity: speakerFade }
          }
          className="absolute left-1/2 top-[55%] z-20 hidden h-[78vh] max-w-[32vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] drop-shadow-[0_0_80px_rgba(205,178,133,0.2)] md:block"
          draggable={false}
        />
        <motion.img
          src="/HM-CT.webp"
          alt=""
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% + 26vw)', y: '-50%', scaleX: -1 }
              : { x: rightX, y: '-50%', scaleX: -1, opacity: mirrorOpacity }
          }
          className="absolute left-1/2 top-[55%] z-20 hidden h-[78vh] max-w-[32vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] drop-shadow-[0_0_80px_rgba(205,178,133,0.2)] md:block"
          draggable={false}
        />

        {/* THE DUPLICATED PAIR — mobile (smaller, tighter split). */}
        <motion.img
          src="/HM-CT.webp"
          alt="Harman Kardon Citation speaker"
          style={
            still
              ? { x: 'calc(-50% - 30vw)', y: '-50%' }
              : { x: leftXm, y: '-50%', opacity: speakerFade }
          }
          className="absolute left-1/2 top-[55%] z-20 h-[46vh] max-w-[52vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] drop-shadow-[0_0_50px_rgba(205,178,133,0.2)] md:hidden"
          draggable={false}
        />
        <motion.img
          src="/HM-CT.webp"
          alt=""
          aria-hidden
          style={
            still
              ? { x: 'calc(-50% + 30vw)', y: '-50%', scaleX: -1 }
              : { x: rightXm, y: '-50%', scaleX: -1, opacity: mirrorOpacity }
          }
          className="absolute left-1/2 top-[55%] z-20 h-[46vh] max-w-[52vw] object-contain object-center brightness-[0.85] contrast-[1.06] sepia-[0.24] saturate-[1.15] hue-rotate-[-6deg] drop-shadow-[0_0_50px_rgba(205,178,133,0.2)] md:hidden"
          draggable={false}
        />
      </div>
    </section>
  );
}
