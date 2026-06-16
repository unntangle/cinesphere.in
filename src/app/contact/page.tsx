import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { ContactPageView } from '@/components/dom/ContactPageView';

/**
 * /contact — dedicated contact route.
 *
 * Server component for per-route metadata; the interactive view (signal-network
 * hero, animated form, contact details) lives in the client ContactPageView.
 */
export const metadata: Metadata = {
  title: `Contact · ${BRAND.name}`,
  description: `Get in touch with Cinesphere: call ${BRAND.phone}, email ${BRAND.email}, or send us a message about your audio-visual project in Chennai.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    url: '/contact',
    siteName: BRAND.name,
    title: `Contact · ${BRAND.name}`,
    description: `Get in touch with Cinesphere: call ${BRAND.phone}, email ${BRAND.email}, or send us a message about your audio-visual project in Chennai.`,
  },
};

export default function ContactPage() {
  return <ContactPageView />;
}
