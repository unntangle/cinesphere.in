'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';
import { localProgress } from '@/lib/constants';

/**
 * SCENE 01 — THE BIRTH OF SOUND  (functional reference scene)
 * ------------------------------------------------------------
 * A single premium speaker cone floats in infinite dark space. As the user
 * scrolls, it pulses (vibrates) and emits particles that drift outward and
 * resolve into an expanding ring — the first "sound wave".
 *
 * This scene is intentionally complete so it can serve as the pattern the
 * remaining scenes follow: read scroll → drive geometry in useFrame.
 *
 * TODO(assets): swap the procedural cone for a real GLTF speaker model
 * (drei useGLTF) once the model is sourced. Keep the vibration + emission.
 */
const COUNT = 1400;

export function Scene01BirthOfSound({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const points = useRef<THREE.Points>(null);
  const progress = useExperience((s) => s.progress);

  // Pre-compute particle start positions on a small sphere around the cone.
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.35 + Math.random() * 0.1;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.5 + Math.random();
    }
    return { positions, speeds };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const local = active ? localProgress(progress) : 0;

    // Cone vibration — high-frequency micro-scale on Z, growing with scroll.
    if (cone.current) {
      const vib = Math.sin(t * 40) * 0.02 * (0.3 + local);
      cone.current.scale.z = 1 + vib;
      cone.current.rotation.z = t * 0.05;
    }

    // Particles expand outward as the wave is "born".
    if (points.current) {
      const geo = points.current.geometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const expand = 1 + local * 4;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        const wobble = Math.sin(t * speeds[i] + i) * 0.05 * local;
        pos.array[ix] = positions[ix] * expand + wobble;
        pos.array[ix + 1] = positions[ix + 1] * expand + wobble;
        pos.array[ix + 2] = positions[ix + 2] * expand;
      }
      pos.needsUpdate = true;
      (points.current.material as THREE.PointsMaterial).opacity =
        0.2 + local * 0.8;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Procedural "speaker cone" — replace with GLTF later. */}
        <mesh ref={cone} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 0.4, 64, 1, true]} />
          <meshStandardMaterial
            color="#0c0c0e"
            metalness={0.9}
            roughness={0.25}
            side={THREE.DoubleSide}
            emissive="#d4af37"
            emissiveIntensity={0.05}
          />
        </mesh>
        {/* dust cap */}
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#1a1a1d" metalness={1} roughness={0.3} />
        </mesh>
      </Float>

      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#f0d98c"
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
