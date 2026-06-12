'use client';

import { BRAND, SOLUTIONS } from '@/lib/constants';

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
  { label: 'About Us', href: '#home-theatre' },
  { label: 'Our Solutions', href: '#dolby-atmos' },
  { label: 'Our Clients', href: '#brand-vault' },
  { label: 'Gallery', href: '#projects' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact Us', href: '#contact' },
] as const;

const PARTNER_LINKS = [
  { label: 'Certified Focal Partner', href: '#sound-evolution' },
  { label: 'Harman Kardon Authorized Dealer', href: '#harman-kardon' },
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
      <a
        href={href}
        className="font-sans text-xs text-ivory-muted transition-colors hover:text-carbon hover:underline"
      >
        {label}
      </a>
    </li>
  );
}

export function FooterSection() {
  return (
    <footer
      id="footer"
      className="section-light relative z-10 w-full py-10 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-[7vw] lg:px-12">
        {/* Breadcrumb row — wordmark + tagline. */}
        <div className="flex items-center gap-3 border-b border-black/10 pb-4">
          <img
            src="/cs-logo-color.webp"
            alt={BRAND.name}
            className="h-6 w-auto object-contain"
            draggable={false}
          />
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
              <FooterLink key={s} href="#dolby-atmos" label={s} />
            ))}
          </FooterColumn>

          <FooterColumn heading="More Solutions">
            {MORE_SOLUTIONS.map((s) => (
              <FooterLink key={s} href="#dolby-atmos" label={s} />
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
        <div className="mt-10 border-t border-black/10 pt-5">
          <p className="text-center font-sans text-xs text-ivory-muted">
            Copyright © {new Date().getFullYear()} {BRAND.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
