// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
// Refreshed from GitHub by scripts/fetch-projects.mjs (prebuild + nightly CI).
import projects from './src/data/projects.json' with { type: 'json' };

/** @param {'software' | 'guides'} category */
const sidebarLinks = (category) =>
  projects
    .filter((p) => p.category === category)
    .map((p) => ({
      label: p.title,
      link: p.url,
      attrs: { target: '_blank', rel: 'noopener' },
    }));

// https://astro.build/config
export default defineConfig({
  // User GitHub Pages site is served from the domain root.
  site: 'https://dhanesh.github.io',
  base: '/',
  integrations: [
    starlight({
      title: 'Dhanesh · Projects',
      description:
        'A hub for projects published on GitHub Pages by Dhanesh Purohit.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/dhanesh',
        },
      ],
      sidebar: [
        { label: 'Overview', link: '/' },
        { label: 'Software', items: sidebarLinks('software') },
        { label: 'Guides', items: sidebarLinks('guides') },
      ],
    }),
  ],
});
