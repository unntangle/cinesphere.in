'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';
import { localProgress } from '@/lib/constants';

/**
 * SCENE 02 — THE SOUND EVOLUTION  (functional reference scene)
 * ------------------------------------------------------------
 * The newborn wave travels and splits into a frequency spectrum. We render
 * a radial "equalizer" of bars that dance to a synthetic frequency curve
 * (low/mid/high bands), wrapped around the viewer. Particles orbit the ring.
 *
 * "Sound is not heard. It is felt." — the bars should feel physical.
 *
 * TODO(audio): optionally drive the bar heights from a real AnalyserNode
 * (Web Audio) playing a muted demo track for true reactive visualization.
 */
const BARS = 96;

export function Scene02SoundEvolution({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progress = useExperience((s) => s.progress);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const local = active ? localProgress(progress) : 0;
    const radius = 3;

    for (let i = 0; i < BARS; i++) {
      const angle = (i / BARS) * Math.PI * 2;
      // Three blended frequency bands for a lively spectrum.
      const low = Math.sin(t * 1.5 + i * 0.15) * 0.5 + 0.5;
      const mid = Math.sin(t * 3.0 + i * 0.4) * 0.5 + 0.5;
      const high = Math.sin(t * 6.0 + i * 0.9) * 0.5 + 0.5;
      const h = (low * 0.5 + mid * 0.3 + high * 0.2) * (0.4 + local * 2.2) + 0.1;

      dummy.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      dummy.scale.set(0.06, h, 0.06);
      dummy.rotation.y = -angle;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (group.current) group.current.rotation.y = t * 0.08;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, BARS]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#d4af37"
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </instancedMesh>

      {/* faint inner core */}
      <mesh>
        <icosahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial
          color="#16161a"
          emissive="#f0d98c"
          emissiveIntensity={0.15}
          wireframe
        />
      </mesh>
    </group>
  );
}
