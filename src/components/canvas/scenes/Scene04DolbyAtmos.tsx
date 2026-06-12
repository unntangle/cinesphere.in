'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SCENE 04 — DOLBY ATMOS EXPERIENCE  (stub — partially functional)
 * ----------------------------------------------------------------
 * Storyboard: inside the theatre, sound objects move around the room on
 * 360° paths — front, rear, height channels and the sub — as glowing trails.
 *
 * This stub animates four "sound objects" orbiting on distinct paths to
 * communicate object-based audio. Trails are faked with emissive spheres;
 * upgrade to real ribbon trails (drei <Trail>) for the final.
 *
 * TODO:
 *  - Use drei <Trail> on each orbiting object for true light-trails.
 *  - Place objects relative to the actual speaker positions in Scene 03.
 *  - Add labels (Front L/R, Surround, Height, LFE) as billboarded sprites.
 */
const CHANNELS = [
  { color: '#f0d98c', radius: 3, height: 0.2, speed: 0.6 }, // front
  { color: '#d4af37', radius: 3.5, height: 0.6, speed: -0.45 }, // rear
  { color: '#ffd87a', radius: 2.2, height: 1.6, speed: 0.8 }, // height
  { color: '#a87f1f', radius: 1.2, height: -0.6, speed: 0.3 }, // LFE/sub
];

export function Scene04DolbyAtmos({ active }: { active: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const positions = useMemo(() => CHANNELS.map(() => new THREE.Vector3()), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * (active ? 1 : 0.2);
    CHANNELS.forEach((c, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      positions[i].set(
        Math.cos(t * c.speed + i) * c.radius,
        c.height + Math.sin(t * c.speed * 2) * 0.3,
        Math.sin(t * c.speed + i) * c.radius
      );
      mesh.position.copy(positions[i]);
    });
  });

  return (
    <group position={[0, 1.2, 0]}>
      {CHANNELS.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* listener position marker */}
      <mesh>
        <ringGeometry args={[0.4, 0.45, 48]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
