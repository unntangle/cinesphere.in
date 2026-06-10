'use client';

import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useExperience } from '@/store/useExperience';

/**
 * Post-processing stack — the "film grade".
 *  - Bloom: makes champagne lights and particles glow.
 *  - DepthOfField: cinematic focus falloff.
 *  - Vignette + Noise: subtle filmic edge + grain.
 *
 * Disabled entirely under reduced-motion / low-power for performance and
 * accessibility. Tune intensities per scene by reading activeScene if needed.
 */
export function Effects() {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  if (reducedMotion) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <DepthOfField
        focusDistance={0.012}
        focalLength={0.04}
        bokehScale={3}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.55} />
      <Noise opacity={0.015} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
