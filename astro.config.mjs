// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import { validateProductionSiteUrl } from './src/utils/seo.ts';
import { getPublishedGuides } from './src/data/guides.ts';

const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.ENVIRONMENT === 'preview';
const isProduction =
  process.env.VERCEL_ENV === 'production' ||
  process.env.DEPLOY_TARGET === 'production' ||
  process.env.PRODUCTION_BUILD === 'true';

const rawSiteUrl = process.env.SITE_URL ? process.env.SITE_URL.trim() : undefined;

// Production 배포 게이트: 운영 배포 모드에서는 유효한 운영 도메인이 반드시 검증되어야 합니다.
if (isProduction) {
  const validation = validateProductionSiteUrl(rawSiteUrl);
  if (!validation.valid) {
    throw new Error(`[PRODUCTION BUILD GATE ERROR] ${validation.error}`);
  }
}

// Preview 환경에서는 사이트맵 및 운영 canonical 생성을 차단하여 색인 신호 유출을 원천 방지합니다.
const siteUrl = (!isPreview && rawSiteUrl) ? rawSiteUrl.replace(/\/$/, '') : undefined;

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
          filter(page) {
            // 승인된 정보성 게시글이 0개일 때는 사이트맵에서 /guide 배제 (기존 4개 URL 유지)
            if (page.includes('guide') && getPublishedGuides().length === 0) {
              return false;
            }
            return true;
          },
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
