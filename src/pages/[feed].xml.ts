import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getPublishedGuides } from '../data/guides.ts';

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

  const siteUrl = context.site ? context.site.toString() : 'https://www.seoulallcaretan.com';

  return rss({
    title: '올케어탄성 시공 정보',
    description: '탄성코트 시공 전 점검과 작업 준비, 벽면 관리에 관한 정보를 안내합니다.',
    site: siteUrl,
    customData: '<language>ko-KR</language>',
    items: publishedGuides.map((guide: any) => ({
      title: guide.title,
      description: guide.description,
      pubDate: new Date(guide.publishedAt || Date.now()),
      link: `/guide/${guide.slug}.html`,
      content: guide.body,
      customData: `<guid isPermaLink="true">${siteUrl.replace(/\/$/, '')}/guide/${guide.slug}.html</guid>`,
    })),
  });
}
