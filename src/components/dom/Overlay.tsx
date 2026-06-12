'use client';

import {
  SCENES,
  BRANDS,
  STATS,
  BRAND,
  SOLUTIONS,
  TESTIMONIALS,
} from '@/lib/constants';
import { SceneSection } from './SceneSection';
import { HeroFrameSequence } from './HeroFrameSequence';
import { FocalRevealSection } from './FocalRevealSection';
import { AboutSoundSection } from './AboutSoundSection';
import { Button } from '@/components/ui/Button';

/**
 * The full DOM overlay: every chapter's copy in scroll order, plus the
 * brand strip (Scene 07), stat row (Scene 09) and the closing CTA +
 * contact footer (Scene 10). The WebGL canvas sits fixed behind this.
 */
export function Overlay() {
  return (
    <main id="top" className="relative z-10">
      {SCENES.map((scene) => {
        // Scene 01 — scroll-scrubbed hero (canvas frame sequence; falls
        // back to the <video> hero automatically if no frames exist yet).
        if (scene.id === 'birth-of-sound') {
          return <HeroFrameSequence key={scene.id} scene={scene} />;
        }

        // Scene 02 — FOCAL certified-partner curtain reveal: the speaker
        // pair splits left/right to unveil the message + sound waves.
        if (scene.id === 'sound-evolution') {
          return <FocalRevealSection key={scene.id} scene={scene} />;
        }

        // Scene 03 — About Us with centre-out sound burst (shockwave
        // rings + vibrating waveform flanking the copy).
        if (scene.id === 'home-theatre') {
          return <AboutSoundSection key={scene.id} scene={scene} />;
        }

        // Inject scene-specific DOM extras where the storyboard calls for them.
        if (scene.id === 'brand-vault') {
          return (
            <SceneSection key={scene.id} scene={scene}>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {BRANDS.map((b) => (
                  <li
                    key={b}
                    className="font-display text-xl text-ivory-muted transition-colors hover:text-champagne"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </SceneSection>
          );
        }

        if (scene.id === 'why-us') {
          return (
            <SceneSection key={scene.id} scene={scene}>
              <dl className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <dt className="text-gold font-display text-5xl md:text-6xl">
                      {s.value}
                      {s.suffix}
                    </dt>
                    <dd className="eyebrow mt-2 text-ivory-faint">{s.label}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
                {TESTIMONIALS.map((t) => (
                  <figure key={t.name} className="glass p-6">
                    <blockquote className="font-sans text-sm leading-relaxed text-ivory-muted">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="eyebrow mt-4">{t.name}</figcaption>
                  </figure>
                ))}
              </div>
            </SceneSection>
          );
        }

        if (scene.id === 'finale') {
          return (
            <SceneSection key={scene.id} scene={scene}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button variant="gold">Quick Enquiry</Button>
                <Button variant="ghost">Call {BRAND.phone}</Button>
                <Button variant="ghost">Explore More</Button>
              </div>

              <footer
                id="contact"
                className="mt-24 border-t border-white/10 pt-10 text-center"
              >
                <p className="display text-2xl text-gold">{BRAND.name}</p>
                <p className="eyebrow mt-3">{BRAND.tagline}</p>

                <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2">
                  {SOLUTIONS.map((s) => (
                    <li
                      key={s}
                      className="font-sans text-xs text-ivory-faint transition-colors hover:text-champagne"
                    >
                      {s}
                    </li>
                  ))}
                </ul>

                <p className="mt-8 font-sans text-sm text-ivory-muted">
                  {BRAND.city}
                </p>
                <p className="mt-2 font-sans text-sm text-ivory-muted">
                  {BRAND.phone} · {BRAND.email}
                </p>
                <p className="mt-8 font-sans text-xs text-ivory-faint">
                  © {new Date().getFullYear()} {BRAND.name}. All Rights
                  Reserved.
                </p>
              </footer>
            </SceneSection>
          );
        }

        return <SceneSection key={scene.id} scene={scene} />;
      })}
    </main>
  );
}
