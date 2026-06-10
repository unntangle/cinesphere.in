'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SCENE 05 — THE SMART VILLA  (stub)
 * ----------------------------------
 * Storyboard: the theatre dissolves; the camera glides through a luxury
 * villa — living room, dining, bedroom, terrace, garden — and music follows
 * room to room (multi-room audio + automation).
 *
 * This stub lays out five "rooms" as a connected floor plan with a pulse of
 * light that travels between them (the music handoff). Replace boxes with a
 * sectioned villa model and animate a real camera fly-through.
 *
 * TODO:
 *  - Model/lay out the villa; light each room with its own warm source.
 *  - Drive the travelling pulse from camera/scroll, not just time.
 *  - Add per-room audio "node" glyphs that light up as the pulse arrives.
 */
const ROOMS = [
  { pos: [-4, 0, 0], label: 'Living' },
  { pos: [-1.5, 0, -2], label: 'Dining' },
  { pos: [1.5, 0, 0], label: 'Bedroom' },
  { pos: [4, 0, -2], label: 'Terrace' },
  { pos: [0, 0, 2.5], label: 'Garden' },
];

export function Scene05SmartVilla({ active }: { active: boolean }) {
  const pulse = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!pulse.current) return;
    const t = state.clock.elapsedTime * (active ? 0.4 : 0.1);
    const idx = Math.floor(t % ROOMS.length);
    const next = (idx + 1) % ROOMS.length;
    const f = t % 1;
    const a = ROOMS[idx].pos;
    const b = ROOMS[next].pos;
    pulse.current.position.set(
      THREE.MathUtils.lerp(a[0], b[0], f),
      0.6,
      THREE.MathUtils.lerp(a[2], b[2], f)
    );
  });

  return (
    <group position={[0, -0.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#0a0a0b" roughness={0.8} metalness={0.2} />
      </mesh>

      {ROOMS.map((r) => (
        <mesh key={r.label} position={[r.pos[0], 0, r.pos[2]]}>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial
            color="#121214"
            metalness={0.3}
            roughness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* travelling music pulse */}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshStandardMaterial
          color="#64d2ff"
          emissive="#64d2ff"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
