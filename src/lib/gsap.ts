'use client';

/**
 * Centralized GSAP + ScrollTrigger registration.
 * Import { gsap, ScrollTrigger } from here everywhere so the plugin is
 * only registered once and never on the server.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
