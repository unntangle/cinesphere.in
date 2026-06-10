'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';
import { SCENES } from '@/lib/constants';

/**
 * Global lighting. Kept deliberately dark and directional — luxury lives in
 * shadow. A key champagne rim + a cool fill, plus a subtle ambient floor.
 * The key light's intensity tracks the active scene's `mood` so brighter
 * chapters (Atmos, Automation, Finale) feel more energized.
 */
export function Lighting() {
  const keyRef = useRef<THREE.PointLight>(null);
  const activeScene = useExperience((s) => s.activeScene);

  useFrame((_, delta) => {
    if (!keyRef.current) return;
    const target = 6 + SCENES[activeScene].mood * 10;
    keyRef.current.intensity = THREE.MathUtils.damp(
      keyRef.current.intensity,
      target,
      3,
      delta
    );
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      {/* cool key — Apple-style studio white-blue */}
      <pointLight
        ref={keyRef}
        position={[4, 5, 4]}
        intensity={8}
        color="#bcd7ff"
        distance={40}
        decay={1.4}
      />
      {/* cool fill from the opposite side for separation */}
      <pointLight
        position={[-6, 2, -4]}
        intensity={3}
        color="#5a6b8c"
        distance={40}
        decay={1.6}
      />
      {/* soft top rim */}
      <directionalLight position={[0, 8, 2]} intensity={0.4} color="#f5f5f7" />
    </>
  );
}
