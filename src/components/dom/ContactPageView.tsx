'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { FooterSection } from './FooterSection';
import { BRAND } from '@/lib/constants';
import { useExperience } from '@/store/useExperience';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ContactPageView — the dedicated /contact page.
 * ----------------------------------------------
 * A stylistic sibling of the /brands and /clients pages: same hero treatment,
 * blur-rise motion system and champagne palette, with its own signature
 * visual — a smooth SPECTROGRAM-style frequency field: soft glowing frequency
 * bands (bass low, treble high) that undulate and pulse across the whole
 * background. The field is always full and morphs in place rather than
 * scrolling in from one side.
 *
 *   • a hero with the frequency-field canvas + quick contact chips,
 *   • a two-column body: editorial contact details on the left, an animated
 *     contact form on the right (composes a prefilled email on submit),
 *   • the shared footer.
 *
 * Everything reveals on scroll via the shared groupV / itemV system and
 * collapses to nothing under prefers-reduced-motion.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const groupV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemV = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

/* Multicolour sound spectrum — the same palette as the nav, footer and the
   clients mandala, so the contact hero shares the site's audio signature. */
const SPECTRUM_STOPS: [number, number, number][] = [
  [31, 123, 255],
  [25, 200, 255],
  [39, 211, 110],
  [255, 210, 63],
  [255, 122, 47],
  [255, 45, 85],
  [255, 77, 184],
  [31, 123, 255],
];
function spectrumRGB(t: number): [number, number, number] {
  const clamped = ((t % 1) + 1) % 1;
  const seg = clamped * (SPECTRUM_STOPS.length - 1);
  const i = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = SPECTRUM_STOPS[i];
  const b = SPECTRUM_STOPS[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

/* ----------------------------------------------------------------- */
/* Hero visual — drifting frequency field                            */
/* ----------------------------------------------------------------- */

/**
 * FrequencyField — a smooth spectrogram-style energy field. Frequency runs up
 * the Y axis (bass low, treble high); a handful of bands undulate across the
 * width and pulse over time, sitting on a bass floor. The field is computed at
 * low resolution every frame and scaled up with bilinear smoothing, so it
 * reads as soft glowing frequency bands. It is always full and morphs in
 * place — nothing scrolls in from the side. Coloured by frequency through the
 * audio spectrum; one still frame under reduced motion.
 */
function FrequencyField({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    // Low-res field, scaled up + smoothed for the soft, blurred band look.
    // The inner loop runs a Math.exp per band for every pixel, so the field
    // resolution is by far the dominant cost. Phones / low-core / data-saver
    // machines get a coarser grid — the heavy upscale-and-smooth that follows
    // hides the lower resolution, so the look barely changes.
    const nav =
      typeof navigator !== 'undefined'
        ? (navigator as Navigator & {
            connection?: { saveData?: boolean };
            deviceMemory?: number;
          })
        : undefined;
    const lowPower =
      !!nav &&
      ((nav.hardwareConcurrency ?? 8) <= 4 ||
        (nav.deviceMemory ?? 8) <= 4 ||
        nav.connection?.saveData === true ||
        (typeof window !== 'undefined' && window.innerWidth < 768));
    const LW = lowPower ? 132 : 190;
    const LH = lowPower ? 76 : 110;
    const buf = document.createElement('canvas');
    buf.width = LW;
    buf.height = LH;
    const bctx = buf.getContext('2d');
    if (!bctx) return;
    const img = bctx.createImageData(LW, LH);
    const data = img.data;

    // Frequency colour per row (depends only on the row), precomputed.
    const rowColor: [number, number, number][] = [];
    for (let cy = 0; cy < LH; cy++) {
      const freq = 1 - cy / (LH - 1);
      rowColor[cy] = spectrumRGB(freq * 0.85 + 0.02);
    }

    // Bands that wave across the width (wx) and over time (ts) and pulse in
    // level (pwx / pts). base = centre pitch, w = band width, gain = loudness.
    const BANDS = [
      { base: 0.16, drift: 0.06, wx: 2.1, ts: 0.5, ph: 0.0, w: 0.07, gain: 0.95, pwx: 1.3, pts: 0.7, pph: 0.0 },
      { base: 0.32, drift: 0.07, wx: 1.6, ts: 0.62, ph: 1.7, w: 0.06, gain: 0.85, pwx: 2.0, pts: 0.5, pph: 1.1 },
      { base: 0.5, drift: 0.06, wx: 2.6, ts: 0.45, ph: 3.1, w: 0.055, gain: 0.78, pwx: 1.5, pts: 0.9, pph: 2.4 },
      { base: 0.68, drift: 0.08, wx: 1.9, ts: 0.7, ph: 4.6, w: 0.05, gain: 0.66, pwx: 2.4, pts: 0.6, pph: 3.8 },
      { base: 0.85, drift: 0.05, wx: 3.0, ts: 0.55, ph: 5.5, w: 0.04, gain: 0.52, pwx: 1.8, pts: 1.0, pph: 0.7 },
    ];
    const denom = BANDS.map((b) => 2 * b.w * b.w);
    const BASS_DENOM = 2 * 0.05 * 0.05;

    const centers = new Float32Array(BANDS.length);
    const pulses = new Float32Array(BANDS.length);

    const compute = (t: number) => {
      for (let cx = 0; cx < LW; cx++) {
        const xn = cx / (LW - 1);
        for (let bi = 0; bi < BANDS.length; bi++) {
          const b = BANDS[bi];
          centers[bi] = b.base + b.drift * Math.sin(xn * b.wx + t * b.ts + b.ph);
          pulses[bi] =
            (0.5 + 0.5 * Math.sin(xn * b.pwx + t * b.pts + b.pph)) * b.gain;
        }
        for (let cy = 0; cy < LH; cy++) {
          const freq = 1 - cy / (LH - 1);
          let amp = 0;
          for (let bi = 0; bi < BANDS.length; bi++) {
            const d = freq - centers[bi];
            amp += pulses[bi] * Math.exp(-(d * d) / denom[bi]);
          }
          const db = freq - 0.04;
          amp += 0.42 * Math.exp(-(db * db) / BASS_DENOM);
          if (amp > 1) amp = 1;
          const k = amp * amp; // gamma — deep blacks, brighter peaks
          const col = rowColor[cy];
          const idx = (cy * LW + cx) * 4;
          data[idx] = (col[0] * k) | 0;
          data[idx + 1] = (col[1] * k) | 0;
          data[idx + 2] = (col[2] * k) | 0;
          data[idx + 3] = 255;
        }
      }
      bctx.putImageData(img, 0, 0);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(buf, 0, 0, W, H); // upscale low-res field → soft bands
    };

    // The field undulates slowly, so a ~30fps cap looks identical to 60 but
    // roughly halves the (heavy, per-pixel Math.exp) compute, leaving the
    // main thread free for smooth scrolling.
    const FRAME_MS = 1000 / 30;
    let lastFrame = 0;
    let running = false;
    let onScreen = true;

    const loop = (nowMs: number) => {
      raf = requestAnimationFrame(loop);
      if (nowMs - lastFrame < FRAME_MS) return;
      lastFrame = nowMs;
      compute(nowMs / 1000);
      render();
    };

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onResize = () => {
      resize();
      if (reducedMotion || !running) {
        compute(0);
        render();
      }
    };

    resize();

    // Only animate while the hero is actually on screen and the tab is
    // visible — scrolling down to the form no longer leaves the field
    // computing thousands of exponentials per frame off-screen.
    const onVisibility = () => {
      if (document.hidden || !onScreen) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (reducedMotion) {
      compute(0);
      render();
    } else {
      start();
    }

    window.addEventListener('resize', onResize);
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}

/* ----------------------------------------------------------------- */
/* Small inline icons                                                */
/* ----------------------------------------------------------------- */

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V20a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const INTERESTS = [
  'Home Theatre',
  'Conference & Boardroom',
  'Auditorium / Seminar Hall',
  'Digital Signage / LED Wall',
  'Multi-Room Audio',
  'Something else',
];

const FIELD =
  'mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-sans text-sm text-carbon placeholder:text-[#1d1d1f]/35 transition-colors focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/25';
const LABEL =
  'font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#1d1d1f]/60';

/* ----------------------------------------------------------------- */
/* Themed dropdown — replaces the native <select> so the open list   */
/* matches the site (champagne highlight, not the browser blue).     */
/* ----------------------------------------------------------------- */

function ThemedSelect({
  id,
  value,
  options,
  onChange,
}: {
  id?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  // close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // sync the highlighted row to the current value each time it opens
  useEffect(() => {
    if (open) setActive(Math.max(0, options.indexOf(value)));
  }, [open, value, options]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(options[active]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${FIELD} flex cursor-pointer items-center justify-between text-left ${
          open ? 'border-champagne ring-2 ring-champagne/25' : ''
        }`}
      >
        <span>{value}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`ml-2 flex-none text-[#1d1d1f]/45 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-black/10 bg-white p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
        >
          {options.map((opt, i) => {
            const selected = opt === value;
            const isActive = i === active;
            return (
              <li
                key={opt}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 font-sans text-sm transition-colors ${
                  selected
                    ? 'bg-champagne/15 font-medium text-champagne-deep'
                    : isActive
                      ? 'bg-champagne/10 text-carbon'
                      : 'text-carbon'
                }`}
              >
                {opt}
                {selected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="flex-none text-champagne-deep"
                  >
                    <path
                      d="M5 12.5l4 4 10-10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Page                                                              */
/* ----------------------------------------------------------------- */

export function ContactPageView() {
  // Respect the OS "reduce motion" preference on this standalone route. The
  // homepage wires this through its experience shell, but /contact must set it
  // itself, or reduced-motion users would still get the animated frequency
  // field and reveals.
  useReducedMotion();
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const phoneTel = `tel:${BRAND.phone.replace(/\s/g, '')}`;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: INTERESTS[0],
    message: '',
  });
  const [sent, setSent] = useState(false);

  const update =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Enquiry: ${form.interest}`;
    const body =
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone || '-'}\n` +
      `Interest: ${form.interest}\n\n` +
      `${form.message}`;
    // No backend wired up — compose the message in the visitor's mail client.
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <Navigation />

      <main id="top" className="section-light relative z-10 overflow-hidden">
        {/* ============================ HERO ============================ */}
        <section className="relative flex min-h-[68vh] items-center overflow-hidden bg-black pt-28 md:pt-32">
          <FrequencyField reducedMotion={reducedMotion} />

          {/* top fade so the field doesn't hard-touch the fixed nav */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0) 100%)',
            }}
          />
          {/* left scrim so the copy stays crisp over the field */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 70%)',
            }}
          />

          <div className="relative z-10 w-full px-[7vw]">
            <motion.div
              variants={reducedMotion ? undefined : groupV}
              initial={reducedMotion ? false : 'hidden'}
              animate={reducedMotion ? undefined : 'show'}
              className="max-w-xl"
            >
              <motion.p
                variants={itemV}
                className="font-sans text-sm font-semibold tracking-wide text-champagne"
              >
                Contact
              </motion.p>
              <motion.h1
                variants={itemV}
                className="display mt-4 text-5xl sm:text-6xl md:text-7xl"
                style={{ color: 'var(--ivory)' }}
              >
                Let&apos;s{' '}
                <span className="text-gold text-gold-sweep">talk</span>.
              </motion.h1>
              <motion.p
                variants={itemV}
                className="mt-6 max-w-md font-sans text-base leading-relaxed text-ivory/70 md:text-lg"
              >
                Tell us about your space and how you want it to sound. Our team
                replies within one working day.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ===================== DETAILS + FORM ===================== */}
        <section className="px-[7vw] py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* ---- Left: editorial contact details ---- */}
            <motion.div
              variants={reducedMotion ? undefined : groupV}
              initial={reducedMotion ? false : 'hidden'}
              whileInView={reducedMotion ? undefined : 'show'}
              viewport={{ once: true, margin: '-12%' }}
            >
              <motion.p variants={itemV} className="eyebrow">
                Get in Touch
              </motion.p>
              <motion.h2
                variants={itemV}
                className="display mt-2 text-3xl md:text-4xl"
              >
                Reach the studio.
              </motion.h2>
              <motion.p
                variants={itemV}
                className="mt-4 max-w-md font-sans text-sm leading-relaxed text-ivory-muted md:text-base"
              >
                From a single listening room to a full auditorium, drop by, call
                or write, and we&apos;ll take it from there.
              </motion.p>

              <div className="mt-9 space-y-4">
                {/* Visit */}
                <motion.a
                  variants={itemV}
                  href={BRAND.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_2px_12px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne/50 hover:shadow-[0_16px_40px_-22px_rgba(205,178,133,0.55)]"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-champagne/15 text-champagne-deep">
                    <PinIcon />
                  </span>
                  <span className="min-w-0">
                    <span className={LABEL}>Visit</span>
                    <span className="mt-1 block font-sans text-sm leading-relaxed text-carbon">
                      {BRAND.city}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 font-sans text-xs font-medium text-champagne-deep">
                      Get directions
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </span>
                </motion.a>

                {/* Call */}
                <motion.a
                  variants={itemV}
                  href={phoneTel}
                  className="group flex items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_2px_12px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne/50 hover:shadow-[0_16px_40px_-22px_rgba(205,178,133,0.55)]"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-champagne/15 text-champagne-deep">
                    <PhoneIcon />
                  </span>
                  <span>
                    <span className={LABEL}>Call</span>
                    <span className="mt-1 block font-sans text-sm text-carbon">
                      {BRAND.phone}
                    </span>
                  </span>
                </motion.a>

                {/* Email */}
                <motion.a
                  variants={itemV}
                  href={`mailto:${BRAND.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_2px_12px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne/50 hover:shadow-[0_16px_40px_-22px_rgba(205,178,133,0.55)]"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-champagne/15 text-champagne-deep">
                    <MailIcon />
                  </span>
                  <span>
                    <span className={LABEL}>Email</span>
                    <span className="mt-1 block font-sans text-sm text-carbon">
                      {BRAND.email}
                    </span>
                  </span>
                </motion.a>
              </div>

              <motion.p
                variants={itemV}
                className="mt-6 flex items-center gap-2 font-sans text-xs text-ivory-muted"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-champagne" />
                We reply within one working day.
              </motion.p>
            </motion.div>

            {/* ---- Right: the form ---- */}
            <motion.div
              variants={reducedMotion ? undefined : groupV}
              initial={reducedMotion ? false : 'hidden'}
              whileInView={reducedMotion ? undefined : 'show'}
              viewport={{ once: true, margin: '-12%' }}
              className="relative rounded-[1.75rem] border border-black/[0.07] bg-white p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)] sm:p-8 md:p-10"
            >
              {sent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 text-champagne-deep">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 12.5l4 4 10-10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <h3 className="display mt-5 text-2xl text-carbon">
                    Your message is ready.
                  </h3>
                  <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-ivory-muted">
                    Your mail app should have opened with everything filled in,
                    just hit send. Prefer another way? Reach us directly at{' '}
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="font-medium text-champagne-deep hover:underline"
                    >
                      {BRAND.email}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 font-sans text-sm font-medium text-carbon transition-colors hover:border-champagne hover:text-champagne-deep"
                  >
                    Write another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <motion.div variants={itemV}>
                    <label htmlFor="cf-name" className={LABEL}>
                      Name
                    </label>
                    <input
                      id="cf-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Your full name"
                      className={FIELD}
                    />
                  </motion.div>

                  <motion.div
                    variants={itemV}
                    className="grid gap-5 sm:grid-cols-2"
                  >
                    <div>
                      <label htmlFor="cf-email" className={LABEL}>
                        Email
                      </label>
                      <input
                        id="cf-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={update('email')}
                        placeholder="you@example.com"
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-phone" className={LABEL}>
                        Phone <span className="font-normal normal-case">(optional)</span>
                      </label>
                      <input
                        id="cf-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                          }))
                        }
                        placeholder="10-digit number"
                        className={FIELD}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemV}>
                    <label htmlFor="cf-interest" className={LABEL}>
                      I&apos;m interested in
                    </label>
                    <ThemedSelect
                      id="cf-interest"
                      value={form.interest}
                      options={INTERESTS}
                      onChange={(v) => setForm((f) => ({ ...f, interest: v }))}
                    />
                  </motion.div>

                  <motion.div variants={itemV}>
                    <label htmlFor="cf-message" className={LABEL}>
                      Message
                    </label>
                    <textarea
                      id="cf-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={update('message')}
                      placeholder="Tell us about your room, your goals and your timeline…"
                      className={`${FIELD} resize-none`}
                    />
                  </motion.div>

                  <motion.div variants={itemV} className="pt-1">
                    <button
                      type="submit"
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-champagne-deep px-7 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-champagne sm:w-auto"
                    >
                      Send message
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </button>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <FooterSection />
    </>
  );
}
