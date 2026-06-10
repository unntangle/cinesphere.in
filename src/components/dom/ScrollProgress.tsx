'use client';

import { useExperience } from '@/store/useExperience';
import { SCENES } from '@/lib/constants';

/**
 * Right-edge chapter indicator. A vertical column of roman-numeral ticks;
 * the active scene's tick blooms champagne. Doubles as a progress read-out.
 */
export function ScrollProgress() {
  const activeScene = useExperience((s) => s.activeScene);
  const ready = useExperience((s) => s.ready);

  if (!ready) return null;

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex"
    >
      {SCENES.map((scene, i) => (
        <span
          key={scene.id}
          className={`h-px transition-all duration-500 ${
            i === activeScene
              ? 'w-8 bg-champagne shadow-gold'
              : 'w-4 bg-white/20'
          }`}
          title={scene.label}
        />
      ))}
    </nav>
  );
}
