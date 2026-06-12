'use client';

import {
  SCENES,
  BRAND,
} from '@/lib/constants';
import { SceneSection } from './SceneSection';
import { HeroFrameSequence } from './HeroFrameSequence';
import { FocalRevealSection } from './FocalRevealSection';
import { HarmanRevealSection } from './HarmanRevealSection';
import { SolutionsCarouselSection } from './SolutionsCarouselSection';
import { StatsBandSection } from './StatsBandSection';
import { GalleryParallaxSection } from './GalleryParallaxSection';
import { TestimonialsSection } from './TestimonialsSection';
import { ClientsMarqueeSection } from './ClientsMarqueeSection';
import { FooterSection } from './FooterSection';
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

        // Scene 04 — Harman Kardon Authorized Dealer: the Citation pair
        // splits left/right to unveil "Authorized Dealer of" + HK logo.
        if (scene.id === 'harman-kardon') {
          return <HarmanRevealSection key={scene.id} scene={scene} />;
        }

        // Scene 03 — About Us with centre-out sound burst (shockwave
        // rings + vibrating waveform flanking the copy).
        if (scene.id === 'home-theatre') {
          return <AboutSoundSection key={scene.id} scene={scene} />;
        }

        // Scenes 05–07 — Our Solutions, merged into one Apple-style
        // horizontal carousel, followed by the "mixing console" stats
        // band (count-up numbers + equalizer meters).
        if (scene.id === 'dolby-atmos') {
          return (
            <div key={scene.id}>
              <SolutionsCarouselSection scene={scene} />
              <GalleryParallaxSection />
              <TestimonialsSection />
              <StatsBandSection />
            </div>
          );
        }
        if (scene.id === 'smart-villa' || scene.id === 'automation') {
          // Absorbed into the solutions carousel above.
          return null;
        }
        if (scene.id === 'projects') {
          // Gallery moved up — rendered as GalleryParallaxSection right
          // below the stats band (it carries the #projects anchor).
          return null;
        }

        // Scene — Our Valuable Clients: rounded logo cards in a
        // seamless infinite marquee (pause on hover).
        // NOTE: the "Get in Touch" ContactCTASection is hidden for now —
        // re-add <ContactCTASection /> below the marquee to restore it.
        if (scene.id === 'brand-vault') {
          return <ClientsMarqueeSection key={scene.id} scene={scene} />;
        }

        if (scene.id === 'why-us') {
          // Testimonials moved up — rendered as TestimonialsSection
          // (the "liner notes" track-list) below the gallery.
          return null;
        }

        if (scene.id === 'finale') {
          // Closing CTA — contained banner card: dark rounded panel on
          // the light theme, copy left, studio image right (faded into
          // the card), single Get Started CTA — followed by the footer.
          return (
            <div key={scene.id}>
              <section
                id={scene.id}
                data-scene={scene.index}
                className="section-light relative z-10 w-full px-6 pb-4 pt-12 md:px-16"
              >
                <div className="relative mx-auto grid max-w-7xl items-center overflow-hidden rounded-3xl bg-piano md:grid-cols-2">
                  {/* Copy — left. */}
                  <div className="relative z-10 p-8 md:p-10 lg:p-12">
                    <p className="eyebrow">{scene.copy.eyebrow}</p>
                    <h2 className="display mt-2 whitespace-pre-line text-balance text-xl !text-ivory md:text-2xl lg:text-3xl">
                      {scene.copy.title}
                    </h2>
                    <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ivory-muted">
                      {scene.copy.body}
                    </p>
                    <a href="#contact" className="mt-6 inline-block">
                      <Button variant="gold">Let&apos;s Talk</Button>
                    </a>
                  </div>

                  {/* Image — right, melting into the card on its left edge. */}
                  <div className="relative h-44 md:h-full md:min-h-[15rem]">
                    <img
                      src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=70"
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover brightness-[0.8] sepia-[0.25] saturate-[1.15]"
                      loading="lazy"
                      draggable={false}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-piano via-transparent to-transparent md:bg-gradient-to-r md:from-piano md:via-piano/30 md:to-transparent"
                    />
                  </div>
                </div>
              </section>
              <FooterSection />
            </div>
          );
        }

        return <SceneSection key={scene.id} scene={scene} />;
      })}
    </main>
  );
}
