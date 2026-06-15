/**
 * Project gallery — single source of truth for the "Latest Works" photos.
 *
 * Real project photos live in /public/gallery, named gal{project}.{n}.jpg.
 * Within each project the ".1" file is the MAIN / cover image; the higher
 * serial numbers (.2, .3, …) are supporting shots.
 *
 * - PROJECTS         → every project, each with its `main` (.1) image and
 *   the rest in `more`. Used by the dedicated /gallery page.
 * - HOMEPAGE_GALLERY → a small curated teaser of project main images shown
 *   on the homepage, with an "Explore the full gallery" button to /gallery.
 *
 * To add a project: drop the files in /public/gallery and add an entry to
 * PROJECTS (its `.1` as `main`). To feature it on the homepage, add its main
 * image to HOMEPAGE_GALLERY.
 */

export interface GalleryImage {
  src: string;
  /** Short caption revealed on hover. */
  label: string;
}

export interface Project {
  id: string;
  label: string;
  /** The ".1" serial — the project's main / cover image. */
  main: string;
  /** Remaining shots (.2, .3, …) shown as supporting thumbnails. */
  more: string[];
}

// Serve the WebP variant of every photo. Each /public/gallery/*.jpg ships a
// matching .webp (produced by scripts/convert-to-webp.mjs) that is markedly
// smaller with no visible quality loss, so the grid and lightbox load much
// faster. The entries below keep the original .jpg names (they mirror the
// source files); this swaps the extension at the point of use.
const g = (file: string) => `/gallery/${file.replace(/\.jpg$/, '.webp')}`;

/** Every project, main (.1) image first. */
export const PROJECTS: Project[] = [
  { id: 'project-01', label: 'Project 01', main: g('gal1.1.jpg'), more: [g('gal1.2.jpg'), g('gal1.3.jpg'), g('gal1.4.jpg')] },
  { id: 'project-02', label: 'Project 02', main: g('gal2.1.jpg'), more: [] },
  { id: 'project-03', label: 'Project 03', main: g('gal3.1.jpg'), more: [g('gal3.2.jpg')] },
  { id: 'project-04', label: 'Project 04', main: g('gal4.1.jpg'), more: [g('gal4.2.jpg')] },
  { id: 'project-05', label: 'Project 05', main: g('gal5.1.jpg'), more: [g('gal5.2.jpg')] },
  { id: 'project-06', label: 'Project 06', main: g('gal6.1.jpg'), more: [g('gal6.2.jpg')] },
  { id: 'project-07', label: 'Project 07', main: g('gal7.1.jpg'), more: [g('gal7.2.jpg'), g('gal7.3.jpg'), g('gal7.4.jpg'), g('gal7.5.jpg')] },
  { id: 'project-08', label: 'Project 08', main: g('gal8.1.jpg'), more: [g('gal8.2.jpg')] },
  { id: 'project-09', label: 'Project 09', main: g('gal9.1.jpg'), more: [] },
  { id: 'project-10', label: 'Project 10', main: g('gal10.1.jpg'), more: [g('gal10.2.jpg')] },
  { id: 'project-11', label: 'Project 11', main: g('gal11.1.jpg'), more: [g('gal11.2.jpg'), g('gal11.3.jpg')] },
  { id: 'project-12', label: 'Project 12', main: g('gal12.1.jpg'), more: [] },
  { id: 'project-13', label: 'Project 13', main: g('gal13.1.jpg'), more: [g('gal13.2.jpg')] },
  { id: 'project-14', label: 'Project 14', main: g('gal14.1.jpg'), more: [g('gal14.2.jpg'), g('gal14.3.jpg')] },
  { id: 'project-15', label: 'Project 15', main: g('gal15.1.jpg'), more: [] },
];

/** Curated teaser for the homepage — six featured projects, each shown by
 *  its main (.1) cover. Clicking a tile previews all of that project's
 *  photos via the shared lightbox. */
export const HOMEPAGE_PROJECTS: Project[] = [
  PROJECTS[0], // Project 01
  PROJECTS[2], // Project 03
  PROJECTS[5], // Project 06
  PROJECTS[7], // Project 08
  PROJECTS[10], // Project 11
  PROJECTS[13], // Project 14
];
