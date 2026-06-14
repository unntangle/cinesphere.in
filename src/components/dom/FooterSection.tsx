'use client';

import { BRAND, SOLUTIONS } from '@/lib/constants';
import Link from 'next/link';

/**
 * FooterSection — Apple-style sitemap footer
 * -------------------------------------------
 * Light editorial panel with headed link columns (Solutions split into
 * commercial / home groups, Company, Partners, Contact), separated by
 * hairline rules, a "more ways to reach us" line, and a legal bottom
 * bar — modelled on apple.com's footer.
 */

const COMMERCIAL_SOLUTIONS = SOLUTIONS.slice(0, 5);
const MORE_SOLUTIONS = SOLUTIONS.slice(5);

const COMPANY_LINKS = [
  { label: 'About Us', href: '/#home-theatre' },
  { label: 'Our Solutions', href: '/#dolby-atmos' },
  { label: 'Our Clients', href: '/#brand-vault' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact Us', href: '/#contact' },
] as const;

const PARTNER_LINKS = [
  { label: 'Certified Focal Partner', href: '/#sound-evolution' },
  { label: 'Harman Kardon Authorized Dealer', href: '/#harman-kardon' },
] as const;

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-sans text-xs font-semibold text-carbon">
        {heading}
      </h3>
      <ul className="mt-3 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group/fl inline-flex items-center font-sans text-xs text-ivory-muted transition-colors hover:text-carbon"
      >
        {/* A tiny 3-bar equalizer ticks to life as the link is hovered —
            it grows in from zero width and nudges the label across. */}
        <span
          aria-hidden
          className="flex h-3 w-0 items-end gap-[2px] overflow-hidden opacity-0 transition-all duration-300 group-hover/fl:mr-2 group-hover/fl:w-3 group-hover/fl:opacity-100"
        >
          {[0, 0.18, 0.36].map((d, i) => (
            <span
              key={i}
              className="eq-bar w-[2px] rounded-full bg-champagne-deep"
              style={{ height: `${50 + i * 22}%`, animationDelay: `${d}s` }}
            />
          ))}
        </span>
        {label}
      </Link>
    </li>
  );
}

/**
 * EqualizerStrip — a continuous frequency spectrum that ripples across the
 * footer in champagne, the brand's sound signature. Pure CSS (.eq-bar): two
 * overlaid sines shape an organic spectrum and a stepped animation-delay
 * sends a travelling wave rolling across the bars. Masked to fade out at
 * both ends so it melts into the panel.
 */
const STRIP_BARS = 48;

/* Header-style spectrum sweep (blue → cyan → violet → magenta → champagne →
   orange → red), sampled across the strip so the bars read as multicolour
   like the hero/nav waveform. Champagne stands in for the hero's white
   centre so it stays visible on the light footer. */
const SPECTRUM: [number, number, number][] = [
  [0, 180, 255],
  [53, 224, 232],
  [124, 92, 255],
  [255, 61, 203],
  [205, 178, 133],
  [255, 138, 42],
  [255, 42, 42],
];

function spectrumColor(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  const seg = clamped * (SPECTRUM.length - 1);
  const i = Math.min(SPECTRUM.length - 2, Math.floor(seg));
  const f = seg - i;
  const [r1, g1, b1] = SPECTRUM[i];
  const [r2, g2, b2] = SPECTRUM[i + 1];
  return [
    Math.round(r1 + (r2 - r1) * f),
    Math.round(g1 + (g2 - g1) * f),
    Math.round(b1 + (b2 - b1) * f),
  ].join(', ');
}

function EqualizerStrip() {
  return (
    <div
      aria-hidden
      className="flex h-9 items-end justify-center gap-[3px] [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)] md:h-11 md:gap-1.5"
    >
      {Array.from({ length: STRIP_BARS }).map((_, i) => {
        const height =
          26 +
          60 *
            Math.abs(Math.sin(i * 0.5) * 0.6 + Math.sin(i * 0.17 + 1.3) * 0.4);
        const delay = (i % 14) * 0.06;
        const duration = 1.1 + (i % 5) * 0.16;
        const color = spectrumColor(i / (STRIP_BARS - 1));
        return (
          <span
            key={i}
            className="eq-bar w-[2px] rounded-full md:w-[3px]"
            style={{
              height: `${height}%`,
              background: `linear-gradient(to top, rgba(${color}, 0.25), rgb(${color}))`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export function FooterSection() {
  return (
    <footer
      id="footer"
      className="section-light relative z-10 w-full pt-10 pb-4 md:pt-12 md:pb-5"
    >
      <div className="mx-auto max-w-7xl px-[7vw] lg:px-12">
        {/* Breadcrumb row — wordmark + tagline. */}
        <div className="flex items-center gap-3 border-b border-black/10 pb-4">
          <span className="relative inline-flex items-center">
            {/* soft champagne glow so the logo reads on the ivory panel */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-14 w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(205,178,133,0.55), rgba(255,255,255,0.3) 45%, transparent 72%)',
              }}
            />
            <img
              src="/images/cinesphere-logo.webp"
              alt={BRAND.name}
              className="relative z-10 h-9 w-auto object-contain"
              draggable={false}
            />
          </span>
          <span aria-hidden className="text-ivory-muted">
            ›
          </span>
          <span className="font-sans text-xs text-ivory-muted">
            {BRAND.tagline}
          </span>
        </div>

        {/* Link columns. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-8 md:grid-cols-3 lg:grid-cols-5">
          <FooterColumn heading="Solutions">
            {COMMERCIAL_SOLUTIONS.map((s) => (
              <FooterLink key={s} href="/#dolby-atmos" label={s} />
            ))}
          </FooterColumn>

          <FooterColumn heading="More Solutions">
            {MORE_SOLUTIONS.map((s) => (
              <FooterLink key={s} href="/#dolby-atmos" label={s} />
            ))}
          </FooterColumn>

          <FooterColumn heading="Company">
            {COMPANY_LINKS.map((l) => (
              <FooterLink key={l.label} href={l.href} label={l.label} />
            ))}
          </FooterColumn>

          <FooterColumn heading="Partners">
            {PARTNER_LINKS.map((l) => (
              <FooterLink key={l.label} href={l.href} label={l.label} />
            ))}
          </FooterColumn>

          <FooterColumn heading="Get in Touch">
            <li>
              <a
                href={BRAND.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs leading-relaxed text-ivory-muted transition-colors hover:text-carbon hover:underline"
              >
                {BRAND.city}
              </a>
            </li>
            <li>
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, '')}`}
                className="font-sans text-xs text-ivory-muted transition-colors hover:text-carbon hover:underline"
              >
                {BRAND.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${BRAND.email}`}
                className="font-sans text-xs text-ivory-muted transition-colors hover:text-carbon hover:underline"
              >
                {BRAND.email}
              </a>
            </li>
          </FooterColumn>
        </div>

        {/* Legal bottom bar — copyright only, centred. */}
        <div className="mt-12">
          <p className="text-center font-sans text-xs text-ivory-muted">
            Copyright © {new Date().getFullYear()} {BRAND.name}. All rights
            reserved.
          </p>
        </div>

        {/* Equalizer signature — a champagne frequency spectrum that
            ripples across the footer, standing in for a plain divider. */}
        <div className="mt-4">
          <EqualizerStrip />
        </div>
      </div>
    </footer>
  );
}
