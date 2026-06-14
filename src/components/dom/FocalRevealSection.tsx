'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';

/**
 * FocalRevealSection — Scene 03 (Jesko Jets-style reveal)
 * --------------------------------------------------------
 * A self-contained sticky chapter: as the section pins, a single Utopia
 * Evo speaker RISES from the bottom of the screen while two balanced
 * columns settle in on either side — the Focal logo + certified-partner
 * message on the left, the "Partner" headline + spec block on the right —
 * with a cinematic golden sound wave flowing behind the speaker.
 *
 * Timing (the stage pins when the section reaches the viewport top; the
 * stage is pure black at rest, so the scroll-in seam is invisible):
 *   0.00–0.08  pinned, at rest (black — speaker below the fold)
 *   0.10–0.42  speaker rises; side columns drift in; wave follows
 *   0.42–1.00  finished composition holds
 */

/** Scroll runway in viewport-heights. */
const REVEAL_SCREENS = 2.5;

/* ------------------------------------------------------------------ */
/* Cinematic sound wave — one refined lead line + quiet harmonic       */
/* echoes, drawn on canvas.                                            */
/* ------------------------------------------------------------------ */

interface Ribbon {
  freq: number;
  speed: number;
  amp: number;
  alpha: number;
  width: number;
  phase: number;
}

// Frequencies are related (1.6 / 2.4 / 3.2) and speeds are close, so the
// layers read as a single wave with soft after-images — not a tangle.
const RIBBONS: Ribbon[] = [
  { freq: 1.6, speed: 0.5, amp: 0.62, alpha: 0.9, width: 1.5, phase: 0 },
  { freq: 2.4, speed: 0.42, amp: 0.5, alpha: 0.34, width: 1.1, phase: 0.9 },
  { freq: 3.2, speed: 0.58, amp: 0.36, alpha: 0.22, width: 1.0, phase: 2.1 },
  { freq: 1.6, speed: -0.3, amp: 0.45, alpha: 0.16, width: 1.8, phase: 3.6 },
];

