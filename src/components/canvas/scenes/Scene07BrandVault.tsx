'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { BRANDS } from '@/lib/constants';

/**
 * SCENE 07 — THE BRAND VAULT  (stub)
 * ----------------------------------
 * Storyboard: a futuristic luxury gallery. Premium audio brands float as
 * museum exhibits on lit pedestals, rotating slowly. Click → cinematic
 * product showcase (exploded views).
 *
 * This stub places one rotating exhibit per brand on a pedestal in a row.
 * For the real build, load each product's GLTF, add a spotlight per pedestal,
 * make exhibits raycast-clickable, and animate an exploded-view on select.
 *
 * TODO:
 *  - Per-brand GLTF product models + individual key spotlights.
 *  - onPointerOver lift + onClick → push to a focused showcase camera.
 *  - drei <Html> caption plinths with the brand name + product line.
 */
export function Scene07BrandVault({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.rotation.y = state.clock.elapsedTime * (0.3 + i * 0.02) * (active ? 1 : 0.2);
    });
  });

  return (
    <group ref={group} position={[0, 0.4, 0]}>
      {BRANDS.map((brand, i) => {
        const x = (i - (BRANDS.length - 1) / 2) * 1.8;
        return (
          <group key={brand} position={[x, 0, 0]}>
            {/* pedestal */}
            <mesh position={[0, -0.9, 0]}>
              <cylinderGeometry args={[0.4, 0.5, 0.3, 32]} />
              <meshStandardMaterial color="#0c0c0e" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* exhibit placeholder — swap for product GLTF */}
            <Float speed={2} floatIntensity={0.3}>
              <mesh>
                <boxGeometry args={[0.5, 0.7, 0.5]} />
                <meshStandardMaterial
                  color="#1a1a1d"
                  metalness={0.9}
                  roughness={0.2}
                  emissive="#d4af37"
                  emissiveIntensity={0.08}
                />
              </mesh>
            </Float>
          </group>
        );
      })}
    </group>
  );
}
