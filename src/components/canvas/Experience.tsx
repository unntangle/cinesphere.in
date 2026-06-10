'use client';

import { Canvas } from '@react-three/fiber';
import { Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { Suspense } from 'react';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { Effects } from './Effects';
import { SceneManager } from './SceneManager';

/**
 * Experience — the single fixed WebGL canvas behind the whole site.
 * Everything 3D mounts here once and reacts to scroll via the store.
 *
 * Performance notes:
 *  - dpr is capped + adaptive so high-density displays don't melt GPUs.
 *  - AdaptiveDpr/Events drop resolution during fast scroll, restore at rest.
 *  - <Preload all> warms the GPU before reveal; <LoadBridge> reports
 *    progress to the preloader.
 */
export function Experience() {
  return (
    <div className="canvas-root">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.8]}
        camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 6] }}
        // Transparent so CSS piano-black shows through during reveal.
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 1);
        }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <Lighting />
          <SceneManager />
          <Effects />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
