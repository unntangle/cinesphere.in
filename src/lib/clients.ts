/**
 * Shared roster of the organisations Cinesphere has delivered for.
 *
 * Single source of truth for the dedicated /clients page (ClientsPageView).
 * Logos are the WebP files in /public/clients-logo, produced from the source
 * PNG/JPG art by scripts/convert-logos.mjs. To add a client: drop its logo in
 * /public/clients-logo, re-run the script, and add an entry below under the
 * right sector.
 *
 * Mirrors the data shape used by the homepage ClientsMarqueeSection so the two
 * never drift — including the special-case `bg`/`fit` handling for logos that
 * ship with a baked-in colour panel (e.g. Taj, The Residency).
 *
 * - `bg`   optional card background — set to match a logo that has a baked-in
 *          colour panel, so the card fills with that colour instead of white.
 * - `fit`  object-fit for a `bg` (filled) card: 'cover' fills edge-to-edge
 *          (may crop the panel), 'contain' shows the whole logo centred on
 *          `bg` (no crop). Defaults to 'cover'.
 */

export type ClientSector =
  | 'Hospitality'
  | 'Education'
  | 'Corporate & Industry'
  | 'Real Estate & Lifestyle';

export interface Client {
  name: string;
  /** Path under /public — every client here ships a logo. */
  logo: string;
  /** Which showcase sector the client belongs to. */
  sector: ClientSector;
  /** Optional baked-in colour panel background. */
  bg?: string;
  /** Object-fit for a filled (`bg`) card. Defaults to 'cover'. */
  fit?: 'cover' | 'contain';
}

const c = (file: string) => `/clients-logo/${file}`;

export const CLIENTS: Client[] = [
  // ---- Hospitality -------------------------------------------------
  { name: 'Taj', logo: c('taj.webp'), sector: 'Hospitality', bg: '#ab9054' },
  { name: 'ITC Hotels', logo: c('itc_hotels.webp'), sector: 'Hospitality' },
  { name: 'GRT Hotels', logo: c('grt-hotels.webp'), sector: 'Hospitality' },
  { name: 'Starwood Hotels & Resorts', logo: c('starwood.webp'), sector: 'Hospitality' },
  { name: 'The Savera', logo: c('the-savera.webp'), sector: 'Hospitality' },
  { name: 'The Residency', logo: c('the-residency.webp'), sector: 'Hospitality', bg: '#4b1133', fit: 'contain' },
  { name: 'The Posh', logo: c('the-posh.webp'), sector: 'Hospitality' },

  // ---- Education ---------------------------------------------------
  { name: 'IIT Madras', logo: c('IIT-madras.webp'), sector: 'Education' },
  { name: 'University of Madras', logo: c('madras-university.webp'), sector: 'Education' },
  { name: 'Indian Maritime University', logo: c('IMU_Logo.webp'), sector: 'Education' },
  { name: 'VIT', logo: c('VIT.webp'), sector: 'Education' },
  { name: 'VELS', logo: c('vels.webp'), sector: 'Education' },
  { name: 'Meenakshi University', logo: c('meenakshi-university.webp'), sector: 'Education' },
  { name: 'Loyola College', logo: c('loyola-college.webp'), sector: 'Education' },
  { name: 'Cauvery College', logo: c('cauvery-college.webp'), sector: 'Education' },
  { name: 'Jeppiaar', logo: c('jeppiaar.webp'), sector: 'Education' },
  { name: 'JEC', logo: c('JEC.webp'), sector: 'Education' },
  { name: 'Tagore Group', logo: c('tagore-groups.webp'), sector: 'Education' },

  // ---- Corporate & Industry ---------------------------------------
  { name: 'Thales', logo: c('thales.webp'), sector: 'Corporate & Industry' },
  { name: 'Hexaware Technologies', logo: c('hexaware-technologies.webp'), sector: 'Corporate & Industry' },
  { name: 'Volvo', logo: c('volvo.webp'), sector: 'Corporate & Industry' },
  { name: 'CAT', logo: c('CAT-logo.webp'), sector: 'Corporate & Industry' },

  // ---- Real Estate & Lifestyle ------------------------------------
  { name: 'Akshaya', logo: c('akshaya.webp'), sector: 'Real Estate & Lifestyle' },
  { name: 'Amarprakash', logo: c('amarprakash.webp'), sector: 'Real Estate & Lifestyle' },
  { name: 'A² Square', logo: c('a-square.webp'), sector: 'Real Estate & Lifestyle' },
  { name: 'VGP', logo: c('vgp.webp'), sector: 'Real Estate & Lifestyle' },
  { name: 'Auryaj', logo: c('auryaj.webp'), sector: 'Real Estate & Lifestyle' },
];

/** Ordered sectors with a one-line editorial descriptor for the showcase. */
export const CLIENT_SECTORS: {
  name: ClientSector;
  blurb: string;
}[] = [
  {
    name: 'Hospitality',
    blurb:
      'Lobbies, banquet halls and suites tuned for hotels and resorts where every guest impression counts.',
  },
  {
    name: 'Education',
    blurb:
      'E-class rooms, auditoriums and seminar halls built for the leading universities and colleges of the South.',
  },
  {
    name: 'Corporate & Industry',
    blurb:
      'Boardrooms, conference studios and signage for global enterprises and industrial campuses.',
  },
  {
    name: 'Real Estate & Lifestyle',
    blurb:
      'Show homes, clubhouses and experience centres for developers and lifestyle destinations.',
  },
];

/** Convenience: clients belonging to a given sector, in roster order. */
export function clientsInSector(sector: ClientSector): Client[] {
  return CLIENTS.filter((client) => client.sector === sector);
}
