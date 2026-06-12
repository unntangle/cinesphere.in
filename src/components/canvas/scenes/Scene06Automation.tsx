'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SCENE 06 — THE AUTOMATION EXPERIENCE  (stub)
 * --------------------------------------------
 * Storyboard: a futuristic command center. Floating glass UI panels for
 * lighting, audio, video, security, curtains, HVAC — holographic, Vision-Pro
 * meets Iron Man.
 *
 * This stub floats six translucent panels in an arc. For the real build,
 * render live HTML control UIs onto the panels with drei <Html transform>
 * (so they're crisp and interactive) and add gesture-style hover motion.
 *
 * TODO:
 *  - Replace plane panels with drei <Html transform occlude> dashboards.
 *  - Add a subtle parallax tied to pointer for the "holographic" feel.
 *  - Champagne edge-glow shader on panel borders.
 */
const PANELS = ['Lighting', 'Audio', 'Video', 'Security', 'Curtains', 'HVAC'];

export function Scene06Automation({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.2) * 0.15 * (active ? 1 : 0.3);
  });

  return (
    <group ref={group} position={[0, 1.2, 0]}>
      {PANELS.map((label, i) => {
        const angle = (i / PANELS.length) * Math.PI - Math.PI / 2;
        const x = Math.sin(angle) * 3.4;
        const z = -Math.cos(angle) * 1.2;
        return (
          <Float key={label} speed={1.5} floatIntensity={0.5} rotationIntensity={0.1}>
            <mesh position={[x, (i % 2) * 0.5 - 0.25, z]} rotation={[0, -angle, 0]}>
              <planeGeometry args={[1.5, 1]} />
              <meshStandardMaterial
                color="#16161a"
                emissive="#d4af37"
                emissiveIntensity={0.15}
                transparent
                opacity={0.55}
                metalness={0.2}
                roughness={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}
