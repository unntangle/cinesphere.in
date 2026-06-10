'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { SceneDef } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * One full-viewport scroll section per scene. The 3D lives in a fixed
 * canvas behind everything; these sections exist to (a) create scroll
 * height and (b) present each chapter's copy with a cinematic fade
 * tied to its own scroll position.
 */
export function SceneSection({
  scene,
  children,
}: {
  scene: SceneDef;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Copy is invisible at the edges of the section, full in the middle band.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.72, 1],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [40, 0, 0, -40]);

  const align = scene.copy.align ?? 'center';
  const light = scene.theme === 'light';

  return (
    <section
      ref={ref}
      id={scene.id}
      data-scene={scene.index}
      className={cn(
        'relative flex min-h-screen w-full items-center px-6 md:px-16',
        // Apple-style light editorial panel — covers the dark canvas.
        light && 'section-light z-10 py-24'
      )}
    >
      <motion.div
        style={{ opacity, y }}
        className={cn(
          'relative z-10 max-w-3xl',
          align === 'center' && 'mx-auto text-center',
          align === 'right' && 'ml-auto text-right',
          align === 'left' && 'text-left'
        )}
      >
        {scene.copy.eyebrow && (
          <p className="eyebrow mb-6">{scene.copy.eyebrow}</p>
        )}
        <h2 className="display whitespace-pre-line text-4xl text-balance md:text-7xl">
          {scene.copy.title}
        </h2>
        {scene.copy.body && (
          <p
            className={cn(
              'mt-6 max-w-xl font-sans text-base leading-relaxed text-ivory-muted md:text-lg',
              align === 'center' && 'mx-auto'
            )}
          >
            {scene.copy.body}
          </p>
        )}
        {children}
      </motion.div>
    </section>
  );
}
