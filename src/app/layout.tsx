import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { BRAND } from '@/lib/constants';
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
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    'Cinesphere offers a huge range of audio and video solutions for every situation — home theatres, conference & boardroom integration, video/tele-conference studios, e-class rooms, digital signage and training & seminar halls across Chennai.',
  keywords: [
    'Cinesphere',
    'audio video solutions Chennai',
    'home theatre solutions',
    'conference and boardroom integration',
    'video conference studios',
    'e-class rooms',
    'digital signage',
    'training and seminar hall AV',
  ],
  metadataBase: new URL('https://cinesphere.in'),
  icons: {
    icon: [{ url: '/images/fav-icon.webp', type: 'image/webp' }],
    shortcut: '/images/fav-icon.webp',
    apple: '/images/fav-icon.webp',
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      'Finest Audio Artistry — 12 years of audio & video solutions for every situation.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
