'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * AmbientAudio — site-wide background music with a branded "Enter" intro and a
 * floating volume toggle in the bottom-right corner.
 * --------------------------------------------------------------------------
 * Browsers forbid audible autoplay before the first interaction, so entering
 * the site IS that interaction: the visitor clicks "Enter Experience" and the
 * music begins with sound. On that click the intro's rainbow spectrum (a copy
 * of the header's NavWave) performs a measured FLIP — it glides up and scales
 * down to land exactly on the header spectrum (#cs-nav-spectrum) while the dark
 * curtain dissolves, so the equalizer appears to fly seamlessly into the nav.
 *
 * Source file: /public/site-bg-audio.mp3
 */

const SRC = '/site-bg-audio.mp3';
const TARGET_VOL = 0.6;
const FADE_MS = 800;
const INTRO_SCALE = 1.7; // how large the spectrum sits in the intro
const FLY_MS = 950; // duration of the fly-to-header move

/* ----------------------------------------------------------------------- */
/* Spectrum bars — identical generation to the header's NavWave, so the     */
/* intro wave and the nav wave are pixel-for-pixel the same (perfect land).  */
/* ----------------------------------------------------------------------- */
const SPECTRUM_BARS = 64;
const SPECTRUM_STOPS = [
  '#1f7bff',
  '#19c8ff',
  '#27d36e',
  '#ffd23f',
  '#ff7a2f',
  '#ff2d55',
  '#ff4db8',
];
function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function spectrumColor(t: number) {
  const seg = t * (SPECTRUM_STOPS.length - 1);
  const i = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = hexToRgb(SPECTRUM_STOPS[i]);
  const b = hexToRgb(SPECTRUM_STOPS[i + 1]);
  const ch = (k: 'r' | 'g' | 'b') => Math.round(a[k] + (b[k] - a[k]) * f);
  return `rgb(${ch('r')}, ${ch('g')}, ${ch('b')})`;
}
const SPECTRUM = Array.from({ length: SPECTRUM_BARS }, (_, i) => {
  const t = i / (SPECTRUM_BARS - 1);
  const env = Math.exp(-(((t - 0.42) / 0.34) ** 2));
  const spike = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + 0.6));
  return {
    color: spectrumColor(t),
    height: 2 + 13 * env * spike,
    delay: (i / SPECTRUM_BARS) * 1.1,
    duration: 0.8 + (i % 5) * 0.13,
  };
});

