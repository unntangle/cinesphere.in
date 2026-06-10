'use client';

import { useExperience } from '@/store/useExperience';
import { SCENES } from '@/lib/constants';

import { Scene01BirthOfSound } from './scenes/Scene01BirthOfSound';
import { Scene02SoundEvolution } from './scenes/Scene02SoundEvolution';
import { Scene03HomeTheatre } from './scenes/Scene03HomeTheatre';
import { Scene04DolbyAtmos } from './scenes/Scene04DolbyAtmos';
import { Scene05SmartVilla } from './scenes/Scene05SmartVilla';
import { Scene06Automation } from './scenes/Scene06Automation';
import { Scene07BrandVault } from './scenes/Scene07BrandVault';
import { Scene08Projects } from './scenes/Scene08Projects';
import { Scene09WhyChooseUs } from './scenes/Scene09WhyChooseUs';
import { Scene10Finale } from './scenes/Scene10Finale';

const SCENE_COMPONENTS = [
  Scene01BirthOfSound,
  Scene02SoundEvolution,
  Scene03HomeTheatre,
  Scene04DolbyAtmos,
  Scene05SmartVilla,
  Scene06Automation,
  Scene07BrandVault,
  Scene08Projects,
  Scene09WhyChooseUs,
  Scene10Finale,
];

/**
 * Mounts the active scene plus its immediate neighbours so transitions can
 * crossfade. Scenes more than one step away are unmounted to free GPU memory
 * — this keeps the draw call budget tight even with 10 chapters.
 *
 * Each scene receives `active` so it can pause its expensive work when it's
 * only being kept warm for a transition.
 */
export function SceneManager() {
  const activeScene = useExperience((s) => s.activeScene);

  return (
    <>
      {SCENES.map((scene, i) => {
        const distance = Math.abs(i - activeScene);
        if (distance > 1) return null;
        const SceneComponent = SCENE_COMPONENTS[i];
        return (
          <SceneComponent key={scene.id} active={i === activeScene} />
        );
      })}
    </>
  );
}
