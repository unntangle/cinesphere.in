'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useExperience } from '@/store/useExperience';

/**
 * SoundWaveSection — "The Shape of Sound"
 * ---------------------------------------
 * A dotted TUNNEL / wormhole you fly through. Each dot rides a spiral from a
 * central vanishing point outward to the screen edge with exponential
 * perspective (rings bunch near the centre, spread near the rim) — so it
 * reads as travelling *into* the tunnel. The whole thing rotates slowly and
 * the vanishing point eases toward the cursor. Honours reduced-motion.
 *
 * Pure <canvas> 2D. Each particle = fixed angle + fixed phase offset; only a
 * shared clock animates it, so there's no per-frame state to drift.
 */

function TunnelCanvas({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let voidR = 0;
    let lnScale = 1;
    let last = performance.now();

    // Per-particle: fixed angle `a`, fixed phase `p0`, brightness var `k`.
    let A: Float32Array = new Float32Array(0);
    let P0: Float32Array = new Float32Array(0);
    let K: Float32Array = new Float32Array(0);

    const TWIST = 3.2; // spiral winding from centre → rim
    const SPIN = 0.12; // global rotation (rad/sec)
    const SPEED = 0.14; // how fast you travel down the tunnel (phase/sec)

    const build = () => {
      const n = Math.max(1600, Math.min(4200, Math.round((w * h) / 800)));
      A = new Float32Array(n);
      P0 = new Float32Array(n);
      K = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        A[i] = Math.random() * Math.PI * 2;
        P0[i] = Math.random();
        K[i] = 0.7 + Math.random() * 0.55;
      }
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      const m = Math.min(w, h);
      voidR = m * 0.06; // vanishing point
      const Rmax = Math.hypot(w, h) * 0.6; // overshoot the corners
      lnScale = Math.log(Rmax / voidR);
      build();
    };
    setup();
    window.addEventListener('resize', setup);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        active: true,
      };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    const smooth = (e0: number, e1: number, x: number) => {
      let t = (x - e0) / (e1 - e0);
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      return t * t * (3 - 2 * t);
    };

    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgb(238,233,220)';

      const spin = t * SPIN;
      const flow = t * SPEED;

      for (let i = 0; i < A.length; i++) {
        // Phase 0 (centre) → 1 (rim), wrapping for endless travel.
        let p = P0[i] + flow;
        p -= Math.floor(p);

        const radius = voidR * Math.exp(p * lnScale);
        const ang = A[i] + p * TWIST + spin;

        const x = cx + Math.cos(ang) * radius;
        const y = cy + Math.sin(ang) * radius;

        // Fade in as it leaves the void, fade out as it exits the rim.
        const fade = smooth(0, 0.1, p) * (1 - smooth(0.82, 1, p));
        let b = 0.9 * fade * K[i];
        if (b <= 0.012) continue;
        if (b > 1) b = 1;

        ctx.globalAlpha = b;
        const s = 0.6 + p * 2.6;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
    };

    if (paused) {
      render(3);
    } else {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        last = now;
        // Ease the vanishing point toward the pointer (or back to centre).
        const px = pointer.current;
        const tx = px.active ? px.x : w / 2;
        const ty = px.active ? px.y : h / 2;
        cx += (tx - cx) * 0.05;
        cy += (ty - cy) * 0.05;
        render(now / 1000);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setup);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      void last;
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

export function SoundWaveSection() {
  const reducedMotion = useExperience((s) => s.reducedMotion);

  return (
    <section
      id="soundscape"
      className="relative z-10 flex min-h-[92vh] w-full items-center justify-center overflow-hidden bg-piano"
    >
      {/* The tunnel — full-bleed, endless travel inward. */}
      <div className="absolute inset-0">
        <TunnelCanvas paused={reducedMotion} />
      </div>

      {/* Small centre vignette — only the very middle, so the tunnel mouth
          stays dark behind the copy without hiding the spiral. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0) 40%)',
        }}
      />

      {/* Copy — sits in the tunnel mouth. */}
      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-3xl px-6 text-center"
      >
        <p className="eyebrow">The Shape of Sound</p>
        <h2 className="display mt-4 text-3xl text-ivory md:text-5xl lg:text-6xl">
          See what you&apos;ll hear.
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-ivory-muted md:text-lg">
          Every auditorium, theatre and studio we build begins as a
          waveform — engineered, shaped and tuned until the experience is
          unmistakable.
        </p>
      </motion.div>
    </section>
  );
}
