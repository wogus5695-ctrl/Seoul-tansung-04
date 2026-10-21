import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUIDES,
  isGuidePublished,
  getPublishedGuides,
  getRelatedSeoPageUrl,
} from './src/data/guides.ts';
import {
  getKeywordStatus,
  getKeywordById,
  validateAllKeywordAllocations,
  KEYWORD_LEDGER,
} from './src/data/keywordRegistry.ts';
import {
  validatePostKeywordUsage,
  extractPlainText,
  countKeywordOccurrences,
} from './src/utils/keywordValidation.ts';
import {
  buildArticleJsonLd,
  getCanonicalUrl,
} from './src/utils/seo.ts';

test('STEP RSS-3A: First Real Guide Content Draft & Keyword Reservation', async (t) => {
  const post = GUIDES[0];

  await t.test('1. First real guide post is registered in GUIDES array and published in RSS-4', () => {
    assert.ok(GUIDES.length >= 1, 'GUIDES contains real guide posts');
    assert.ok(post);
    assert.equal(post.postId, 'guide-nowon-wall-peeling-check');
    assert.equal(post.slug, 'nowon-balcony-wall-peeling-check');
    assert.equal(post.keywordId, 'elastic-coating_nowon');
    assert.equal(post.contentStatus, 'approved');
    assert.equal(post.isPublished, true);
    assert.equal(post.publishedAt, '2026-10-20T14:15:00.000Z');
    assert.equal(post.updatedAt, '2026-10-20T14:15:00.000Z');
    assert.equal(post.relatedServiceId, 'elastic-coating');
    assert.equal(post.relatedRegionId, 'nowon');
  });

  await t.test('2. Target keyword exists in dynamic keywords registry', () => {
    const kw = getKeywordById('elastic-coating_nowon');
    assert.ok(kw);
    assert.equal(kw.keyword, '노원구 탄성코트');
    assert.equal(kw.regionName, '노원구');
    assert.equal(kw.serviceName, '탄성코트');
  });

  await t.test('3. Keyword is properly PUBLISHED in KEYWORD_LEDGER and registry status', () => {
    const ledgerEntry = KEYWORD_LEDGER.find((e) => e.keywordId === 'elastic-coating_nowon');
    assert.ok(ledgerEntry, 'Ledger entry must exist for elastic-coating_nowon');
    assert.equal(ledgerEntry.status, 'PUBLISHED');
    assert.equal(ledgerEntry.postId, 'guide-nowon-wall-peeling-check');
    assert.ok(ledgerEntry.assignedAt, 'assignedAt must be valid');

    const status = getKeywordStatus('elastic-coating_nowon', GUIDES, KEYWORD_LEDGER);
    assert.equal(status, 'PUBLISHED');
  });

  await t.test('4. Full registry allocation validation passes cleanly with 0 errors', () => {
    const res = validateAllKeywordAllocations(GUIDES, KEYWORD_LEDGER);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.stats.totalKeywords, 24);
    assert.equal(res.stats.publishedCount, 3);
    assert.equal(res.stats.reservedCount, 0);
    assert.equal(res.stats.availableCount, 21);
  });

  await t.test('5. Reassigning the reserved keyword to another post is strictly BLOCKED', () => {
    const imposterPost = {
      postId: 'guide-imposter',
      slug: 'imposter-slug',
      title: '노원구 탄성코트 중복 시도',
      description: '설명',
      body: '노원구 탄성코트 본문',
      keywordId: 'elastic-coating_nowon',
      contentType: 'guide',
      contentStatus: 'draft',
      isPublished: false,
      publishedAt: null,
      updatedAt: null,
      relatedServiceId: 'elastic-coating',
      relatedRegionId: 'nowon',
    };

    const res = validateAllKeywordAllocations([post, imposterPost], KEYWORD_LEDGER);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('키워드 중복 배정 차단') || e.includes('원장 충돌')));
  });

  await t.test('6. Title contains target keyword EXACTLY 1 time', () => {
    const cleanTitle = extractPlainText(post.title);
    assert.equal(cleanTitle, '노원구 탄성코트 시공 전, 베란다 벽면 들뜸을 확인하는 방법');
    const count = countKeywordOccurrences(cleanTitle, '노원구 탄성코트');
    assert.equal(count, 1, 'Target keyword must appear exactly 1 time in title');
  });

  await t.test('7. Body contains target keyword EXACTLY 1 time', () => {
    const cleanBody = extractPlainText(post.body);
    const count = countKeywordOccurrences(cleanBody, '노원구 탄성코트');
    assert.equal(count, 1, 'Target keyword must appear exactly 1 time in body');
  });

  await t.test('8. Full keyword usage validator returns valid: true with 0 errors', () => {
    const res = validatePostKeywordUsage(post.title, post.body, '노원구 탄성코트');
    assert.equal(res.valid, true);
    assert.equal(res.titleCount, 1);
    assert.equal(res.bodyCount, 1);
    assert.equal(res.errors.length, 0);
    assert.equal(res.foreignKeywordCollisions.length, 0, 'No foreign dynamic keyword collision');
  });

  await t.test('9. Content quality & factual safety guidelines verified', () => {
    // Must NOT contain exaggerated claims
    assert.equal(post.body.includes('100%'), false);
    assert.equal(post.body.includes('완벽 해결'), false);
    assert.equal(post.body.includes('누수 완전 차단'), false);
    assert.equal(post.body.includes('친환경 특허 1위'), false);

    // Must differentiate from regional landing page (/seo/elastic-coating/seoul-nowon-gu.html)
    assert.equal(post.body.includes('노원구 아파트·주거 공간 베란다와 세탁실의 도막 들뜸'), false);
    assert.equal(post.body.includes('TARGET SPACES'), false);
  });

  await t.test('10. Publication gate verifies approved post is published and draft remains blocked', () => {
    assert.equal(isGuidePublished(post), true, 'approved post passes isGuidePublished');
    const publishedGuides = getPublishedGuides(GUIDES);
    assert.equal(publishedGuides.length, 3, 'Published guides list has exactly 3 approved posts');

    // Verify unapproved draft is still blocked
    const draftSample = { ...post, contentStatus: 'draft', isPublished: false };
    assert.equal(isGuidePublished(draftSample), false, 'draft must not pass publication gate');
  });

  await t.test('11. Related regional SEO page link is available for Nowon elastic coating', () => {
    const relatedUrl = getRelatedSeoPageUrl('elastic-coating', 'nowon');
    assert.equal(relatedUrl, '/seo/elastic-coating/seoul-nowon-gu.html');
  });

  await t.test('12. SEO Article JSON-LD outputs correct datePublished for published post and omits for draft', () => {
    const siteUrl = 'https://www.seoulallcaretan.com';
    const canonical = getCanonicalUrl(`/guide/${post.slug}.html`, siteUrl);
    const articleJson = buildArticleJsonLd(post.title, post.description, canonical, post.publishedAt, post.updatedAt);
    assert.ok(articleJson);
    assert.equal(articleJson.datePublished, '2026-10-20T14:15:00.000Z', 'datePublished must match publishedAt');
    assert.equal(articleJson.dateModified, '2026-10-20T14:15:00.000Z', 'dateModified must match updatedAt');

    const draftJson = buildArticleJsonLd(post.title, post.description, canonical, null, null);
    assert.equal(draftJson.datePublished, undefined, 'datePublished must be omitted for draft');
  });
});
