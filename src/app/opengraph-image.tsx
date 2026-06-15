import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/constants';

/**
 * Default social share card (Open Graph + Twitter), generated at the edge as
 * a 1200×630 PNG. Next.js auto-injects this as og:image / twitter:image for
 * every route that doesn't define its own, so links unfurl with a branded
 * card instead of a bare URL. Uses the built-in font shipped with next/og, so
 * there is nothing extra to fetch.
 */
export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage:
            'radial-gradient(circle at 78% 28%, rgba(205,178,133,0.20), transparent 55%)',
          padding: '90px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            letterSpacing: 8,
            color: '#cdb285',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {BRAND.tagline}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 156,
            fontWeight: 700,
            color: '#f5f5f7',
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {BRAND.name}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 30,
            width: 230,
            height: 6,
            borderRadius: 999,
            backgroundColor: '#cdb285',
          }}
        />
        <div
          style={{
            display: 'flex',
            marginTop: 42,
            fontSize: 34,
            color: 'rgba(245,245,247,0.72)',
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          Home Theatre · Conference & Boardroom · Auditorium AV · Digital
          Signage — Chennai
        </div>
      </div>
    ),
    { ...size },
  );
}
