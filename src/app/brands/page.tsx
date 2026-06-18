import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { BrandsPageView } from '@/components/dom/BrandsPageView';

/**
 * /brands — dedicated audio-brands route.
 *
 * Server component for per-route metadata; the interactive, sound-themed
 * view (waveforms, equalizers, ripples) lives in the client BrandsPageView.
 */
const BRANDS_DESCRIPTION =
  'The premium audio, home-cinema and projection brands Cinesphere carries — including Focal, Bowers & Wilkins, Sonus faber, Bang & Olufsen, JBL Synthesis, Denon, Marantz, Revel, Sony, Barco, Christie and more.';

export const metadata: Metadata = {
  title: `Brands · ${BRAND.name}`,
  description: BRANDS_DESCRIPTION,
  alternates: { canonical: '/brands' },
  openGraph: {
    type: 'website',
    url: '/brands',
    siteName: BRAND.name,
    title: `Brands · ${BRAND.name}`,
    description: BRANDS_DESCRIPTION,
  },
};

export default function BrandsPage() {
  return <BrandsPageView />;
}
