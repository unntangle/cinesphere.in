'use client';

import type { SceneDef } from '@/lib/constants';

/**
 * ClientsMarqueeSection — "Our Valuable Clients"
 * -----------------------------------------------
 * A seamless infinite logo carousel on the light editorial theme:
 * rounded white cards glide right → left in a continuous loop (two
 * copies of the deck, CSS-animated by -50%), pausing on hover. Clients
 * whose logo file exists in /public/clients-logo render the image;
 * the rest render an elegant wordmark card until their logo is added —
 * just set the `logo` field.
 */

interface Client {
  name: string;
  /** Path under /public — omit to render a wordmark card. */
  logo?: string;
}

const CLIENTS: Client[] = [
  // TODO: swap in each client's own logo file when available — the CAT
  // logo is a stand-in across all cards for now.
  { name: 'CAT', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'Thales', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'A² Square', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'Starwood Hotels & Resorts', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'Cauvery College', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'Jeppiaar', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'The Residency', logo: '/clients-logo/CAT-logo.webp' },
];

function LogoCard({ client }: { client: Client }) {
  return (
    <div className="flex h-24 w-52 flex-none items-center justify-center rounded-2xl border border-black/[0.06] bg-white px-8 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-1 md:h-28 md:w-60">
      {client.logo ? (
        <img
          src={client.logo}
          alt={client.name}
          className="max-h-12 w-auto max-w-full object-contain md:max-h-14"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="display text-center text-lg leading-tight text-carbon md:text-xl">
          {client.name}
        </span>
      )}
    </div>
  );
}

export function ClientsMarqueeSection({ scene }: { scene: SceneDef }) {
  return (
    <section
      id={scene.id}
      data-scene={scene.index}
      className="section-light relative z-10 w-full overflow-hidden py-20 md:py-28"
    >
      <div className="px-[7vw]">
        <p className="eyebrow">{scene.copy.eyebrow}</p>
        <h2 className="display mt-3 text-3xl md:text-4xl lg:text-5xl">
          Know our valuable clients.
        </h2>
        <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ivory-muted md:text-base">
          {scene.copy.body}
        </p>
      </div>

      {/* The loop — group enables pause-on-hover; edge fades melt the
          cards into the panel at both sides. */}
      <div className="group relative mt-12 md:mt-16">
        <div className="flex overflow-hidden">
          <div className="marquee-track flex w-max gap-5 pr-5 group-hover:[animation-play-state:paused] md:gap-7 md:pr-7">
            {[...CLIENTS, ...CLIENTS].map((client, i) => (
              <LogoCard key={`${client.name}-${i}`} client={client} />
            ))}
          </div>
        </div>

        {/* Edge fades. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f5f5f7] to-transparent md:w-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f5f5f7] to-transparent md:w-40"
        />
      </div>
    </section>
  );
}
