import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { BRAND } from '@/lib/constants';
import { AmbientAudio } from '@/components/dom/AmbientAudio';
import './globals.css';

/**
 * Typography — Apple system stack.
 * Tailwind's font stacks lead with -apple-system / SF Pro (native on Apple
 * devices); Inter is loaded here as the closest web fallback for everyone
 * else. Both CSS variable hooks point to Inter.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description:
    'Cinesphere offers a huge range of audio and video solutions for every situation, including home theatres, conference & boardroom integration, video/tele-conference studios, e-class rooms, digital signage and training & seminar halls across Chennai.',
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  publisher: BRAND.name,
  keywords: [
    'Cinesphere',
    'audio video solutions Chennai',
    'home theatre solutions',
    'conference and boardroom integration',
    'video conference studios',
    'e-class rooms',
    'digital signage',
    'training and seminar hall AV',
    'auditorium AV Chennai',
    'Focal dealer Chennai',
    'Harman Kardon dealer Chennai',
  ],
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/images/fav-icon.webp', type: 'image/webp' }],
    shortcut: '/images/fav-icon.webp',
    apple: '/images/fav-icon.webp',
  },
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    locale: 'en_IN',
    url: '/',
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description:
      'Finest Audio Artistry. 12 years of audio & video solutions for every situation, across Chennai.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description:
      'Finest Audio Artistry. 12 years of audio & video solutions for every situation, across Chennai.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

/* Site-wide structured data (JSON-LD): Organization + LocalBusiness + WebSite.
   Gives search engines an explicit, machine-readable identity and NAP
   (name / address / phone) for the Chennai studio, links the three entities
   by @id, and makes the business eligible for rich results. Built from BRAND
   so it never drifts from the rest of the site. */
const SEO_DESCRIPTION =
  'Cinesphere designs and installs premium audio-video systems across Chennai, including home theatres, conference & boardroom integration, auditorium and seminar-hall AV, digital signage and multi-room audio.';

const ORG_ID = `${BRAND.url}/#organization`;
const WEBSITE_ID = `${BRAND.url}/#website`;
const BUSINESS_ID = `${BRAND.url}/#localbusiness`;
const LOGO_URL = `${BRAND.url}/images/cinesphere-logo.webp`;

const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: BRAND.address.street,
  addressLocality: BRAND.address.locality,
  addressRegion: BRAND.address.region,
  postalCode: BRAND.address.postalCode,
  addressCountry: BRAND.address.country,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: BRAND.name,
      url: BRAND.url,
      email: BRAND.email,
      telephone: BRAND.phone,
      slogan: BRAND.tagline,
      description: SEO_DESCRIPTION,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
      image: LOGO_URL,
      address: POSTAL_ADDRESS,
      areaServed: { '@type': 'City', name: 'Chennai' },
    },
    {
      '@type': 'LocalBusiness',
      '@id': BUSINESS_ID,
      name: BRAND.name,
      url: BRAND.url,
      email: BRAND.email,
      telephone: BRAND.phone,
      description: SEO_DESCRIPTION,
      image: LOGO_URL,
      priceRange: '₹₹₹',
      address: POSTAL_ADDRESS,
      hasMap: BRAND.maps,
      areaServed: { '@type': 'City', name: 'Chennai' },
      parentOrganization: { '@id': ORG_ID },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: BRAND.url,
      name: BRAND.name,
      description: SEO_DESCRIPTION,
      inLanguage: 'en-IN',
      publisher: { '@id': ORG_ID },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <AmbientAudio />
      </body>
    </html>
  );
}