/** The spectrum visual — same markup/size as the header NavWave. */
function Spectrum() {
  return (
    <span className="relative block h-6 w-[120px] sm:h-8 sm:w-[240px] md:w-[300px] xl:w-[280px]">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,#1f7bff,#27d36e,#ffd23f,#ff7a2f,#ff4db8)] opacity-30 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]" />
      <span className="absolute inset-0 flex items-center justify-between">
        {SPECTRUM.map((bar, i) => (
          <span
            key={i}
            className="soundbar w-[1.5px] rounded-full sm:w-[2px] md:w-[3px]"
            style={{
              height: `${bar.height.toFixed(3)}px`,
              backgroundColor: bar.color,
              animationDelay: `${bar.delay.toFixed(3)}s`,
              animationDuration: `${bar.duration.toFixed(3)}s`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

export function AmbientAudio() {
  const [on, setOn] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [entering, setEntering] = useState(false); // intro is animating out
  const [bgOut, setBgOut] = useState(false); // black curtain fading
  const [waveOut, setWaveOut] = useState(false); // flying wave crossfading out
  const [flyTransform, setFlyTransform] = useState(
    `translate(0px,0px) scale(${INTRO_SCALE})`,
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const waveWrapRef = useRef<HTMLDivElement | null>(null);
  const audibleRef = useRef(false);

  const clearFade = useCallback(() => {
    if (fadeRef.current != null) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const fadeTo = useCallback(
    (target: number, onDone?: () => void) => {
      const audio = audioRef.current;
      if (!audio) return;
      clearFade();
      const start = audio.volume;
      const startT = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - startT) / FADE_MS);
        const v = start + (target - start) * t;
        audio.volume = v < 0 ? 0 : v > 1 ? 1 : v; // clamp to [0,1]
        if (t < 1) fadeRef.current = requestAnimationFrame(step);
        else {
          fadeRef.current = null;
          onDone?.();
        }
      };
      fadeRef.current = requestAnimationFrame(step);
    },
    [clearFade],
  );

  const goAudible = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = false;
    void a.play().catch((err) => console.warn('Audio play failed:', err));
    audibleRef.current = true;
    fadeTo(TARGET_VOL);
  }, [fadeTo]);

  const goSilent = useCallback(() => {
    fadeTo(0, () => audioRef.current?.pause());
  }, [fadeTo]);

  /* Build + prime a silent loop on load. */
  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    a.muted = true;
    audioRef.current = a;
    a.addEventListener('error', () =>
      console.warn('Background audio failed to load:', SRC, a.error),
    );
    void a.play().catch(() => {});
    return () => {
      clearFade();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [clearFade]);

  /* Lock page scroll while the intro is up — removes the scrollbar so the
     centered content sits at the true horizontal centre (not nudged left). */
  useEffect(() => {
    if (!showIntro) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [showIntro]);

  /* Enter: start sound + fly the spectrum up onto the header. */
  const enterWithSound = useCallback(() => {
    goAudible();
    setOn(true);

    // Measured FLIP from the intro spectrum to the header spectrum.
    let transform = `translate(0px,-120px) scale(${INTRO_SCALE * 0.5})`;
    const wrap = waveWrapRef.current;
    if (wrap) {
      const src = wrap.getBoundingClientRect();
      const srcCx = src.left + src.width / 2;
      const srcCy = src.top + src.height / 2;
      const tgtEl = document.getElementById('cs-nav-spectrum');
      const tgt = tgtEl?.getBoundingClientRect();
      if (tgt && tgt.width > 2) {
        const tgtCx = tgt.left + tgt.width / 2;
        const tgtCy = tgt.top + tgt.height / 2;
        const dx = tgtCx - srcCx;
        const dy = tgtCy - srcCy;
        const finalScale = INTRO_SCALE * (tgt.width / src.width);
        transform = `translate(${dx}px,${dy}px) scale(${finalScale})`;
      } else {
        // Header spectrum hidden at this width — glide up toward the bar.
        const dy = -(srcCy - 56);
        transform = `translate(0px,${dy}px) scale(${INTRO_SCALE * 0.45})`;
      }
    }

    setFlyTransform(transform);
    setEntering(true);
    // Near the end of the flight, dissolve the curtain + crossfade the wave.
    window.setTimeout(() => {
      setBgOut(true);
      setWaveOut(true);
    }, FLY_MS - 130);
    window.setTimeout(() => setShowIntro(false), FLY_MS + 360);
  }, [goAudible]);

  /* Floating button: turn sound on / off after entering. */
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (on) {
      if (!audibleRef.current) {
        goAudible();
        return;
      }
      setOn(false);
      goSilent();
    } else {
      setOn(true);
      goAudible();
    }
  }, [on, goAudible, goSilent]);

  return (
    <>
      {/* ===================== INTRO / ENTER SCREEN ===================== */}
      {showIntro && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enter Cinesphere"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center text-center"
        >
          {/* black curtain (dissolves as the wave lands) */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-[460ms] ease-out ${
              bgOut ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* champagne glow */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              bgOut ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(205,178,133,0.18), transparent 60%)',
            }}
          />

          {/* logo (the nav's original colour logo) — fades/slides out on enter */}
          <div
            className={`relative transition-all duration-300 ease-out ${
              entering ? '-translate-y-3 opacity-0' : 'opacity-100'
            }`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[280px] max-w-[72vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(205,178,133,0.32), transparent 70%)',
              }}
            />
            <img
              src="/images/cinesphere-logo.webp"
              alt="Cinesphere"
              draggable={false}
              className="relative h-14 w-auto object-contain sm:h-16"
            />
          </div>
          <p
            className={`relative mt-6 font-sans text-xs uppercase tracking-[0.32em] text-champagne/80 transition-all duration-300 ease-out sm:text-sm ${
              entering ? '-translate-y-3 opacity-0' : 'opacity-100'
            }`}
          >
            Finest Audio Artistry
          </p>

          {/* the spectrum — flies up to the header on enter */}
          <div
            ref={waveWrapRef}
            aria-hidden
            className="relative mt-9"
            style={{
              transform: flyTransform,
              transformOrigin: 'center center',
              opacity: waveOut ? 0 : 1,
              transition: entering
                ? `transform ${FLY_MS}ms cubic-bezier(0.16,1,0.3,1), opacity 260ms linear`
                : 'opacity 260ms linear',
              willChange: 'transform, opacity',
            }}
          >
            <Spectrum />
          </div>

          {/* Enter button — animated gold-gradient ring, live mini equalizer,
              sliding arrow, gold bloom on hover. The wrapper gives it a slow
              zoom-in / zoom-out pulse (fades out on enter). */}
          <div
            className="mt-10"
            style={{ animation: 'ctaZoom 3s ease-in-out infinite' }}
          >
            <style>{`@keyframes ctaZoom{0%,100%{transform:scale(1)}50%{transform:scale(1.065)}}`}</style>
            <button
              type="button"
              onClick={enterWithSound}
              disabled={entering}
              aria-label="Enter Experience"
              className={`group relative animate-gold-shift rounded-full bg-[linear-gradient(110deg,#9a7f54,#cdb285,#eedcb5,#cdb285,#9a7f54)] bg-[length:200%_auto] p-[1.4px] transition-all duration-500 hover:scale-[1.04] hover:shadow-gold ${
                entering ? 'pointer-events-none translate-y-2 opacity-0' : 'opacity-100'
              }`}
            >
              {/* soft gold bloom on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle, rgba(205,178,133,0.45), transparent 70%)',
              }}
            />
            <span className="relative flex items-center gap-2.5 rounded-full bg-[#0b0b0d] px-5 py-2.5">
              {/* live mini equalizer */}
              <span aria-hidden className="flex h-3 items-end gap-[2px]">
                {[5, 9, 7, 11, 8].map((h, i) => (
                  <span
                    key={i}
                    className="eq-bar w-[2px] rounded-full bg-champagne"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 0.13}s`,
                      animationDuration: `${0.9 + (i % 3) * 0.18}s`,
                    }}
                  />
                ))}
              </span>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ivory">
                Enter Experience
              </span>
              <span
                aria-hidden
                className="text-champagne transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </button>
          </div>
        </div>
      )}

      {/* ===================== FLOATING VOLUME TOGGLE ===================== */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'Mute background music' : 'Play background music'}
        title={on ? 'Music on — click to mute' : 'Play background music'}
        className={`group fixed bottom-5 right-5 z-[9999] flex h-10 w-10 items-center justify-center rounded-full border bg-piano-700/90 backdrop-blur transition-all duration-300 hover:scale-105 sm:bottom-6 sm:right-6 sm:h-11 sm:w-11 ${
          on
            ? 'border-champagne/70 text-champagne shadow-gold'
            : 'border-white/25 text-ivory shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7)] hover:border-champagne/70 hover:text-champagne'
        }`}
      >
        {on && (
          <>
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full ring-1 ring-champagne/40 motion-reduce:hidden" />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-champagne/20" />
          </>
        )}

        {on ? (
          <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
            <path
              d="M16 8.8a4.5 4.5 0 0 1 0 6.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M18.8 6a8.5 8.5 0 0 1 0 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
            <path
              d="M17 9.5l5 5M22 9.5l-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}
