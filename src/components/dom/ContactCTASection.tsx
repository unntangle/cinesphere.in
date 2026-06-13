'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants';

/**
 * ContactCTASection — "Get in Touch"
 * -----------------------------------
 * A cinematic contact banner: glowing light-ring visual on the left
 * (waves.webp, warm-graded into the gold theme), and a minimal
 * underline-style enquiry form on the right — Full Name, Email,
 * +91 Phone, Location — with a ghost SUBMIT pill.
 *
 * Submission currently opens the user's mail client pre-filled to
 * BRAND.email (no backend required); swap handleSubmit for an API
 * call when a backend/route is ready.
 */

const inputClasses =
  'w-full border-b border-white/15 bg-transparent pb-3 pt-2 font-sans text-base text-ivory placeholder:text-ivory-faint focus:border-champagne focus:outline-none transition-colors';

export function ContactCTASection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Enquiry from Cinesphere website');
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: +91 ${form.phone}\nLocation: ${form.location}`,
    );
    window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="relative z-10 w-full overflow-hidden bg-piano py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-[7vw] md:grid-cols-2 md:gap-10 lg:px-12">
        {/* Visual — glowing rings, warm-graded; champagne wash behind. */}
        <div className="relative hidden md:block">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(205,178,133,0.14),transparent_65%)]"
          />
          <img
            src="/images/waves.webp"
            alt=""
            aria-hidden
            className="relative w-full rounded-3xl object-cover brightness-[0.9] sepia-[0.45] saturate-[1.5] hue-rotate-[-12deg]"
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* The form. */}
        <div>
          <h2 className="display text-4xl text-ivory md:text-5xl">
            Get in <span className="text-gold">Touch</span>
          </h2>

          <form onSubmit={handleSubmit} className="mt-10 space-y-9 md:mt-12">
            <div>
              <label htmlFor="cta-name" className="sr-only">
                Full Name
              </label>
              <input
                id="cta-name"
                type="text"
                required
                placeholder="Full Name*"
                value={form.name}
                onChange={update('name')}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="cta-email" className="sr-only">
                Email Address
              </label>
              <input
                id="cta-email"
                type="email"
                required
                placeholder="Email Address*"
                value={form.email}
                onChange={update('email')}
                className={inputClasses}
              />
            </div>

            <div className="flex items-end gap-4">
              <span className="border-b border-white/15 pb-3 pt-2 font-sans text-base text-ivory-muted">
                +91
              </span>
              <div className="flex-1 border-l border-white/15 pl-4">
                <label htmlFor="cta-phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="cta-phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9 ]{10,12}"
                  placeholder="Phone Number*"
                  value={form.phone}
                  onChange={update('phone')}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cta-location" className="sr-only">
                Location
              </label>
              <input
                id="cta-location"
                type="text"
                required
                placeholder="Location*"
                value={form.location}
                onChange={update('location')}
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              className="rounded-xl border border-white/30 px-9 py-4 font-sans text-sm font-medium tracking-wide text-ivory transition-colors hover:border-champagne hover:bg-champagne-deep hover:text-white"
            >
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
