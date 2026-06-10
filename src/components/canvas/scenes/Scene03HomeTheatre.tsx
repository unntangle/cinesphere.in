'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';
import { localProgress } from '@/lib/constants';

/**
 * SCENE 03 — THE LUXURY HOME THEATRE  (stub — assembles to refine)
 * ----------------------------------------------------------------
 * Storyboard: a private theatre builds itself in the dark — walls rise,
 * acoustic panels form, seats appear, projector + speakers slot in.
 *
 * This stub renders the room as primitives whose scale is driven by scroll
 * (the "assembly" beat). Replace primitives with modeled assets and stagger
 * their reveal with a GSAP timeline for the final cinematic build.
 *
 * TODO:
 *  - Swap boxes for GLTF: screen wall, recliner seats, acoustic panels.
 *  - Stagger reveal (walls → panels → seats → projector → speakers).
 *  - Add a warm projector volumetric cone + screen emissive glow.
 */
export function Scene03HomeTheatre({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const progress = useExperience((s) => s.progress);

  useFrame(() => {
    if (!group.current) return;
    const local = active ? localProgress(progress) : 0;
    // Assembly: the room grows into place as the scene becomes active.
    const s = THREE.MathUtils.lerp(0.85, 1, local);
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} position={[0, 0.6, 0]}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#0a0a0b" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* screen wall */}
      <mesh position={[0, 0.4, -5]}>
        <planeGeometry args={[8, 3.6]} />
        <meshStandardMaterial
          color="#101012"
          emissive="#64d2ff"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* side acoustic panels */}
      {[-4.8, 4.8].map((x) => (
        <mesh key={x} position={[x, 0.4, -1]} rotation={[0, x > 0 ? -0.4 : 0.4, 0]}>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#16161a" roughness={0.9} />
        </mesh>
      ))}
      {/* seats */}
      {[-1.6, 0, 1.6].map((x) => (
        <mesh key={x} position={[x, -0.6, 1.5]}>
          <boxGeometry args={[1.1, 0.8, 1.1]} />
          <meshStandardMaterial color="#1d1d22" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
