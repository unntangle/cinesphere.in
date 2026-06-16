import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { SolutionsPageView } from '@/components/dom/SolutionsPageView';

/**
 * /solutions — dedicated route listing every solution Cinesphere offers
 * on a single, scroll-animated page.
 *
 * Server component for per-route metadata; the interactive view lives in
 * the client SolutionsPageView. Section ids are shared with the nav
 * "Our Solutions" dropdown via solutionSlug(), so the menu deep-links here.
 */
export const metadata: Metadata = {
  title: `Solutions · ${BRAND.name}`,
  description:
    'Cinesphere audio-visual solutions: AV display, conference & boardroom studios, e-class rooms & seminar halls, home theatre, multi-room audio, auditoriums, digital signage & LED video walls, intelligent automation & stage lighting, and surveillance.',
  alternates: { canonical: '/solutions' },
  openGraph: {
    type: 'website',
    url: '/solutions',
    siteName: BRAND.name,
    title: `Solutions · ${BRAND.name}`,
    description:
      'End-to-end audio-visual solutions, designed, installed and calibrated by Cinesphere.',
  },
};

export default function SolutionsPage() {
  return <SolutionsPageView />;
}
