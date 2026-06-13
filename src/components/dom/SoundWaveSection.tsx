'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';

/**
 * SoundWaveSection — "The Shape of Sound"
 * ---------------------------------------
 * A true 3D particle WORMHOLE you fly through. Thousands of glowing white
 * points are arranged as a mathematically even grid of rings (perfect
 * angular spacing) wrapped around a tube. A custom GLSL shader streams them
 * toward the camera (a seamless forward dolly), spirals them with depth,
 * bends the tunnel's centreline into a snaking wormhole, and morphs the
 * cross-section between circular, oval and asymmetric shapes over time.
 *
 * Pure black background, bright white additive points only — high contrast,
 * soft round glow, no bloom overload. Perspective gives true depth: near
 * points are large and bright, far points converge to the vanishing point
 * and fade in softly, so the loop is invisible. The vanishing direction
 * eases toward the cursor for a subtle sense of steering. Honours
 * reduced-motion by rendering a single still frame.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uRadius;
  uniform float uLength;
  uniform float uTwist;
  uniform float uFocal;
  uniform float uSpeed;
  uniform float uCamZ;
  uniform vec2  uPointer;

  attribute float aAngle;
  attribute float aDepth;
  attribute float aSeed;

  varying float vBright;

  const float TAU = 6.28318530718;

  void main() {
    float t = uTime;

    // Travel phase: far (p ~ 1) -> near (p ~ 0) as time advances, so the
    // particles approach the camera = forward dolly. Wraps seamlessly.
    float p = fract(aDepth - t * uSpeed);
    float worldZ = uCamZ - uLength * p;     // just ahead of the moving camera

    // Spiral: twist deepens with distance + a slow global spin.
    float ang = aAngle + t * 0.12 + (1.0 - p) * uTwist;

    // Breathing radius + cross-section morph (circle <-> oval <-> asymmetric).
    float breathe = 1.0 + 0.16 * sin(worldZ * 0.35 + t * 0.40);
    float e1 = 0.14 * sin(t * 0.23 + worldZ * 0.05);          // 2-fold (oval)
    float e2 = 0.09 * sin(t * 0.17 - worldZ * 0.07 + 1.7);    // 3-fold (asym)
    float morph = 1.0 + e1 * sin(2.0 * ang) + e2 * sin(3.0 * ang + 0.6);
    float R = uRadius * breathe * morph;

    // Bending centreline -> the tunnel snakes through space.
    float cx = 2.4 * sin(worldZ * 0.08 + t * 0.25) + 1.2 * cos(worldZ * 0.15 - t * 0.18);
    float cy = 2.2 * cos(worldZ * 0.10 - t * 0.22) + 1.1 * sin(worldZ * 0.13 + t * 0.20);

    // Steer the near field gently toward the pointer.
    float steer = smoothstep(0.55, 0.0, p);
    cx += uPointer.x * 2.0 * steer;
    cy += uPointer.y * 2.0 * steer;

    vec3 pos = vec3(cx + cos(ang) * R, cy + sin(ang) * R, worldZ);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float dist = max(-mv.z, 0.1);
    float size = uSize * uPixelRatio * (uFocal / dist);
    gl_PointSize = clamp(size, 1.0, 26.0 * uPixelRatio);

    // Soft appear at the far end, fade out as it sweeps past the camera,
    // depth dimming, plus a subtle per-particle brightness pulse.
    float fadeFar  = smoothstep(1.0, 0.90, p);
    float fadeNear = smoothstep(0.0, 0.07, p);
    float depthDim = mix(0.45, 1.0, 1.0 - p);
    float pulse    = 0.70 + 0.30 * sin(t * 1.6 + aSeed * TAU);
    vBright = fadeFar * fadeNear * depthDim * pulse;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying float vBright;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);   // soft round falloff
    float glow = core * core;                // tighter bright centre
    float a = (0.35 * core + 0.65 * glow) * vBright;

    // Subtle glowing gold: a warm light-champagne hot centre easing out to
    // a deeper champagne-gold at the edges of each point.
    vec3 goldCore = vec3(0.97, 0.90, 0.74);  // light champagne (#f7e6bd-ish)
    vec3 goldEdge = vec3(0.80, 0.63, 0.33);  // deep champagne gold (#cca054-ish)
    vec3 color = mix(goldEdge, goldCore, glow);

    gl_FragColor = vec4(color, a);           // gold, additive glow
  }
`;

function TunnelCanvas({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      // No WebGL — leave the section black; the copy still reads fine.
      return;
    }

    renderer.setClearColor(0x000000, 0); // transparent over the black section

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 240);
    camera.position.set(0, 0, 0);

    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 2.0 },
      uRadius: { value: 6.5 },
      uLength: { value: 60.0 },
      uTwist: { value: 2.2 },
      uFocal: { value: 80.0 },
      uSpeed: { value: 0.055 },
      uCamZ: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    let geometry = new THREE.BufferGeometry();
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const TAU = Math.PI * 2;

    const buildGeometry = (width: number) => {
      // Mathematically even grid: `rings` rings, each with `perRing`
      // equally-spaced points; alternate rings are half-step staggered.
      const small = width < 760;
      const rings = small ? 100 : 150;
      const perRing = small ? 40 : 56;
      const n = rings * perRing;

      const pos = new Float32Array(n * 3); // dummy positions drive the count
      const aAngle = new Float32Array(n);
      const aDepth = new Float32Array(n);
      const aSeed = new Float32Array(n);

      let k = 0;
      for (let i = 0; i < rings; i++) {
        const depth = i / rings;
        const stagger = (i % 2) * (Math.PI / perRing);
        for (let j = 0; j < perRing; j++) {
          aAngle[k] = (j / perRing) * TAU + stagger;
          aDepth[k] = depth;
          aSeed[k] = Math.random();
          k++;
        }
      }

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aAngle', new THREE.BufferAttribute(aAngle, 1));
      g.setAttribute('aDepth', new THREE.BufferAttribute(aDepth, 1));
      g.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
      return g;
    };

    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uPixelRatio.value = dpr;

      const next = buildGeometry(w);
      points.geometry = next;
      geometry.dispose();
      geometry = next;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      // Normalised pointer in [-1, 1], y flipped to match world up.
      pointerTarget.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -(((e.clientY - r.top) / r.height) * 2 - 1),
      };
    };
    const onLeave = () => {
      pointerTarget.current = { x: 0, y: 0 };
    };

    let raf = 0;
    const ptr = uniforms.uPointer.value as THREE.Vector2;

    // Fly the camera along the tunnel's bending centreline (these cx/cy must
    // mirror the shader's centreline exactly) while it dollies forward in -Z,
    // so we travel *into* the curving wormhole instead of watching it from a
    // fixed point. The dolly speed matches the particle flow, so the tube
    // reads as a fixed structure in space that we move through.
    const dolly = uniforms.uLength.value * uniforms.uSpeed.value;
    const lookAhead = 16;

    const flyCamera = (t: number) => {
      const camZ = -t * dolly;
      uniforms.uCamZ.value = camZ;

      const cx = (z: number) =>
        2.4 * Math.sin(z * 0.08 + t * 0.25) +
        1.2 * Math.cos(z * 0.15 - t * 0.18) +
        ptr.x * 2.0;
      const cy = (z: number) =>
        2.2 * Math.cos(z * 0.1 - t * 0.22) +
        1.1 * Math.sin(z * 0.13 + t * 0.2) +
        ptr.y * 2.0;

      camera.position.set(cx(camZ), cy(camZ), camZ);
      camera.lookAt(cx(camZ - lookAhead), cy(camZ - lookAhead), camZ - lookAhead);
    };

    if (paused) {
      // Single still frame for reduced-motion / low-power.
      uniforms.uTime.value = 6.0;
      flyCamera(6.0);
      renderer.render(scene, camera);

      return () => {
        window.removeEventListener('resize', resize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    // Render ONLY while the section is on screen. When it scrolls out of
    // view the loop is fully suspended (zero GPU/CPU cost), so it never
    // competes for the frame budget while the rest of the page scrolls.
    // Time accrues only while visible, so motion stays continuous.
    let running = false;
    let elapsed = 0;
    let last = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (last === 0) last = now;
      elapsed += (now - last) / 1000;
      last = now;
      uniforms.uTime.value = elapsed;
      // Ease the steering pointer for buttery, shake-free motion.
      ptr.x += (pointerTarget.current.x - ptr.x) * 0.04;
      ptr.y += (pointerTarget.current.y - ptr.y) * 0.04;
      flyCamera(elapsed);
      renderer.render(scene, camera);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      last = 0;
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
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
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
