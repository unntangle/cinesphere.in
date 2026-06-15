import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { ClientsPageView } from '@/components/dom/ClientsPageView';

/**
 * /clients — dedicated clients route.
 *
 * Server component for per-route metadata; the interactive, sound-themed
 * view (cymatic standing-wave field, sector showcase, hover reveals) lives in
 * the client ClientsPageView.
 */
export const metadata: Metadata = {
  title: `Our Clients — ${BRAND.name}`,
  description:
    'The organisations Cinesphere has delivered for — Taj, ITC, GRT and Starwood hotels; IIT Madras, University of Madras, VIT and Loyola; Thales, Hexaware, Volvo and Caterpillar; and leading developers across South India.',
  alternates: { canonical: '/clients' },
  openGraph: {
    type: 'website',
    url: '/clients',
    siteName: BRAND.name,
    title: `Our Clients — ${BRAND.name}`,
    description:
      'The organisations Cinesphere has delivered for — Taj, ITC, GRT and Starwood hotels; IIT Madras, University of Madras, VIT and Loyola; Thales, Hexaware, Volvo and Caterpillar; and leading developers across South India.',
  },
};

export default function ClientsPage() {
  return <ClientsPageView />;
}
