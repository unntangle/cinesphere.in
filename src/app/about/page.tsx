import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { AboutPageView } from '@/components/dom/AboutPageView';

/**
 * /about — dedicated About route.
 *
 * Server component for per-route metadata; the cinematic, scroll-driven
 * story (scroll-scrubbed hero film, manifesto, self-drawing process timeline,
 * value cards, partner credentials) lives in the client AboutPageView.
 */
export const metadata: Metadata = {
  title: `About Us · ${BRAND.name}`,
  description:
    'Cinesphere is a Chennai studio for finest audio artistry, 12+ years designing, installing and calibrating premium audio-video systems for home theatres, boardrooms, auditoriums, e-class rooms and studios. Certified Focal Partner and Harman Kardon Authorized Dealer.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: '/about',
    siteName: BRAND.name,
    title: `About Us · ${BRAND.name}`,
    description:
      'A Chennai studio for finest audio artistry, 12+ years of premium audio-video design, installation and calibration. Certified Focal Partner and Harman Kardon Authorized Dealer.',
  },
};

export default function AboutPage() {
  return <AboutPageView />;
}
