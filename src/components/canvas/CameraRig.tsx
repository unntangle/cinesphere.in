'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useExperience } from '@/store/useExperience';
import { SCENES, SCENE_COUNT } from '@/lib/constants';
import { lerp } from '@/lib/utils';

/**
 * CameraRig — interpolates the camera through every scene's keyframe based
 * on global scroll progress. Movement is damped (not snapped) so the whole
 * site feels like one continuous dolly move through environments.
 *
 * This is the backbone of the "cinematic camera that moves while scrolling"
 * requirement. Per-scene fine motion (orbits, push-ins) can be layered on
 * top inside each scene component.
 */
const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0, 0, 0);

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const progress = useExperience((s) => s.progress);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useFrame((_, delta) => {
    const p = progressRef.current * (SCENE_COUNT - 1);
    const i = Math.min(SCENE_COUNT - 1, Math.floor(p));
    const next = Math.min(SCENE_COUNT - 1, i + 1);
    const t = p - i;

    const a = SCENES[i].camera;
    const b = SCENES[next].camera;

    _pos.set(
      lerp(a.position[0], b.position[0], t),
      lerp(a.position[1], b.position[1], t),
      lerp(a.position[2], b.position[2], t)
    );
    _look.set(
      lerp(a.lookAt[0], b.lookAt[0], t),
      lerp(a.lookAt[1], b.lookAt[1], t),
      lerp(a.lookAt[2], b.lookAt[2], t)
    );

    // Critically-damped follow for buttery motion.
    const damp = 1 - Math.pow(0.0008, delta);
    camera.position.lerp(_pos, damp);
    _currentLook.lerp(_look, damp);
    camera.lookAt(_currentLook);
  });

  return null;
}
