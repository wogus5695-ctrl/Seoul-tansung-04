import type { APIRoute } from 'astro';
import { isPreviewEnvironment } from '../utils/seo.ts';

export const GET: APIRoute = ({ site }) => {
  // siteUrl 결정: Astro config의 site 또는 환경변수 SITE_URL (끝의 슬래시 제거)
  const siteUrl = site ? site.toString().replace(/\/$/, '') : (process.env.SITE_URL ? process.env.SITE_URL.replace(/\/$/, '') : '');
  const isPreview = isPreviewEnvironment();

  let body = '';

  if (isPreview) {
    // 1. 미리보기 / 프리뷰 환경: 검색엔진 크롤링 전체 차단
    body = [
      '# Preview / Staging Environment - Crawling Prohibited',
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');
  } else if (siteUrl) {
    // 2. 정식 운영 환경 (SITE_URL 설정 완료): 정상 크롤링 허용 및 사이트맵 안내
    body = [
      '# Production Environment - Crawling Allowed',
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${siteUrl}/sitemap-index.xml`,
      '',
    ].join('\n');
  } else {
    // 3. 로컬 개발 환경 (운영 도메인 미설정): 안전 차단
    body = [
      '# Local Development Environment - Domain not configured',
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
