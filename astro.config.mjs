// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/$/, '') : undefined;

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'static',
  build: {
    format: 'file',
  },
  integrations: siteUrl
    ? [
        sitemap({
          serialize(item) {
            // 루트(/)가 아닌 정적 파일 경로는 build.format: 'file' 규격에 맞춰 .html을 유지/보장
            if (item.url !== `${siteUrl}/` && !item.url.endsWith('.html')) {
              item.url = `${item.url}.html`;
            }
            return item;
          },
        }),
      ]
    : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
