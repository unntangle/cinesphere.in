/**
 * OLI AV Tech — single source of truth for "Finest Audio Artistry".
 *
 * The whole site is one continuous scroll. Each scene owns a slice of
 * scroll progress (0 → 1). The DOM overlay reads `copy` to render text,
 * the canvas reads `index` to decide which 3D scene is active, and the
 * camera rig interpolates between `camera` keyframes.
 *
 * Scroll progress is normalized: scene N is active while
 * progress ∈ [N/SCENE_COUNT, (N+1)/SCENE_COUNT].
 */

export type Vec3 = [number, number, number];

export interface SceneCopy {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SceneDef {
  id: string;
  index: number;
  /** Internal label for the storyboard / dev tooling. */
  label: string;
  copy: SceneCopy;
  /** Camera keyframe at the START of this scene's scroll range. */
  camera: { position: Vec3; lookAt: Vec3 };
  /** Accent intensity 0–1, used to drive bloom / lighting moods. */
  mood: number;
  /**
   * Apple-style section theme: 'dark' sections are transparent over the
   * WebGL canvas (immersive); 'light' sections render as solid #f5f5f7
   * editorial panels, like the white chapters on apple.com product pages.
   */
  theme?: 'dark' | 'light';
}

export const SCENES: SceneDef[] = [
  {
    id: 'birth-of-sound',
    index: 0,
    label: 'Scene 01 — Welcome / 12 Years of Experience',
    copy: {
      eyebrow: 'Welcome to Cinesphere',
      title: '12 Years of\nExperience.',
      body: 'We offer a huge range of audio and video solutions for every situation.',
      align: 'center',
    },
    camera: { position: [0, 0, 6], lookAt: [0, 0, 0] },
    mood: 0.4,
  },
  {
    id: 'home-theatre',
    index: 1,
    label: 'Scene 02 — About Us',
    copy: {
      eyebrow: 'About Us',
      title: 'Welcome to Cinesphere',
      body: 'Premium audio and video solutions for homes and businesses. Advanced technology, innovative design, unparalleled service. Trusted by 100+ clients.',
      align: 'left',
    },
    camera: { position: [0, 1.4, 10], lookAt: [0, 1, 0] },
    mood: 0.5,
  },
  {
    id: 'sound-evolution',
    index: 2,
    label: 'Scene 03 — FOCAL Certified Partner',
    copy: {
      eyebrow: 'What Drives Us',
      title: 'Quality. Innovation.\nLeadership.',
      body: '12 years of professional experience in reducing product defects and cost, generating ideas that create the best AV solutions, and a strong, skilled team that makes us a true leader in audio and video.',
      align: 'center',
    },
    camera: { position: [0, 0.5, 8], lookAt: [0, 0, 0] },
    mood: 0.85,
  },
  {
    id: 'harman-kardon',
    index: 3,
    label: 'Scene 04 — Harman Kardon Authorized Dealer',
    copy: {
      eyebrow: 'Authorized Dealer',
      title: 'Harman Kardon.',
      body: 'Beautiful sound, beautifully made — official Harman Kardon audio, delivered and installed by Cinesphere.',
      align: 'center',
    },
    camera: { position: [0, 0.5, 8], lookAt: [0, 0, 0] },
    mood: 0.8,
  },
  {
    id: 'dolby-atmos',
    index: 4,
    label: 'Scene 05 — Audio / Video Display Solutions',
    copy: {
      eyebrow: 'Our Solutions',
      title: 'Audio / Video\nDisplay Solutions.',
      body: 'Enhance your space with high-quality audio and video displays, tailored for clarity and impact in any environment.',
      align: 'center',
    },
    camera: { position: [0, 1.6, 2], lookAt: [0, 1.4, -4] },
    mood: 0.9,
  },
  {
    id: 'smart-villa',
    index: 5,
    label: 'Scene 06 — Conference, Boardroom & Studios',
    copy: {
      eyebrow: 'Our Solutions',
      title: 'Conference, Boardroom\n& Studios.',
      body: 'Seamlessly integrate advanced audio-visual technology into your conference rooms and boardrooms — with video/tele-conference studios designed for clear communication and smooth collaboration across distances.',
      align: 'left',
    },
    camera: { position: [6, 2, 12], lookAt: [0, 1, 0] },
    mood: 0.55,
  },
  {
    id: 'automation',
    index: 6,
    label: 'Scene 07 — E-Class Rooms, Signage & Seminar Halls',
    copy: {
      eyebrow: 'Our Solutions',
      title: 'Learn. Display.\nPresent.',
      body: 'E-class rooms with cutting-edge technology for dynamic learning, digital signage that delivers engaging content across environments, and training & seminar halls equipped with the latest audio-visual solutions.',
      align: 'center',
    },
    camera: { position: [0, 1.5, 7], lookAt: [0, 1.2, 0] },
    mood: 0.95,
  },
  {
    id: 'brand-vault',
    index: 7,
    label: 'Scene 08 — Our Valuable Clients',
    copy: {
      eyebrow: 'Our Clients',
      title: 'Know Our\nValuable Clients.',
      body: 'Trusted by leading organisations across industries.',
      align: 'left',
    },
    camera: { position: [0, 1, 9], lookAt: [0, 1, 0] },
    mood: 0.6,
    theme: 'light',
  },
  {
    id: 'projects',
    index: 8,
    label: 'Scene 09 — Gallery / Latest Works',
    copy: {
      eyebrow: 'Gallery',
      title: "Let's Check Our\nLatest Works.",
      body: 'Auditoriums, home theatres, seminar halls and studios — 80+ projects delivered.',
      align: 'center',
    },
    camera: { position: [0, 8, 18], lookAt: [0, 0, 0] },
    mood: 0.7,
  },
  {
    id: 'why-us',
    index: 9,
    label: 'Scene 10 — Stats & Testimonials',
    copy: {
      eyebrow: 'Testimonials',
      title: "What Our\nClients Say.",
      align: 'center',
    },
    camera: { position: [0, 1, 8], lookAt: [0, 1, 0] },
    mood: 0.5,
    theme: 'light',
  },
  {
    id: 'finale',
    index: 10,
    label: "Scene 11 — Let's Talk CTA",
    copy: {
      eyebrow: "Let's Talk",
      title: 'Having queries?\nWe’re all ears.',
      body: 'From a single listening room to a full auditorium — tell us what you have in mind and our team will get back to you within a working day.',
      align: 'center',
    },
    camera: { position: [0, 0, 6], lookAt: [0, 0, 0] },
    mood: 1.0,
  },
];

export const SCENE_COUNT = SCENES.length;

/** Valuable clients — used by Scene 07 and footer. */
export const BRANDS = [
  'Thales',
  'A² Square',
  'Starwood Hotels & Resorts',
  'Cauvery College',
  'Jeppiaar',
  'The Residency',
] as const;

/** Full solutions list — used in the footer (matches the 9 cards in
 *  the Our Solutions carousel). */
export const SOLUTIONS = [
  'Audio / Video Display Solutions',
  'Conference, Boardroom & Tele-Conference Studios',
  'E-Class Rooms & Seminar Halls',
  'Home Theatre Solutions',
  'Multi-Room Audio & Background Music',
  'Auditoriums AV',
  'Digital Signage & LED Video Wall',
  'Intelligent Solutions & Stage Lighting',
  'Surveillance Solutions',
] as const;

/** Top navigation — anchors map to scene section ids in the scroll journey. */
export const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'About Us', href: '#home-theatre' },
  { label: 'Our Solutions', href: '#dolby-atmos' },
  { label: 'Our Clients', href: '#brand-vault' },
  { label: 'Gallery', href: '#projects' },
  { label: 'Contact Us', href: '#contact' },
] as const;

