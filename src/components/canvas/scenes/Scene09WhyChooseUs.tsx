'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SCENE 09 — WHY CHOOSE US  (stub — ambient backdrop)
 * ---------------------------------------------------
 * Storyboard: achievements presented through motion graphics — projects,
 * years, brands, support. The headline numbers live in the DOM overlay
 * (see Overlay.tsx → STATS) so they stay crisp and accessible; this scene
 * provides a calm, premium particle backdrop behind them.
 *
 * A slow-drifting starfield of champagne motes, gently parallaxing. Keeps
 * the chapter from feeling empty without competing with the statistics.
 *
 * TODO:
 *  - Optionally morph the particle field into the next/prev scene shapes
 *    for seamless transitions.
 *  - Tie a faint pulse to each stat as it counts up in the DOM.
 */
const MOTES = 800;

export function Scene09WhyChooseUs({ active }: { active: boolean }) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(MOTES * 3);
    for (let i = 0; i < MOTES; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime * (active ? 1 : 0.3);
    points.current.rotation.y = t * 0.02;
    points.current.position.y = Math.sin(t * 0.3) * 0.2;
  });

  return (
    <points ref={points} position={[0, 1, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MOTES}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#2997ff"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
