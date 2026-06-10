'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SCENE 08 — PROJECT SHOWCASE  (stub)
 * -----------------------------------
 * Storyboard: a Chennai-inspired luxury skyline at night. Light beams
 * connect completed projects; project cards emerge from buildings. Villas,
 * apartments, boardrooms, auditoriums.
 *
 * This stub generates a procedural skyline of towers with emissive windows
 * and a few vertical "light beams" marking flagship projects. For the real
 * build, drive beams from real project coordinates and surface drei <Html>
 * project cards on hover, with a camera fly-through.
 *
 * TODO:
 *  - Replace random towers with a stylized Chennai skyline silhouette.
 *  - Map beams to actual projects; click → project card + gallery.
 *  - Animated network lines connecting the lit projects.
 */
const TOWERS = 40;

export function Scene08Projects({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);

  const towers = useMemo(
    () =>
      Array.from({ length: TOWERS }, () => ({
        x: (Math.random() - 0.5) * 24,
        z: (Math.random() - 0.5) * 14,
        h: 0.5 + Math.random() * 4,
        flagship: Math.random() > 0.8,
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.03 * (active ? 1 : 0.3);
  });

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#070708" roughness={1} />
      </mesh>

      {towers.map((t, i) => (
        <group key={i} position={[t.x, t.h / 2, t.z]}>
          <mesh>
            <boxGeometry args={[0.6, t.h, 0.6]} />
            <meshStandardMaterial
              color="#101012"
              emissive="#2997ff"
              emissiveIntensity={t.flagship ? 0.3 : 0.08}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          {/* flagship light beam */}
          {t.flagship && (
            <mesh position={[0, t.h * 2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, t.h * 4, 8]} />
              <meshBasicMaterial color="#64d2ff" transparent opacity={0.4} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