function SoundWaveCanvas({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const makeGradient = () => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(154,127,84,0)');
      g.addColorStop(0.2, 'rgba(205,178,133,0.85)');
      g.addColorStop(0.5, 'rgba(238,220,181,1)');
      g.addColorStop(0.8, 'rgba(205,178,133,0.85)');
      g.addColorStop(1, 'rgba(154,127,84,0)');
      return g;
    };

    const draw = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const gradient = makeGradient();

      for (const r of RIBBONS) {
        ctx.beginPath();
        const steps = 160;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * w;
          const u = i / steps;

          const taper = Math.pow(Math.sin(Math.PI * u), 1.4);
          const breathe = 0.82 + 0.18 * Math.sin(t * 0.45 + r.phase);
          const shimmer =
            0.9 +
            0.1 * Math.sin(u * 9 + t * 1.1 + r.phase * 2) *
              Math.sin(u * 5 - t * 0.6);

          const y =
            mid +
            Math.sin(u * Math.PI * 2 * r.freq + t * r.speed * 2 + r.phase) *
              (mid * 0.9) *
              r.amp *
              taper *
              breathe *
              shimmer;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = r.width;
        ctx.shadowColor = 'rgba(238,220,181,0.7)';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    if (paused) {
      draw(1200);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    // Animate only while visible to keep the frame budget free elsewhere.
    let running = false;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      draw(time);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
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
  }, [paused]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

/* ------------------------------------------------------------------ */

export function FocalRevealSection({ scene }: { scene: SceneDef }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // ACT 1 — the golden sound wave sweeps in from the RIGHT, gliding
  // left into its resting place as it fades up: sound arrives first.
  const waveX = useTransform(
    scrollYProgress,
    [0.02, 0.2],
    ['calc(-50% + 55vw)', 'calc(-50% + 0vw)'],
  );
  const waveOpacity = useTransform(scrollYProgress, [0.02, 0.16], [0, 1]);

  // ACT 2 — the speaker climbs from below the fold to its resting
  // position once the wave has settled.
  const speakerY = useTransform(scrollYProgress, [0.2, 0.5], ['105%', '0%']);

  // ACT 3 — side columns drift in from their own sides as they fade.
  const leftColX = useTransform(scrollYProgress, [0.26, 0.52], ['-5vw', '0vw']);
  const rightColX = useTransform(scrollYProgress, [0.26, 0.52], ['5vw', '0vw']);
  const colOpacity = useTransform(scrollYProgress, [0.26, 0.52], [0, 1]);

  // Sub-copy inside the columns arrives a beat later.
  const copyOpacity = useTransform(scrollYProgress, [0.38, 0.6], [0, 1]);

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
        {/* Cinematic golden sound wave — ACT 1: sweeps in from the right
            (x glides right→left), then flows behind the rising speaker.
            The centring translates live in the motion style because
            framer's x animation owns the transform. */}
        <motion.div
          style={
            still ? undefined : { opacity: waveOpacity, x: waveX, y: '-50%' }
          }
          aria-hidden
          className={
            still
              ? 'absolute left-1/2 top-[42%] z-0 h-36 w-[80vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 md:h-48'
              : 'absolute left-1/2 top-[42%] z-0 h-36 w-[80vw] max-w-5xl md:h-48'
          }
        >
          <SoundWaveCanvas paused={still} />
        </motion.div>

        {/* Two balanced side columns, vertically centred against the
            speaker's upper half — desktop layout. */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-between px-[7vw] md:flex">
          {/* LEFT — Focal logo above the partner message, as one group. */}
          <motion.div
            style={still ? undefined : { x: leftColX, opacity: colOpacity }}
            className="-mt-[14vh] flex w-[24vw] max-w-sm flex-col"
          >
            {/* Champagne-tinted; sized so the FOCAL wordmark inside the
                logo matches the cap-height of the "Partner" headline. */}
            <img
              src="/images/focal-logo.webp"
              alt="FOCAL — The Spirit of Sound"
              className="h-20 w-auto self-start object-contain object-left brightness-[0.98] sepia-[0.85] saturate-[1.4] lg:h-24 xl:h-28"
              draggable={false}
            />
            <motion.p
              style={still ? undefined : { opacity: copyOpacity }}
              className="mt-8 border-l border-champagne/40 pl-4 font-sans text-base leading-relaxed text-ivory-muted lg:text-lg"
            >
              We are a Certified
              <br />
              Focal Partner
            </motion.p>
          </motion.div>

          {/* RIGHT — Partner headline above the spec block, as one group. */}
          <motion.div
            style={still ? undefined : { x: rightColX, opacity: colOpacity }}
            className="-mt-[14vh] flex w-[24vw] max-w-sm flex-col"
          >
            <h2 className="display text-gold text-6xl lg:text-7xl xl:text-8xl">
              Partner
            </h2>
            <motion.div
              style={still ? undefined : { opacity: copyOpacity }}
              className="mt-8"
            >
              <div className="flex items-baseline justify-between border-b border-white/15 pb-2">
                <span className="eyebrow">FOCAL</span>
                <span className="font-sans text-xs tracking-wide text-ivory-faint">
                  UTOPIA EVO
                </span>
              </div>
              <p className="mt-4 font-sans text-sm leading-relaxed text-ivory-muted">
              High-fidelity French acoustics, delivered and installed by
              Cinesphere as a certified Focal partner.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile — a clean poster: brand + headline up top, the speaker as
            the hero, and a small product nameplate at the foot. md:hidden, so
            the desktop side-column layout above is left completely untouched. */}
        <motion.div
          style={still ? undefined : { opacity: colOpacity }}
          className="pointer-events-none absolute inset-x-6 top-[10%] z-10 flex flex-col items-center gap-3 text-center md:hidden"
        >
          <img
            src="/images/focal-logo.webp"
            alt="FOCAL — The Spirit of Sound"
            className="h-9 w-auto object-contain brightness-[0.98] sepia-[0.85] saturate-[1.4]"
            draggable={false}
          />
          <h2 className="display text-gold text-6xl leading-none">Partner</h2>
          <p className="eyebrow">We are a Certified Focal Partner</p>
        </motion.div>

        {/* Mobile — product nameplate at the foot of the stage (over the
            bottom fade), in place of the desktop spec block. md:hidden. */}
        <motion.div
          style={still ? undefined : { opacity: copyOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-40 text-center md:hidden"
        >
          <span className="eyebrow text-champagne/90">Focal · Utopia Evo</span>
        </motion.div>

        {/* The speaker — rises from the bottom of the frame.
            Tone-graded into the black/gold theme; horizontal centring
            (x: -50%) lives inside the motion style because animating `y`
            would overwrite a class-based translate. Lifted off the stage
            floor (bottom padding) so the base isn't flush against the
            next section. */}
        <motion.img
          src="/images/G_Utopia_Evo.webp"
          alt="Focal Utopia Evo loudspeaker"
          style={still ? { x: '-50%' } : { y: speakerY, x: '-50%' }}
          className="absolute bottom-[7vh] left-1/2 z-20 h-[64vh] max-w-[82vw] object-contain object-bottom brightness-[0.82] contrast-[1.06] sepia-[0.28] saturate-[1.2] hue-rotate-[-6deg] drop-shadow-[0_-10px_90px_rgba(205,178,133,0.25)] md:h-[80vh] md:max-w-[36vw]"
          draggable={false}
        />

        {/* Bottom fade — melts the speaker image's rectangular edge
            into pure black, removing the seam at the stage floor. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[16vh] bg-gradient-to-t from-black via-black/70 to-transparent"
        />
      </div>
    </section>
  );
}
