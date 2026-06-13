'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { clamp } from '@/lib/utils';
import { useExperience } from '@/store/useExperience';
import { HeroVideoSection } from './HeroVideoSection';

/**
 * HeroFrameSequence
 * -----------------
 * Apple-style scroll-scrubbed hero: instead of seeking a <video> (which is
 * limited by keyframe placement and async seeks), the clip is pre-extracted
 * into a JPEG frame sequence in /public/hero/frames/ and drawn onto a
 * <canvas> based on scroll position. Frame swaps are synchronous, so the
 * scrub is perfectly smooth at any scroll speed.
 *
 * Frames are auto-discovered: the component preloads frame-0001.jpg,
 * frame-0002.jpg, ... in batches until one is missing — no hardcoded count.
 * If frame-0001.jpg doesn't exist at all, it falls back to the original
 * <video>-based hero so the page never breaks.
 *
 * Generate frames with (run inside public/hero/):
 *   ffmpeg -i hero-2.mp4 -vf "fps=24,scale=1600:-2" -qscale:v 4 frames/frame-%04d.jpg
 */

/** How many viewport-heights of scroll it takes to play the sequence fully. */
const HERO_SCROLL_SCREENS = 3;
/** Probe/preload batch size. */
const BATCH = 24;
/** Hard safety cap on frame discovery. */
const MAX_FRAMES = 1200;

const framePath = (i: number) =>
  `/hero/frames/frame-${String(i).padStart(4, '0')}.jpg`;

const loadImage = (i: number) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = framePath(i);
  });

export function HeroFrameSequence({ scene }: { scene: SceneDef }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const countRef = useRef(0);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  // null = probing, false = no frames (fallback to video), true = frames OK
  const [hasFrames, setHasFrames] = useState<boolean | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  // Guaranteed blackout: a solid black overlay fades in over the footage
  // near the end of the scrub, so the "TV off" moment is a true, complete
  // black regardless of how dark the clip's final frames actually are.
  const blackoutOpacity = useTransform(scrollYProgress, [0.68, 0.88], [0, 1]);
  // Then the (now pure-black) stage fades out in the final beat. The next
  // section is pulled up underneath this stage via a -100vh margin, so
  // the fade reveals it already in place — no dead black scroll between
  // the TV blackout and the next chapter.
  const stageOpacity = useTransform(scrollYProgress, [0.96, 1], [1, 0]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  /* ------------------------------------------------------------------ */
  /* Frame discovery + preload (batched, stops at first missing frame)   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Quick existence check on frame 1.
      const first = await loadImage(1);
      if (cancelled) return;
      if (!first) {
        setHasFrames(false); // fall back to <video> hero
        return;
      }
      framesRef.current[1] = first;
      countRef.current = 1;
      setHasFrames(true);

      let start = 2;
      while (start <= MAX_FRAMES && !cancelled) {
        const indices = Array.from({ length: BATCH }, (_, k) => start + k);
        const results = await Promise.all(indices.map(loadImage));
        if (cancelled) return;

        let stop = false;
        results.forEach((img, k) => {
          if (stop) return;
          if (img) {
            framesRef.current[indices[k]] = img;
            countRef.current = indices[k];
          } else {
            stop = true; // first gap = end of sequence
          }
        });
        if (stop) break;
        start += BATCH;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Canvas sizing + scroll → frame drawing                              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (hasFrames !== true) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let smoothed = 1; // lerped frame index (float)
    let lastDrawn = -1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      lastDrawn = -1; // force redraw at new size
    };
    resize();
    window.addEventListener('resize', resize);

    // object-fit: cover, drawn manually.
    const draw = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    // Nearest loaded frame at-or-below idx (preload may still be running).
    const nearestLoaded = (idx: number) => {
      for (let i = idx; i >= 1; i--) {
        const img = framesRef.current[i];
        if (img) return { i, img };
      }
      return null;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const count = countRef.current;
      if (count < 1) return;

      // Finish the scrub at 90% of the runway so the final frame holds
      // steady while the sticky stage releases — no end-of-section jump.
      const p = clamp(scrollYProgress.get() / 0.9);
      const target = reducedMotion ? 1 : 1 + p * (count - 1);

      smoothed += (target - smoothed) * 0.22;
      if (Math.abs(target - smoothed) < 0.5) smoothed = target;

      const idx = Math.max(1, Math.min(count, Math.round(smoothed)));
      const found = nearestLoaded(idx);
      if (found && found.i !== lastDrawn) {
        draw(found.img);
        lastDrawn = found.i;
      }
    };
    let running = false;
    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    // Only drive the frame draw while the hero is on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: '150px' },
    );
    io.observe(canvas);

    return () => {
      stopLoop();
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [hasFrames, scrollYProgress, reducedMotion]);

  // No frames extracted yet → keep the original video hero working.
  if (hasFrames === false) return <HeroVideoSection scene={scene} />;

  return (
    <section
      ref={sectionRef}
      id={scene.id}
      data-scene={scene.index}
      className="relative z-20 w-full"
      style={{ height: `${HERO_SCROLL_SCREENS * 100}vh` }}
    >
      <div className="pointer-events-none sticky top-0 flex h-screen w-full items-center overflow-hidden px-6 md:px-16">
        {/* Footage + blackout, faded out together at the very end. */}
        <motion.div
          style={{ opacity: stageOpacity }}
          className="absolute inset-0"
          aria-hidden
        >
          <motion.canvas
            ref={canvasRef}
            style={{ scale: stageScale }}
            className="absolute inset-0 h-full w-full bg-piano"
          />
          {/* Full-black curtain — forces a complete blackout before the reveal. */}
          <motion.div
            style={{ opacity: blackoutOpacity }}
            className="absolute inset-0 bg-black"
          />
        </motion.div>

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
