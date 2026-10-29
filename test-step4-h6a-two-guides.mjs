import test from 'node:test';
import assert from 'node:assert/strict';
import { GUIDES, isGuidePublished, getPublishedGuides, getRelatedSeoPageUrl } from './src/data/guides.ts';
import { KEYWORD_LEDGER, validateAllKeywordAllocations, getKeywordStatus } from './src/data/keywordRegistry.ts';
import { validatePostKeywordUsage, extractPlainText } from './src/utils/keywordValidation.ts';

test('STEP 4-H-6A: Two Short Guide Drafts & Keyword Reservation Test Suite', async (t) => {
  const post1 = GUIDES.find((g) => g.postId === 'guide-nowon-wall-peeling-check');
  const post2 = GUIDES.find((g) => g.postId === 'guide-dobong-laundry-pipe-check');
  const post3 = GUIDES.find((g) => g.postId === 'guide-nowon-balcony-masking-checklist');

  await t.test('1. Total GUIDES count is exactly 4 published posts', () => {
    assert.equal(GUIDES.length, 4, 'GUIDES must contain exactly 4 posts');
    assert.ok(post1, 'POST 01 must exist');
    assert.ok(post2, 'POST 02 must exist');
    assert.ok(post3, 'POST 03 must exist');
  });

  await t.test('2. POST 02 (도봉구 탄성코트) Published Metadata and Safety Configuration', () => {
    assert.equal(post2.slug, 'dobong-laundry-room-pipe-wall-check');
    assert.equal(post2.keywordId, 'elastic-coating_dobong');
    assert.equal(post2.relatedServiceId, 'elastic-coating');
    assert.equal(post2.relatedRegionId, 'dobong');
    assert.equal(post2.contentType, 'guide');
    assert.equal(post2.contentStatus, 'approved');
    assert.equal(post2.isPublished, true);
    assert.ok(post2.publishedAt !== null);
    assert.ok(post2.updatedAt !== null);
  });

  await t.test('3. POST 02 Keyword Usage Frequency (Exact 1 Title / 1 Body) & Length', () => {
    const val = validatePostKeywordUsage(post2.title, post2.body, '도봉구 탄성코트');
    assert.equal(val.valid, true);
    assert.equal(val.titleCount, 1);
    assert.equal(val.bodyCount, 1);
    assert.equal(val.foreignKeywordCollisions.length, 0);

    const charCount = post2.body.length;
    assert.ok(charCount >= 300 && charCount <= 600, `POST 02 length ${charCount} must be in 300~600`);
    const paragraphs = post2.body.split(/\n\s*\n/).filter(Boolean);
    assert.ok(paragraphs.length >= 3 && paragraphs.length <= 4, `Paragraphs count ${paragraphs.length} in 3~4`);
  });

  await t.test('4. POST 03 (노원구 베란다탄성코트) Published Metadata and Safety Configuration', () => {
    assert.equal(post3.slug, 'nowon-balcony-storage-masking-checklist');
    assert.equal(post3.keywordId, 'balcony-elastic-coating_nowon');
    assert.equal(post3.relatedServiceId, 'balcony-elastic-coating');
    assert.equal(post3.relatedRegionId, 'nowon');
    assert.equal(post3.contentType, 'guide');
    assert.equal(post3.contentStatus, 'approved');
    assert.equal(post3.isPublished, true);
    assert.ok(post3.publishedAt !== null);
    assert.ok(post3.updatedAt !== null);
  });

  await t.test('5. POST 03 Keyword Usage Frequency (Exact 1 Title / 1 Body) & Length', () => {
    const val = validatePostKeywordUsage(post3.title, post3.body, '노원구 베란다탄성코트');
    assert.equal(val.valid, true);
    assert.equal(val.titleCount, 1);
    assert.equal(val.bodyCount, 1);
    assert.equal(val.foreignKeywordCollisions.length, 0);

    const charCount = post3.body.length;
    assert.ok(charCount >= 300 && charCount <= 600, `POST 03 length ${charCount} must be in 300~600`);
    const paragraphs = post3.body.split(/\n\s*\n/).filter(Boolean);
    assert.ok(paragraphs.length >= 3 && paragraphs.length <= 4, `Paragraphs count ${paragraphs.length} in 3~4`);
  });

  await t.test('6. Keyword Registry Status: 4 PUBLISHED, 0 RESERVED, 20 AVAILABLE', () => {
    const val = validateAllKeywordAllocations(GUIDES, KEYWORD_LEDGER);
    assert.equal(val.valid, true);
    assert.equal(val.errors.length, 0);
    assert.equal(val.stats.totalKeywords, 24);
    assert.equal(val.stats.publishedCount, 4);
    assert.equal(val.stats.reservedCount, 0);
    assert.equal(val.stats.availableCount, 20);

    assert.equal(getKeywordStatus('elastic-coating_nowon', GUIDES, KEYWORD_LEDGER), 'PUBLISHED');
    assert.equal(getKeywordStatus('elastic-coating_dobong', GUIDES, KEYWORD_LEDGER), 'PUBLISHED');
    assert.equal(getKeywordStatus('balcony-elastic-coating_nowon', GUIDES, KEYWORD_LEDGER), 'PUBLISHED');
    assert.equal(getKeywordStatus('elastic-coating_jungnang', GUIDES, KEYWORD_LEDGER), 'PUBLISHED');
  });

  await t.test('7. KEYWORD_LEDGER Integrity and Reservation Timestamps', () => {
    assert.equal(KEYWORD_LEDGER.length, 4);
    const entry2 = KEYWORD_LEDGER.find((e) => e.keywordId === 'elastic-coating_dobong');
    assert.ok(entry2);
    assert.equal(entry2.status, 'PUBLISHED');
    assert.equal(entry2.postId, 'guide-dobong-laundry-pipe-check');
    assert.ok(new Date(entry2.assignedAt).getTime() > 0);

    const entry3 = KEYWORD_LEDGER.find((e) => e.keywordId === 'balcony-elastic-coating_nowon');
    assert.ok(entry3);
    assert.equal(entry3.status, 'PUBLISHED');
    assert.equal(entry3.postId, 'guide-nowon-balcony-masking-checklist');
    assert.ok(new Date(entry3.assignedAt).getTime() > 0);
  });

  await t.test('8. Strict Publication Gate: All 4 Guides are safely published', () => {
    assert.equal(isGuidePublished(post1), true);
    assert.equal(isGuidePublished(post2), true);
    assert.equal(isGuidePublished(post3), true);

    const publishedList = getPublishedGuides(GUIDES);
    assert.equal(publishedList.length, 4);
  });

  await t.test('9. Regional SEO Link Integration: Both target pages are published and resolvable', () => {
    const url2 = getRelatedSeoPageUrl(post2.relatedServiceId, post2.relatedRegionId);
    assert.equal(url2, '/seo/elastic-coating/seoul-dobong-gu.html');

    const url3 = getRelatedSeoPageUrl(post3.relatedServiceId, post3.relatedRegionId);
    assert.equal(url3, '/seo/balcony-elastic-coating/seoul-nowon-gu.html');
  });

  await t.test('10. Content Distinction: 3 Posts Address 3 Mutually Exclusive Topics', () => {
    const text1 = extractPlainText(post1.body);
    const text2 = extractPlainText(post2.body);
    const text3 = extractPlainText(post3.body);

    // Topic keywords
    assert.ok(text1.includes('들뜸'));
    assert.ok(text2.includes('배관') && text2.includes('세탁기'));
    assert.ok(text3.includes('창고장') && text3.includes('보양'));

    // Factuality & Safety checks (zero exaggerated promises & no outdoor unit sealing)
    [text1, text2, text3].forEach((t) => {
      assert.equal(t.includes('완전 해결'), false);
      assert.equal(t.includes('100%'), false);
      assert.equal(t.includes('영구 보장'), false);
    });
    assert.equal(text3.includes('밀폐'), false, 'POST 03 must not instruct sealing outdoor units');
  });
});
