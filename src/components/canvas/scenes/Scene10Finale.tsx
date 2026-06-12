'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';
import { localProgress } from '@/lib/constants';

/**
 * SCENE 10 — FINAL IMMERSIVE CTA  (functional — convergence finale)
 * -----------------------------------------------------------------
 * Storyboard: the sound wave returns, all experiences merge, particles
 * converge and the wave resolves into the company logo. Close on the CTAs
 * (rendered in the DOM overlay).
 *
 * This scene scatters the particles wide at the start of the chapter and
 * converges them toward a glowing core as the user scrolls — the "all
 * experiences merge into one" beat. The core stands in for the logo.
 *
 * TODO(brand):
 *  - Replace the glowing core with the CineSphere logo: sample the logo SVG
 *    into target points and lerp particles to them (text/logo morph).
 *  - Add a final bloom swell + slow camera push as convergence completes.
 */
const COUNT = 2200;

export function Scene10Finale({ active }: { active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const progress = useExperience((s) => s.progress);

  // Each particle has a wide "scattered" origin and a tight "converged" target.
  const { scattered, target } = useMemo(() => {
    const scattered = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // scattered: large sphere
      const s = 5 + Math.random() * 4;
      const ts = Math.random() * Math.PI * 2;
      const ps = Math.acos(2 * Math.random() - 1);
      scattered[i * 3] = s * Math.sin(ps) * Math.cos(ts);
      scattered[i * 3 + 1] = s * Math.sin(ps) * Math.sin(ts);
      scattered[i * 3 + 2] = s * Math.cos(ps);
      // target: tight glowing sphere shell (logo stand-in)
      const r = 1 + Math.random() * 0.15;
      const tt = Math.random() * Math.PI * 2;
      const pt = Math.acos(2 * Math.random() - 1);
      target[i * 3] = r * Math.sin(pt) * Math.cos(tt);
      target[i * 3 + 1] = r * Math.sin(pt) * Math.sin(tt);
      target[i * 3 + 2] = r * Math.cos(pt);
    }
    return { scattered, target };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const local = active ? localProgress(progress) : 0;
    // Ease convergence.
    const k = local * local * (3 - 2 * local);

    if (points.current) {
      const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        pos.array[ix] = THREE.MathUtils.lerp(scattered[ix], target[ix], k);
        pos.array[ix + 1] = THREE.MathUtils.lerp(scattered[ix + 1], target[ix + 1], k);
        pos.array[ix + 2] = THREE.MathUtils.lerp(scattered[ix + 2], target[ix + 2], k);
      }
      pos.needsUpdate = true;
      points.current.rotation.y = t * 0.1;
    }

    if (core.current) {
      core.current.scale.setScalar(THREE.MathUtils.lerp(0.1, 1, k));
      (core.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + k * 2.5;
    }
  });

  return (
    <group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[scattered, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#f0d98c"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* glowing core — replace with logo morph target */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.8, 4]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#f0d98c"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
