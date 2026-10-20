import type { APIContext } from 'astro';
import { getRssString } from '@astrojs/rss';
import { getPublishedGuides } from '../data/guides.ts';
import { renderGuideBodyToHtml } from '../utils/markdown.ts';

/**
 * 네이버 서치어드바이저 소유확인 사이트(https://www.seoulallcaretan.com)와 일치하는 고정 RSS 기본 URL
 * - 네이버 서치어드바이저는 등록된 사이트 호스트와 RSS channel link, item link, guid 호스트가
 *   100% 동일해야 유효한 RSS로 승인합니다.
 */
export const RSS_SITE_URL = 'https://www.seoulallcaretan.com';

export function getStaticPaths() {
  const publishedGuides = getPublishedGuides();

  // 안전 게이트: 승인된 게시글이 0개인 경우 rss.xml 라우트를 전혀 생성하지 않음 (빈 RSS 배포 방지)
  if (publishedGuides.length === 0) {
    return [];
  }

  return [
    {
      params: { feed: 'rss' },
      props: { guides: publishedGuides },
    },
  ];
}

export async function GET(context: APIContext) {
  const publishedGuides = (context.props as any)?.guides || getPublishedGuides();

  const siteUrl = RSS_SITE_URL;

  const rssString = await getRssString({
    title: '올케어탄성 시공 정보',
    description: '탄성코트 시공 전 점검과 작업 준비, 벽면 관리에 관한 정보를 안내합니다.',
    site: siteUrl,
    customData: '<language>ko-KR</language>',
    items: publishedGuides.map((guide: any) => ({
      title: guide.title,
      description: guide.description,
      pubDate: new Date(guide.publishedAt || Date.now()),
      link: `/guide/${guide.slug}.html`,
      content: renderGuideBodyToHtml(guide.body),
      customData: `<guid isPermaLink="true">${siteUrl}/guide/${guide.slug}.html</guid>`,
    })),
  });

  // content:encoded 내부의 HTML을 CDATA 섹션으로 감싸 표준 RSS 2.0 및 네이버 검색봇 피드 파서 호환성 보장
  const formattedRss = rssString.replace(
    /<content:encoded>([\s\S]*?)<\/content:encoded>/g,
    (_, encodedContent) => {
      const decoded = encodedContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
      return `<content:encoded><![CDATA[${decoded}]]></content:encoded>`;
    }
  );

  return new Response(formattedRss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
