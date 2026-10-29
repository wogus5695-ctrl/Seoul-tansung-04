import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GUIDES, isGuidePublished } from './src/data/guides.ts';
import { JUNGNANG_GUIDE_DRAFT } from './src/data/draftGuides.ts';
import {
  KEYWORD_LEDGER,
  getKeywordStatus,
  isDistrictKeyword,
  isDongKeyword,
  getAllCombinedDynamicKeywords,
} from './src/data/keywordRegistry.ts';
import { getPublishedSeoPages, SEO_PAGES } from './src/data/pages.ts';

describe('STEP RSS-NORTH-1: Jungnang Gu Guide Draft & Isolation Suite', () => {
  test('1. JUNGNANG_GUIDE_DRAFT metadata and draft isolation', () => {
    assert.equal(JUNGNANG_GUIDE_DRAFT.postId, 'guide-jungnang-wall-drying-check');
    assert.equal(JUNGNANG_GUIDE_DRAFT.slug, 'jungnang-wall-drying-check');
    assert.equal(JUNGNANG_GUIDE_DRAFT.keywordId, 'elastic-coating_jungnang');
    assert.equal(JUNGNANG_GUIDE_DRAFT.relatedServiceId, 'elastic-coating');
    assert.equal(JUNGNANG_GUIDE_DRAFT.relatedRegionId, 'jungnang');
    assert.equal(JUNGNANG_GUIDE_DRAFT.contentStatus, 'draft');
    assert.equal(JUNGNANG_GUIDE_DRAFT.isPublished, false);
    assert.equal(JUNGNANG_GUIDE_DRAFT.publishedAt, null);

    // Publication gate must block the draft
    assert.equal(isGuidePublished(JUNGNANG_GUIDE_DRAFT), false, 'Draft must NOT pass isGuidePublished');
  });

  test('2. GUIDES array and KEYWORD_LEDGER verification (4 items published)', () => {
    assert.equal(GUIDES.length, 4, 'GUIDES must contain exactly 4 items');
    assert.equal(KEYWORD_LEDGER.length, 4, 'KEYWORD_LEDGER must contain exactly 4 items');

    const publishedKeywordIds = KEYWORD_LEDGER.map((l) => l.keywordId);
    assert.ok(publishedKeywordIds.includes('elastic-coating_jungnang'), 'Jungnang must be in KEYWORD_LEDGER');

    const status = getKeywordStatus('elastic-coating_jungnang', GUIDES);
    assert.equal(status, 'PUBLISHED', 'Jungnang keyword status must be PUBLISHED');
  });

  test('3. Keyword eligibility: District-level ONLY, Dong keywords prohibited', () => {
    assert.equal(isDistrictKeyword('elastic-coating_jungnang'), true, 'Jungnang is a district keyword');
    assert.equal(isDongKeyword('elastic-coating_jungnang'), false, 'Jungnang is not a dong keyword');

    // Negative check on dong keywords
    assert.equal(isDistrictKeyword('elastic-coating_jungnang-myeonmok'), false, 'Dong keyword cannot be district');
    assert.equal(isDongKeyword('elastic-coating_jungnang-myeonmok'), true, 'Myeonmok is a dong keyword');
  });

  test('4. Manuscript content validation (length, paragraphs, target SEO link, no prohibited claims)', () => {
    const { title, body, description } = JUNGNANG_GUIDE_DRAFT;

    assert.equal(title, '중랑구 탄성코트 시공 전, 벽면 건조 상태를 확인해야 하는 이유');
    assert.ok(description.length > 30, 'Meta description must be substantive');

    const paragraphs = body.split('\n\n');
    assert.equal(paragraphs.length, 4, 'Must have exactly 4 paragraphs');

    const charCountNoSpace = body.replace(/\s/g, '').length;
    assert.ok(charCountNoSpace >= 300 && charCountNoSpace <= 600, `Character count (no spaces) must be 300-600, got ${charCountNoSpace}`);

    // Must link to exact official regional SEO URL
    assert.ok(
      body.includes('https://www.seoulallcaretan.com/seo/elastic-coating/seoul-jungnang-gu.html'),
      'Must contain exact regional SEO link'
    );

    // Negative checks: prohibited expressions
    assert.ok(!body.includes('완벽 방수'), 'No 100% waterproof guarantee');
    assert.ok(!body.includes('결로 완전 해결'), 'No complete condensation cure claim');
    assert.ok(!body.includes('누수 완전 차단'), 'No complete leak blocking claim');
  });

  test('5. Existing SEO pages and sitemap invariant checks', () => {
    const published = getPublishedSeoPages();
    assert.equal(published.length, 7, 'Published SEO pages count is 7');

    const dongPages = SEO_PAGES.filter((p) => p.regionLevel === 'dong');
    assert.equal(dongPages.length, 22, 'Dong pages count remains 22');
    const unpublishedDong = dongPages.filter((p) => !p.isPublished);
    assert.equal(unpublishedDong.length, 20, '20 Dong pages remain draft');
    for (const dp of unpublishedDong) {
      assert.equal(dp.isPublished, false);
      assert.equal(dp.contentStatus, 'draft');
    }

    const allCombined = getAllCombinedDynamicKeywords();
    assert.equal(allCombined.length, 46, 'Total keywords count remains 46');
  });
});
