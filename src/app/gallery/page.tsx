import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { GalleryPageView } from '@/components/dom/GalleryPageView';

/**
 * /gallery — dedicated full gallery route.
 *
 * Server component so it can own per-route metadata; the interactive view
 * (nav, hover effects) lives in the client GalleryPageView component.
 */
export const metadata: Metadata = {
  title: `Gallery — ${BRAND.name}`,
  description:
    'Browse Cinesphere project photography — auditoriums, home theatres, seminar halls and studios delivered across Chennai.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    type: 'website',
    url: '/gallery',
    siteName: BRAND.name,
    title: `Gallery — ${BRAND.name}`,
    description:
      'Browse Cinesphere project photography — auditoriums, home theatres, seminar halls and studios delivered across Chennai.',
  },
};

export default function GalleryPage() {
  return <GalleryPageView />;
}
