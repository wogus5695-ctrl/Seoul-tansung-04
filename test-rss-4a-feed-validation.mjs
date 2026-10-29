import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { GUIDES } from './src/data/guides.ts';
import { KEYWORD_LEDGER, validateAllKeywordAllocations } from './src/data/keywordRegistry.ts';
import { renderGuideBodyToHtml } from './src/utils/markdown.ts';

test('STEP RSS-4A: RSS 404 & Naver Feed Validation Repair Suite', async (t) => {
  const guide = GUIDES[0];
  const rssXml = fs.readFileSync('dist/rss.xml', 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
  });
  const parsed = parser.parse(rssXml);

  await t.test('1. dist/rss.xml 파일 존재 및 용량 기준 충족 (10MB 미만)', () => {
    assert.ok(fs.existsSync('dist/rss.xml'), 'dist/rss.xml must exist');
    const stats = fs.statSync('dist/rss.xml');
    assert.ok(stats.size > 1000, 'RSS file must not be empty');
    assert.ok(stats.size < 10 * 1024 * 1024, 'RSS file must be under 10MB');
  });

  await t.test('2. RSS item 정확히 4개 존재', () => {
    const channel = parsed.rss?.channel;
    assert.ok(channel, 'Channel must exist');
    const items = Array.isArray(channel.item) ? channel.item : (channel.item ? [channel.item] : []);
    assert.equal(items.length, 4, 'Exactly 4 items in RSS');
  });

  await t.test('3. RSS XML 정상 파싱 및 기본 메타데이터 확인', () => {
    const channel = parsed.rss?.channel;
    assert.equal(channel.title, '올케어탄성 시공 정보');
    assert.equal(channel.description, '탄성코트 시공 전 점검과 작업 준비, 벽면 관리에 관한 정보를 안내합니다.');
    assert.equal(channel.language, 'ko-KR');
  });

  await t.test('4. Channel Link www 호스트 확인', () => {
    const channel = parsed.rss?.channel;
    assert.equal(channel.link, 'https://www.seoulallcaretan.com/');
    assert.ok(channel.link.startsWith('https://www.seoulallcaretan.com'), 'Channel link must match Naver verified www domain');
  });

  await t.test('5. Item Link www 호스트 확인 및 확장자 정합성', () => {
    const item = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item[0] : parsed.rss.channel.item;
    assert.equal(item.link, 'https://www.seoulallcaretan.com/guide/nowon-balcony-wall-peeling-check.html');
    assert.ok(!item.link.endsWith('.html/'), 'No trailing slash after .html');
  });

  await t.test('6. Item GUID www 호스트 확인 및 isPermaLink="true" 속성', () => {
    const item = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item[0] : parsed.rss.channel.item;
    assert.equal(item.guid?.['#text'], 'https://www.seoulallcaretan.com/guide/nowon-balcony-wall-peeling-check.html');
    assert.equal(item.guid?.['@_isPermaLink'], 'true');
  });

  await t.test('7. RSS 본문 HTML 렌더링 확인 (h2, p, ul, li 태그 및 CDATA 포맷)', () => {
    assert.ok(rssXml.includes('<content:encoded><![CDATA['), 'content:encoded must be wrapped in CDATA');
    assert.ok(rssXml.includes('<h2>베란다 벽면 들뜸은 어떤 상태인가요?</h2>'), 'Must contain h2 HTML tag');
    assert.ok(rssXml.includes('<p>벽면 들뜸은 콘크리트나 석고보드 등'), 'Must contain p HTML tag');
    assert.ok(rssXml.includes('<ul><li>초킹 현상'), 'Must contain ul and li HTML tags');
  });

  await t.test('8. Markdown 원문 미노출 (##, - 목록 마크다운 기호 제거 확인)', () => {
    const contentMatch = rssXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    assert.ok(contentMatch, 'CDATA block must match');
    const content = contentMatch[1];
    assert.equal(content.includes('## '), false, 'Markdown ## heading must NOT appear in HTML body');
    assert.equal(content.includes('\n- '), false, 'Markdown - list bullet must NOT appear in HTML body');
  });

  await t.test('9. 기존 및 신규 HTML 페이지 총 8개 빌드 산출물 확인', () => {
    const expectedHtml = [
      'dist/index.html',
      'dist/guide.html',
      'dist/guide/nowon-balcony-wall-peeling-check.html',
      'dist/guide/dobong-laundry-room-pipe-wall-check.html',
      'dist/guide/nowon-balcony-storage-masking-checklist.html',
      'dist/seo/elastic-coating/seoul-nowon-gu.html',
      'dist/seo/elastic-coating/seoul-dobong-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
    ];
    for (const f of expectedHtml) {
      assert.ok(fs.existsSync(f), `${f} must exist in dist`);
    }
  });

  await t.test('10. Sitemap 공개 URL 총 12개 유지 및 비공개 URL 배제 (11 기존 + 1 신규 가이드)', () => {
    assert.ok(fs.existsSync('dist/sitemap-0.xml'), 'sitemap-0.xml must exist');
    const sitemap = fs.readFileSync('dist/sitemap-0.xml', 'utf-8');
    const locs = sitemap.match(/<loc>[^<]+<\/loc>/g) || [];
    assert.equal(locs.length, 14, 'Exactly 14 URLs in sitemap');
    assert.ok(locs.some((l) => l.includes('/sitemap-seoul.html')));
    assert.ok(locs.some((l) => l.includes('/guide.html')));
    assert.ok(locs.some((l) => l.includes('/guide/nowon-balcony-wall-peeling-check.html')));
    assert.ok(locs.some((l) => l.includes('/guide/dobong-laundry-room-pipe-wall-check.html')));
    assert.ok(locs.some((l) => l.includes('/guide/nowon-balcony-storage-masking-checklist.html')));
    assert.ok(locs.some((l) => l.includes('/guide/jungnang-wall-drying-check.html')));
    assert.equal(sitemap.includes('gangbuk'), false, 'Unpublished page must NOT be in sitemap');
  });

  await t.test('11. 비공개 지역 21개 완벽 격리 (dist에 파일 미생성)', () => {
    const unpublishedSample = 'dist/seo/elastic-coating/seoul-gangbuk-gu.html';
    assert.equal(fs.existsSync(unpublishedSample), false, 'Gangbuk must not exist in dist');
  });

  await t.test('12. 기존 게시글 내용 및 발행일자(publishedAt) 무결성 보존', () => {
    assert.equal(guide.publishedAt, '2026-10-20T14:15:00.000Z');
    assert.equal(guide.updatedAt, '2026-10-20T14:15:00.000Z');
    assert.equal(guide.contentStatus, 'approved');
    assert.equal(guide.isPublished, true);
  });

  await t.test('13. Keyword Registry 원장 무결성 (PUBLISHED 4건, 중복 0건)', () => {
    const ledger = KEYWORD_LEDGER.find((e) => e.keywordId === 'elastic-coating_nowon');
    assert.ok(ledger);
    assert.equal(ledger.status, 'PUBLISHED');
    assert.equal(ledger.assignedAt, '2026-10-20T09:12:00.000Z');

    const validation = validateAllKeywordAllocations(GUIDES, KEYWORD_LEDGER);
    assert.equal(validation.valid, true);
    assert.equal(validation.stats.publishedCount, 4);
    assert.equal(validation.stats.reservedCount, 0);
    assert.equal(validation.stats.availableCount, 20);
    assert.equal(validation.stats.totalKeywords, 24);
  });

  await t.test('14. renderGuideBodyToHtml 단위 검증', () => {
    const sample = '문단 1\n\n## 소제목\n\n문단 2\n\n- 목록 1\n- 목록 2';
    const html = renderGuideBodyToHtml(sample);
    assert.equal(html, '<p>문단 1</p>\n<h2>소제목</h2>\n<p>문단 2</p>\n<ul><li>목록 1</li><li>목록 2</li></ul>');
  });
});
