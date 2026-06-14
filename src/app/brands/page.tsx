import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { BrandsPageView } from '@/components/dom/BrandsPageView';

/**
 * /brands — dedicated audio-brands route.
 *
 * Server component for per-route metadata; the interactive, sound-themed
 * view (waveforms, equalizers, ripples) lives in the client BrandsPageView.
 */
export const metadata: Metadata = {
  title: `Brands — ${BRAND.name}`,
  description:
    'The audio brands Cinesphere carries — Focal, Bang & Olufsen, JBL Synthesis, Bowers & Wilkins, M&K Sound, Sonus faber, Klipsch and QSC.',
};

export default function BrandsPage() {
  return <BrandsPageView />;
}