/** Client testimonials — Scene 09. */
export const TESTIMONIALS = [
  {
    name: 'Mr. Arul Selvan',
    quote:
      'We hired Cinesphere — they were prompt, efficient and did an awesome job on my home theater. Great ideas, competitive pricing, and great effort on wiring and installation without disturbing my room design. I highly recommend them for their flawless work.',
  },
  {
    name: 'Mr. Ramesh Rajasekar',
    quote:
      'A high quality experience. Very satisfied — the entire group did an outstanding job on our home theater. The work was done to a very high standard and they stuck to our budget and completed the project on time. Their number one fan for life.',
  },
  {
    name: 'Mr. Sridhar',
    quote:
      'The team was very professional — showed up on time, finished before the announced time, and was so helpful in understanding our needs. Cinesphere delivered the system and made it so simple. Highly recommended!',
  },
] as const;

/** Headline stats for Scene 09. */
export const STATS = [
  { value: 80, suffix: '+', label: 'Total Projects' },
  { value: 110, suffix: '+', label: 'Happy Customers' },
  { value: 10, suffix: '+', label: 'Our Team Members' },
  { value: 12, suffix: '+', label: 'Years of Experience' },
] as const;

export const BRAND = {
  name: 'Cinesphere',
  tagline: 'Finest Audio Artistry',
  city: '1st Floor, Sri Govind Towers, W582, School Rd, W Block, Anna Nagar West Extension, Chennai, Tamil Nadu 600101',
  maps: 'https://share.google/FxqpEtxcAzB79G8Pq',
  email: 'info@cinesphere.in',
  phone: '+91 98841 80066',
} as const;

/** Given global scroll progress 0–1, return the active scene index. */
export function sceneFromProgress(progress: number): number {
  const clamped = Math.min(0.9999, Math.max(0, progress));
  return Math.floor(clamped * SCENE_COUNT);
}

/** Local progress 0–1 *within* the active scene. */
export function localProgress(progress: number): number {
  const scaled = progress * SCENE_COUNT;
  return scaled - Math.floor(scaled);
}
