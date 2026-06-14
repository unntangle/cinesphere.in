'use client';

import type { SceneDef } from '@/lib/constants';

/**
 * ClientsMarqueeSection — "Our Valuable Clients"
 * -----------------------------------------------
 * A seamless infinite logo carousel on the light editorial theme:
 * rounded white cards glide right → left in a continuous loop (two
 * copies of the deck, CSS-animated by -50%), pausing on hover. Each
 * card shows the client's logo (WebP, from /public/clients-logo); a
 * client without a `logo` falls back to an elegant wordmark card.
 *
 * The WebP files are produced from the source PNG/JPG logos by
 * scripts/convert-logos.mjs (run: `npm i -D sharp && node
 * scripts/convert-logos.mjs`). To add a client, drop its logo in
 * /public/clients-logo, re-run the script, and add an entry below.
 */

interface Client {
  name: string;
  /** Path under /public — omit to render a wordmark card. */
  logo?: string;
  /** Optional card background — set to match a logo that has a baked-in
   *  colour panel, so the card fills with that colour instead of white. */
  bg?: string;
  /** Object-fit for a `bg` (filled) card: 'cover' fills edge-to-edge (may
   *  crop the panel), 'contain' shows the whole logo centred on `bg`
   *  (no crop). Defaults to 'cover'. */
  fit?: 'cover' | 'contain';
}

const CLIENTS: Client[] = [
  { name: 'CAT', logo: '/clients-logo/CAT-logo.webp' },
  { name: 'Thales', logo: '/clients-logo/thales.webp' },
  { name: 'A² Square', logo: '/clients-logo/a-square.webp' },
  { name: 'Akshaya', logo: '/clients-logo/akshaya.webp' },
  { name: 'Amarprakash', logo: '/clients-logo/amarprakash.webp' },
  { name: 'Auryaj', logo: '/clients-logo/auryaj.webp' },
  { name: 'Cauvery College', logo: '/clients-logo/cauvery-college.webp' },
  { name: 'GRT Hotels', logo: '/clients-logo/grt-hotels.webp' },
  { name: 'Hexaware Technologies', logo: '/clients-logo/hexaware-technologies.webp' },
  { name: 'IIT Madras', logo: '/clients-logo/IIT-madras.webp' },
  { name: 'Indian Maritime University', logo: '/clients-logo/IMU_Logo.webp' },
  { name: 'ITC Hotels', logo: '/clients-logo/itc_hotels.webp' },
  { name: 'JEC', logo: '/clients-logo/JEC.webp' },
  { name: 'Jeppiaar', logo: '/clients-logo/jeppiaar.webp' },
  { name: 'Loyola College', logo: '/clients-logo/loyola-college.webp' },
  { name: 'University of Madras', logo: '/clients-logo/madras-university.webp' },
  { name: 'Meenakshi University', logo: '/clients-logo/meenakshi-university.webp' },
  { name: 'Starwood Hotels & Resorts', logo: '/clients-logo/starwood.webp' },
  { name: 'Tagore Group', logo: '/clients-logo/tagore-groups.webp' },
  { name: 'Taj', logo: '/clients-logo/taj.webp', bg: '#ab9054' },
  { name: 'The Posh', logo: '/clients-logo/the-posh.webp' },
  { name: 'The Residency', logo: '/clients-logo/the-residency.webp', bg: '#4b1133', fit: 'contain' },
  { name: 'The Savera', logo: '/clients-logo/the-savera.webp' },
  { name: 'VELS', logo: '/clients-logo/vels.webp' },
  { name: 'VGP', logo: '/clients-logo/vgp.webp' },
  { name: 'VIT', logo: '/clients-logo/VIT.webp' },
  { name: 'Volvo', logo: '/clients-logo/volvo.webp' },
];

function LogoCard({ client }: { client: Client }) {
  // Logos with a baked-in colour panel (e.g. Taj, The Residency) fill the
  // whole card; 'cover' goes edge-to-edge (may crop), 'contain' shows the
  // whole logo on the matching colour. The rest sit padded on a white card.
  const filled = Boolean(client.bg);
  const filledFit =
    (client.fit ?? 'cover') === 'contain' ? 'object-contain' : 'object-cover';
  // A filled card whose logo is 'contain' (e.g. The Residency) gets padding so
  // the logo sits smaller and centred; the matching bg colour fills the rest.
  const isContainFill = filled && (client.fit ?? 'cover') === 'contain';
  return (
    <div
      className={`group/card relative flex h-28 w-56 flex-none items-center justify-center overflow-hidden rounded-2xl border border-black/[0.06] shadow-[0_4px_24px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne/50 hover:shadow-[0_16px_44px_-14px_rgba(205,178,133,0.5)] md:h-32 md:w-64 ${
        filled ? (isContainFill ? 'p-5 md:p-6' : 'p-0') : 'px-7 py-5 md:px-9 md:py-6'
      }`}
      style={{ backgroundColor: client.bg ?? '#ffffff' }}
    >
      {client.logo ? (
        <img
          src={client.logo}
          alt={client.name}
          className={
            filled
              ? `h-full w-full ${filledFit}`
              : 'max-h-full max-w-full object-contain'
          }
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="display text-center text-lg leading-tight text-carbon md:text-xl">
          {client.name}
        </span>
      )}

      {/* Client name — an editorial reveal: on hover the logo frosts over
          and the name appears in champagne, framed by two gold rules that
          draw outward from the centre. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 px-4 text-center opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover/card:opacity-100">
        <span
          aria-hidden
          className="h-px w-0 bg-champagne-deep/60 transition-[width] duration-500 ease-out group-hover/card:w-10"
        />
        <span className="font-sans text-sm font-semibold tracking-wide text-champagne-deep md:text-base">
          {client.name}
        </span>
        <span
          aria-hidden
          className="h-px w-0 bg-champagne-deep/60 transition-[width] duration-500 ease-out group-hover/card:w-10"
        />
      </div>
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
          cards into the panel at both sides. The section itself is
          overflow-hidden, so it clips the track horizontally at the
          viewport edges; we deliberately DON'T clip here, so the cards'
          drop shadows (and the gold hover glow) fade out cleanly instead
          of being cut into a hard seam. */}
      <div className="group relative mt-12 md:mt-16">
        <div className="flex">
          <div className="marquee-track flex w-max gap-5 pr-5 group-hover:[animation-play-state:paused] md:gap-7 md:pr-7">
            {[...CLIENTS, ...CLIENTS].map((client, i) => (
              <LogoCard key={`${client.name}-${i}`} client={client} />
            ))}
          </div>
        </div>

        {/* Edge fades. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f7f2e8] to-transparent md:w-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f7f2e8] to-transparent md:w-40"
        />
      </div>
    </section>
  );
}
