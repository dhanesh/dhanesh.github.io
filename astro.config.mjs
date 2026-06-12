// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
        {
          label: 'Projects',
          items: [
            { label: 'Overview', link: '/' },
            {
              label: 'Engineering Tradeoffs',
              link: 'https://dhanesh.github.io/engineering-tradeoffs/',
              attrs: { target: '_blank', rel: 'noopener' },
            },
            {
              label: 'IT Operations Field Guide',
              link: 'https://dhanesh.github.io/it-operations-field-guide/',
              attrs: { target: '_blank', rel: 'noopener' },
            },
          ],
        },
      ],
    }),
  ],
});
