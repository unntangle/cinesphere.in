/**
 * Shared roster of the audio brands Cinesphere carries.
 *
 * Single source of truth used by BOTH the nav "Brands" dropdown
 * (Navigation.tsx) and the dedicated /brands page (BrandsPageView.tsx),
 * so the two never drift.
 *
 * - `chip`   logo backdrop: 'light' for dark/coloured marks, 'dark' for
 *            light/white marks (keeps every logo legible).
 * - `filter` optional Tailwind filter classes applied to the logo image.
 * - `code`   short country code used for the /brands grid watermark + filter.
 * - The & in some filenames is URL-encoded as %26 so the paths resolve.
 */
export interface Brand {
  name: string;
  logo: string;
  chip: 'light' | 'dark';
  filter?: string;
  /** Optional logo sizing override (Tailwind max-h / max-w) for the brands grid. */
  imgClass?: string;
  /** Country of origin — shown on the brands page. */
  origin: string;
  /** Short country code (e.g. 'FR') — grid watermark + filter. */
  code: string;
  /** One-line description — shown on the brands page. */
  blurb: string;
  /** Optional partnership tag (e.g. "Certified Partner"). */
  tag?: string;
  /** Highlighted as the lead partner. */
  featured?: boolean;
}

export const BRANDS: Brand[] = [
  {
    name: 'Focal',
    logo: '/images/focal-logo.webp',
    chip: 'dark',
    filter: 'brightness-[0.98] sepia-[0.85] saturate-[1.4]',
    origin: 'France',
    code: 'FR',
    blurb:
      'Reference-grade loudspeakers, handcrafted in Saint-Étienne for cinema and high-fidelity listening.',
    tag: 'Certified Partner',
    featured: true,
  },
  {
    name: 'Bang & Olufsen',
    logo: '/brands/bo.webp',
    chip: 'light',
    origin: 'Denmark',
    code: 'DK',
    blurb: 'Iconic Scandinavian design and sculptural, room-filling sound.',
  },
  {
    name: 'JBL Synthesis',
    logo: '/brands/jbl.webp',
    chip: 'light',
    imgClass: 'max-h-[72%] max-w-[86%]',
    origin: 'United States',
    code: 'US',
    blurb:
      'Cinema-grade home-theatre systems engineered for true reference playback.',
  },
  {
    name: 'Harman Kardon',
    logo: '/images/Harman_kardon_Logo.webp',
    chip: 'light',
    filter: 'brightness-0',
    origin: 'United States',
    code: 'US',
    blurb:
      'Premium American audio, pioneering high-fidelity design since 1953.',
  },
  {
    name: 'Bowers & Wilkins',
    logo: '/brands/bw.webp',
    chip: 'light',
    imgClass: 'max-h-[72%] max-w-[86%]',
    origin: 'United Kingdom',
    code: 'UK',
    blurb:
      'British acoustic engineering, the monitors trusted at Abbey Road Studios.',
  },
  {
    name: 'M&K Sound',
    logo: '/brands/mk.webp',
    chip: 'light',
    imgClass: 'max-h-[72%] max-w-[86%]',
    origin: 'United States',
    code: 'US',
    blurb: 'Studio-reference monitors and subwoofers built for mastering rooms.',
  },
  {
    name: 'Sonus faber',
    logo: '/brands/sonus-faber.webp',
    chip: 'light',
    origin: 'Italy',
    code: 'IT',
    blurb: 'Hand-built Italian loudspeakers, instruments crafted in Vicenza.',
  },
  {
    name: 'Klipsch',
    logo: '/brands/klipsch.webp',
    chip: 'light',
    origin: 'United States',
    code: 'US',
    blurb: 'Legendary horn-loaded efficiency and dynamics since 1946.',
  },
  {
    name: 'Barco',
    logo: '/brands/barco.webp',
    chip: 'light',
    origin: 'Belgium',
    code: 'BE',
    blurb:
      'Belgian projection engineering for reference-grade cinema and large-venue imagery.',
  },
  {
    name: 'Christie',
    logo: '/brands/christie.webp',
    chip: 'light',
    origin: 'United States',
    code: 'US',
    blurb:
      'Cinema-grade projection trusted in theatres and premium screening rooms worldwide.',
  },
  {
    name: 'Bose',
    logo: '/brands/bose.webp',
    chip: 'light',
    origin: 'United States',
    code: 'US',
    blurb:
      'American audio pioneer, known for research-driven sound and acoustic innovation.',
  },
  {
    // White logo — inverted so it renders dark on the light roster cards.
    name: 'Denon',
    logo: '/brands/denon.webp',
    chip: 'light',
    filter: 'invert',
    origin: 'Japan',
    code: 'JP',
    blurb:
      'Japanese hi-fi heritage in AV receivers and source components since 1910.',
  },
  {
    name: 'Marantz',
    logo: '/brands/marantz.webp',
    chip: 'light',
    origin: 'United States',
    code: 'US',
    blurb:
      'Premium AV receivers and amplifiers, voiced for musicality and craftsmanship.',
  },
  {
    name: 'Optimal Audio',
    logo: '/brands/optimalaudio.webp',
    chip: 'light',
    origin: 'United Kingdom',
    code: 'UK',
    blurb:
      'British commercial audio for hospitality, with effortless zoned sound and control.',
  },
  {
    // White logo — inverted so it renders dark on the light roster cards.
    name: 'Revel',
    logo: '/brands/revel.webp',
    chip: 'light',
    filter: 'invert',
    origin: 'United States',
    code: 'US',
    blurb:
      'American reference loudspeakers engineered through exhaustive blind-listening research.',
  },
  {
    name: 'QSC',
    logo: '/brands/qsc.webp',
    chip: 'light',
    origin: 'United States',
    code: 'US',
    blurb:
      'American professional audio — amplifiers and loudspeakers for cinema and live sound.',
  },
  {
    name: 'Arcam',
    logo: '/brands/arcam.webp',
    chip: 'light',
    origin: 'United Kingdom',
    code: 'UK',
    blurb:
      'British hi-fi specialists in precision amplification and home-cinema electronics.',
  },
  {
    name: 'BenQ',
    logo: '/brands/Benq.webp',
    chip: 'light',
    origin: 'Taiwan',
    code: 'TW',
    blurb:
      'Taiwanese projection and display technology for home cinema and gaming.',
  },
  {
    name: 'Epson',
    logo: '/brands/epson.webp',
    chip: 'light',
    origin: 'Japan',
    code: 'JP',
    blurb:
      'Japanese projection technology delivering bright, colour-accurate cinema images.',
  },
  {
    name: 'Sony',
    logo: '/brands/sony.webp',
    chip: 'light',
    origin: 'Japan',
    code: 'JP',
    blurb:
      'Japanese electronics leader — flagship projectors and reference home-cinema technology.',
  },
];
