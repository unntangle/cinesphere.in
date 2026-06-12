'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { clamp } from '@/lib/utils';
import { useExperience } from '@/store/useExperience';

/**
 * HeroVideoSection
 * ----------------
 * Scene 01 hero with a scroll-scrubbed background video.
 *
 * Instead of autoplaying, the video's currentTime is driven entirely by
 * scroll. The section owns HERO_SCROLL_SCREENS viewport-heights of
 * scroll runway while the video stage is position:sticky — so the page
 * visually holds on the hero until the video has scrubbed all the way
 * through, and only then does the next section arrive. A small rAF lerp
 * chases the scroll position so scrubbing stays buttery even with Lenis
 * easing and fast flicks.
 *
 * NOTE: because this section is taller than one screen, global canvas
 * progress is computed from real DOM section geometry in SmoothScroll
 * (not raw scroll/limit), keeping the 3D scenes aligned.
 */

/** How many viewport-heights of scroll it takes to play the video fully. */
const HERO_SCROLL_SCREENS = 3;

export function HeroVideoSection({ scene }: { scene: SceneDef }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  // 0 when the hero pins (top hits viewport top — the page-load position),
  // 1 when the runway is fully consumed and the sticky stage releases.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // The video holds the frame until the end, dimming slightly as it hands
  // off to the next chapter. The scroll cue fades as the journey begins.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const videoOpacity = useTransform(scrollYProgress, [0.92, 1], [1, 0.9]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  /* ------------------------------------------------------------------ */
  /* Scroll → video time scrubbing                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let smoothed = 0; // lerped playhead (seconds)
    let ready = false;
    let seekInFlight = false;
    let seekStartedAt = 0;

    // Prime the decoder: a muted play() → pause() forces the browser to
    // initialise the pipeline so subsequent seeks actually paint frames.
    // (Without this, several browsers show only the poster/first frame.)
    const prime = () => {
      ready = true;
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(() => video.pause()).catch(() => {
          /* autoplay blocked — muted should prevent this, but we still
             scrub fine, frames just paint after the first user scroll */
        });
      } else {
        video.pause();
      }
    };

    // Seeks are async — a new frame only paints when 'seeked' fires.
    // We chain on it instead of flooding currentTime every rAF, which
    // makes browsers cancel/restart seeks forever (= frozen video).
    const onSeeked = () => {
      seekInFlight = false;
    };
    video.addEventListener('seeked', onSeeked);

    if (video.readyState >= 2) prime();
    else {
      video.addEventListener('loadeddata', prime, { once: true });
      video.load(); // make sure the fetch actually starts
    }

    // Reduced motion: hold a still first frame, no scrubbing.
    if (reducedMotion) {
      return () => {
        video.removeEventListener('loadeddata', prime);
        video.removeEventListener('seeked', onSeeked);
      };
    }

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!ready || !video.duration || !video.seekable.length) return;

      // Map most of the scroll range → the video, finishing the scrub at
      // 90% of the runway and well before the clip's final frames. This
      // (a) avoids seeking into a dark/black tail at the end of the file
      // and (b) holds a stable final frame during the sticky release, so
      // the handoff to the next section doesn't visibly "jump".
      const SCRUB_END = 0.9; // fraction of runway that drives the video
      const END_MARGIN = 0.4; // seconds of the clip we never seek into
      const p = clamp(scrollYProgress.get() / SCRUB_END);
      const target = p * Math.max(0.1, video.duration - END_MARGIN);

      // Chase the target — smooths out wheel steps and trackpad flicks.
      smoothed += (target - smoothed) * 0.14;

      // Watchdog: if 'seeked' never fired (e.g. seek to identical time),
      // release the lock so we don't deadlock.
      if (seekInFlight && performance.now() - seekStartedAt > 250) {
        seekInFlight = false;
      }

      // One seek in flight at a time; only when visually meaningful.
      if (!seekInFlight && Math.abs(video.currentTime - smoothed) > 1 / 50) {
        seekInFlight = true;
        seekStartedAt = performance.now();
        video.currentTime = smoothed;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadeddata', prime);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [scrollYProgress, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id={scene.id}
      data-scene={scene.index}
      className="relative w-full"
      style={{ height: `${HERO_SCROLL_SCREENS * 100}vh` }}
    >
      {/* Sticky stage — pinned on screen until the runway is spent. */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-6 md:px-16">
        {/* Scroll-scrubbed film, pinned to the stage. */}
        <motion.video
        ref={videoRef}
        src="/hero/hero-2.mp4"
        style={{ opacity: videoOpacity, scale: videoScale }}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden
        tabIndex={-1}
      />

        {/* Scroll cue — the only UI over the footage. */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="eyebrow text-ivory-faint">Scroll</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-champagne/80 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
