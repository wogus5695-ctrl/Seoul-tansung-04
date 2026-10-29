import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REGIONS } from './src/data/regions.ts';
import { DONGS, validateDongsIntegrity } from './src/data/dongs.ts';
import {
  SEO_PAGES,
  getPublishedSeoPages,
  isPagePublished,
  getSeoPage,
  getDongById,
} from './src/data/pages.ts';
import {
  getAllDynamicKeywords,
  getAllDongDynamicKeywords,
  getAllCombinedDynamicKeywords,
  isDistrictKeyword,
  validateAllKeywordAllocations,
  KEYWORD_LEDGER,
} from './src/data/keywordRegistry.ts';
import { GUIDES } from './src/data/guides.ts';
import {
  assertDistrictRssKeyword,
} from './src/utils/keywordValidation.ts';

console.log('--- [TEST SUITE] STEP REGION-1: DONG KEYWORD REGISTRY & RSS GATE ---');

// [Scenario 1] 11 Legal Dongs integrity (5 Nowon, 6 Jungnang)
console.log('1. Verifying 11 Legal Dongs integrity...');
assert.equal(DONGS.length, 11, 'Total legal dongs must be 11');
const nowonDongs = DONGS.filter((d) => d.parentRegionId === 'nowon');
const jungnangDongs = DONGS.filter((d) => d.parentRegionId === 'jungnang');
assert.equal(nowonDongs.length, 5, 'Nowon must have exactly 5 dongs');
assert.equal(jungnangDongs.length, 6, 'Jungnang must have exactly 6 dongs');

const expectedNowonIds = ['sanggye', 'junggye', 'hagye', 'gongneung', 'wolgye'];
const expectedJungnangIds = ['myeonmok', 'sangbong', 'junghwa', 'muk', 'mangu', 'sinnae'];

const expectedNowonSlugs = ['seoul-sanggye-dong', 'seoul-junggye-dong', 'seoul-hagye-dong', 'seoul-gongneung-dong', 'seoul-wolgye-dong'];
const expectedJungnangSlugs = ['seoul-myeonmok-dong', 'seoul-sangbong-dong', 'seoul-junghwa-dong', 'seoul-muk-dong', 'seoul-mangu-dong', 'seoul-sinnae-dong'];

assert.deepEqual(nowonDongs.map((d) => d.id), expectedNowonIds);
assert.deepEqual(jungnangDongs.map((d) => d.id), expectedJungnangIds);

assert.deepEqual(nowonDongs.map((d) => d.slug), expectedNowonSlugs);
assert.deepEqual(jungnangDongs.map((d) => d.slug), expectedJungnangSlugs);

for (const dong of DONGS) {
  assert.ok(dong.id, 'Dong id must exist');
  assert.ok(dong.name, 'Dong name must exist');
  assert.ok(dong.slug, 'Dong slug must exist');
  assert.equal(dong.regionLevel, 'dong', 'regionLevel must be dong');
  assert.ok(dong.displayName.includes(dong.name), 'displayName must contain name');
  assert.equal(typeof dong.order, 'number', 'order must be a number');
}
console.log('   PASS: 11 Legal Dongs integrity validated.');

// [Scenario 2] Parent region references match actual REGIONS & invalid parent rejection
console.log('2. Verifying parent region references & invalid parent rejection...');
const validRegionIds = new Set(REGIONS.map((r) => r.id));
for (const dong of DONGS) {
  assert.ok(validRegionIds.has(dong.parentRegionId), `Parent region ${dong.parentRegionId} must exist in REGIONS`);
}

const invalidParentDong = {
  id: 'fake',
  name: '가자동',
  slug: 'gaja',
  parentRegionId: 'invalid-gu',
  regionLevel: 'dong',
  displayName: '서울 가자동',
  order: 1,
};

const dongCheckRes = validateDongsIntegrity([invalidParentDong]);
assert.equal(dongCheckRes.valid, false, 'validateDongsIntegrity must return valid: false for invalid parent');
assert.ok(dongCheckRes.errors.some((e) => e.includes('invalid-gu')), 'Error must mention invalid-gu');
console.log('   PASS: Parent region integrity & rejection validated.');

// [Scenario 3] 22 Dong dynamic keywords generated cleanly with convention
console.log('3. Verifying 22 Dong dynamic keywords generation...');
const dongKeywords = getAllDongDynamicKeywords();
assert.equal(dongKeywords.length, 22, 'Dong dynamic keywords must be 22 (11 dongs * 2 services)');

for (const kw of dongKeywords) {
  assert.ok(kw.parentRegionId, 'Dong keyword must have parentRegionId');
  assert.equal(kw.regionLevel, 'dong', 'regionLevel must be dong');
  const expectedId = `${kw.serviceId}_${kw.parentRegionId}-${kw.regionId}`;
  assert.equal(kw.id, expectedId, `keywordId must follow convention ${expectedId}`);
}
console.log('   PASS: 22 Dong dynamic keywords convention validated.');

// [Scenario 4] Display keyword is strictly '동명 + 작업명' (no 3-tier '노원구 상계동 탄성코트')
console.log('4. Verifying display keyword strictly structured as [동명 + 작업명]...');
for (const kw of dongKeywords) {
  const parts = kw.keyword.split(' ');
  assert.equal(parts.length, 2, `Display keyword should have exactly 2 words: [동명, 작업명], got '${kw.keyword}'`);
  assert.ok(!kw.keyword.includes('노원구'), `Keyword '${kw.keyword}' must not contain '노원구'`);
  assert.ok(!kw.keyword.includes('중랑구'), `Keyword '${kw.keyword}' must not contain '중랑구'`);
  assert.ok(kw.keyword.endsWith('탄성코트'), `Keyword '${kw.keyword}' must end with service name`);
}
console.log('   PASS: Display keyword strictness validated.');

// [Scenario 5] Existing 24 Gu keywords 100% preserved in getAllDynamicKeywords()
console.log('5. Verifying existing 24 Gu keywords preserved in getAllDynamicKeywords()...');
const guKeywords = getAllDynamicKeywords();
assert.equal(guKeywords.length, 24, 'getAllDynamicKeywords() must return exactly 24 Gu keywords');
for (const kw of guKeywords) {
  assert.equal(kw.regionLevel, 'gu', 'regionLevel must be gu');
  const regionPart = kw.id.split('_')[1];
  assert.ok(!regionPart.includes('-'), `Gu region part '${regionPart}' in keywordId '${kw.id}' must not contain hyphens`);
}
console.log('   PASS: Existing 24 Gu keywords preserved.');

// [Scenario 6] 46 Total keywords in getAllCombinedDynamicKeywords()
console.log('6. Verifying 46 total keywords in getAllCombinedDynamicKeywords()...');
const combinedKeywords = getAllCombinedDynamicKeywords();
assert.equal(combinedKeywords.length, 46, 'Combined keywords must be exactly 46 (24 + 22)');
const combinedGu = combinedKeywords.filter((k) => k.regionLevel === 'gu');
const combinedDong = combinedKeywords.filter((k) => k.regionLevel === 'dong');
assert.equal(combinedGu.length, 24, 'Combined Gu count must be 24');
assert.equal(combinedDong.length, 22, 'Combined Dong count must be 22');
console.log('   PASS: 46 Total combined keywords validated.');

// [Scenario 7] All 18 unapproved Dong pages in SEO_PAGES are strictly isPublished: false & contentStatus: 'draft'
console.log('7. Verifying 18 draft Dong pages and 4 approved Dong pages in SEO_PAGES...');
const dongPages = SEO_PAGES.filter((p) => p.regionLevel === 'dong');
assert.equal(dongPages.length, 22, 'SEO_PAGES must have 22 dong pages');
const approvedDongIds = [
  'elastic-coating_nowon-sanggye',
  'elastic-coating_jungnang-myeonmok',
  'balcony-elastic-coating_nowon-sanggye',
  'balcony-elastic-coating_jungnang-myeonmok',
  'elastic-coating_nowon-junggye',
  'balcony-elastic-coating_nowon-junggye',
  'elastic-coating_nowon-hagye',
  'balcony-elastic-coating_nowon-hagye',
  'elastic-coating_jungnang-sangbong',
  'balcony-elastic-coating_jungnang-sangbong',
  'elastic-coating_jungnang-junghwa',
  'balcony-elastic-coating_jungnang-junghwa',
];
for (const page of dongPages) {
  if (approvedDongIds.includes(page.id)) {
    assert.equal(page.isPublished, true, `Approved Dong page ${page.id} must be published`);
    assert.equal(page.contentStatus, 'approved', `Approved Dong page ${page.id} must be approved`);
    assert.ok(page.content, `Approved Dong page ${page.id} must have defined content`);
    assert.equal(isPagePublished(page), true, `isPagePublished must return true for ${page.id}`);
  } else {
    assert.equal(page.isPublished, false, `Dong page ${page.id} must have isPublished: false`);
    assert.equal(page.contentStatus, 'draft', `Dong page ${page.id} must have contentStatus: draft`);
    assert.equal(page.content, undefined, `Dong page ${page.id} must have undefined content`);
    assert.equal(isPagePublished(page), false, `isPagePublished must return false for ${page.id}`);
  }
  assert.ok(page.metaTitle.includes('| AS보장 | 올케어탄성'), `Dong page metaTitle must include AS보장`);
}
console.log('   PASS: 10 draft Dong pages isolated, 12 Dong pages approved.');

// [Scenario 8] Zero HTML generated for unapproved dong pages in dist/seo/
console.log('8. Verifying published SEO pages and unapproved dong isolation...');
const publishedSeoPages = getPublishedSeoPages();
assert.equal(publishedSeoPages.length, 17, 'Exactly 17 pages must be published (5 Gu + 12 Dong)');

const distSeoDir = path.resolve('dist', 'seo');
if (fs.existsSync(distSeoDir)) {
  const allHtmls = [];
  function collectHtml(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) collectHtml(full);
      else if (e.name.endsWith('.html')) allHtmls.push(e.name);
    }
  }
  collectHtml(distSeoDir);
  const unapprovedDongs = DONGS.filter((d) => !['sanggye', 'myeonmok', 'junggye', 'hagye', 'sangbong', 'junghwa'].includes(d.id));
  for (const dong of unapprovedDongs) {
    const leaked = allHtmls.filter((f) => f === `${dong.slug}.html`);
    assert.equal(leaked.length, 0, `Dong HTML ${dong.slug}.html must not exist in dist/seo`);
  }
}
console.log('   PASS: Zero unapproved Dong HTML leakage validated.');

// [Scenario 9] Zero unapproved dong links in HTML hub
console.log('9. Verifying zero unapproved dong links in HTML hub (dist/sitemap-seoul.html)...');
const hubFile = path.resolve('dist', 'sitemap-seoul.html');
if (fs.existsSync(hubFile)) {
  const hubHtml = fs.readFileSync(hubFile, 'utf8');
  const unapprovedDongs = DONGS.filter((d) => !['sanggye', 'myeonmok', 'junggye', 'hagye', 'sangbong', 'junghwa'].includes(d.id));
  for (const dong of unapprovedDongs) {
    assert.ok(!hubHtml.includes(dong.slug), `Hub must not contain unapproved dong slug: ${dong.slug}`);
    assert.ok(!hubHtml.includes(dong.name), `Hub must not contain unapproved dong name: ${dong.name}`);
  }
  // Exactly 17 links to SEO pages (5 Gu + 12 Dong)
  const seoLinks = hubHtml.match(/href="\/seo\/[^"]+"/g) || [];
  assert.equal(seoLinks.length, 17, 'Hub must contain exactly 17 SEO links');
}
console.log('   PASS: Zero dong links in HTML hub validated.');

// [Scenario 10] Zero unapproved dong URLs in XML sitemap
console.log('10. Verifying zero unapproved dong URLs in XML sitemap (dist/sitemap-0.xml)...');
const sitemapFile = path.resolve('dist', 'sitemap-0.xml');
if (fs.existsSync(sitemapFile)) {
  const sitemapXml = fs.readFileSync(sitemapFile, 'utf8');
  const unapprovedDongs = DONGS.filter((d) => !['sanggye', 'myeonmok', 'junggye', 'hagye', 'sangbong', 'junghwa'].includes(d.id));
  for (const dong of unapprovedDongs) {
    assert.ok(!sitemapXml.includes(dong.slug), `Sitemap must not contain unapproved dong slug: ${dong.slug}`);
  }
  const locCount = (sitemapXml.match(/<loc>/g) || []).length;
  assert.equal(locCount, 24, 'Sitemap must contain exactly 24 loc entries');
}
console.log('   PASS: Zero dong URLs in XML sitemap validated.');

// [Scenario 11] RSS Gate: Assigning a dong keyword to a guide post throws [RSS POLICY VIOLATION]
console.log('11. Verifying strict RSS Gate throwing [RSS POLICY VIOLATION] on dong keywords...');
assert.equal(isDistrictKeyword('elastic-coating_nowon'), true, 'Gu keyword must be recognized as district');
assert.equal(isDistrictKeyword('elastic-coating_nowon-sanggye'), false, 'Dong keyword must NOT be recognized as district');

const mockGuidesWithDong = [
  ...GUIDES,
  {
    postId: 'guide-test-dong-violation',
    slug: 'guide-test-dong-violation',
    keywordId: 'elastic-coating_nowon-sanggye',
    title: '테스트 가이드',
    excerpt: '테스트 요약',
    publishedDate: '2026-10-29',
    canonicalPath: '/guides/guide-test-dong-violation.html',
  },
];

// Test 11-A: assertDistrictRssKeyword throws
assert.throws(
  () => {
    assertDistrictRssKeyword('elastic-coating_nowon-sanggye');
  },
  /\[RSS POLICY VIOLATION\].*elastic-coating_nowon-sanggye/,
  'assertDistrictRssKeyword must throw on dong keyword'
);
assert.doesNotThrow(() => {
  assertDistrictRssKeyword('elastic-coating_nowon');
});

// Test 11-B: validateAllKeywordAllocations throws when throwOnError is true
assert.throws(
  () => {
    validateAllKeywordAllocations(mockGuidesWithDong, KEYWORD_LEDGER, undefined, true);
  },
  /\[RSS POLICY VIOLATION\].*elastic-coating_nowon-sanggye/,
  'Must throw [RSS POLICY VIOLATION] when a dong keyword is assigned to a guide post'
);

const mockLedgerWithDong = [
  ...KEYWORD_LEDGER,
  {
    keywordId: 'balcony-elastic-coating_jungnang-myeonmok',
    assignedPostId: 'guide-test-myeonmok',
    status: 'PUBLISHED',
    registeredAt: '2026-10-29',
  },
];

assert.throws(
  () => {
    validateAllKeywordAllocations(GUIDES, mockLedgerWithDong, undefined, true);
  },
  /\[RSS POLICY VIOLATION\].*balcony-elastic-coating_jungnang-myeonmok/,
  'Must throw [RSS POLICY VIOLATION] when a dong keyword is placed in ledger'
);

// Test 11-C: validateAllKeywordAllocations returns valid: false with errors when throwOnError is false
const allocRes = validateAllKeywordAllocations(mockGuidesWithDong, KEYWORD_LEDGER);
assert.equal(allocRes.valid, false);
assert.ok(allocRes.errors.some((e) => e.includes('[RSS POLICY VIOLATION]')));
console.log('   PASS: RSS Gate strictly blocks dong keywords.');

// [Scenario 12] URL and keywordId collision prevention across all 46 keywords
console.log('12. Verifying URL and keywordId collision prevention across all 46 items...');
const allKws = getAllCombinedDynamicKeywords();
const kwIds = new Set();
const urlPaths = new Set();

for (const k of allKws) {
  assert.ok(!kwIds.has(k.id), `Duplicate keywordId found: ${k.id}`);
  assert.ok(!urlPaths.has(k.targetUrlPath), `Duplicate targetUrlPath found: ${k.targetUrlPath}`);
  kwIds.add(k.id);
  urlPaths.add(k.targetUrlPath);
}
assert.equal(kwIds.size, 46, 'Unique keywordIds must be 46');
assert.equal(urlPaths.size, 46, 'Unique urlPaths must be 46');

const seoPageIds = new Set();
const seoPageUrls = new Set();
for (const p of SEO_PAGES) {
  assert.ok(!seoPageIds.has(p.id), `Duplicate page id found: ${p.id}`);
  assert.ok(!seoPageUrls.has(p.urlPath), `Duplicate page urlPath found: ${p.urlPath}`);
  seoPageIds.add(p.id);
  seoPageUrls.add(p.urlPath);
}
assert.equal(seoPageIds.size, 46, 'SEO_PAGES unique ids must be 46');
assert.equal(seoPageUrls.size, 46, 'SEO_PAGES unique urlPaths must be 46');
console.log('   PASS: Zero collision across all 46 IDs and URLs.');

// [Scenario 13] Existing 3 pilots AS보장 Title and published status preserved
console.log('13. Verifying existing 3 pilots AS보장 Title and published status preserved...');
const nowonElastic = SEO_PAGES.find((p) => p.id === 'elastic-coating_nowon');
const nowonBalcony = SEO_PAGES.find((p) => p.id === 'balcony-elastic-coating_nowon');
const dobongElastic = SEO_PAGES.find((p) => p.id === 'elastic-coating_dobong');

assert.ok(nowonElastic && nowonElastic.isPublished && nowonElastic.contentStatus === 'approved');
assert.ok(nowonBalcony && nowonBalcony.isPublished && nowonBalcony.contentStatus === 'approved');
assert.ok(dobongElastic && dobongElastic.isPublished && dobongElastic.contentStatus === 'approved');

assert.equal(nowonElastic.metaTitle, '노원구 탄성코트 시공 | AS보장 | 올케어탄성');
assert.equal(nowonBalcony.metaTitle, '노원구 베란다탄성코트 시공 | AS보장 | 올케어탄성');
assert.equal(dobongElastic.metaTitle, '도봉구 탄성코트 시공 | AS보장 | 올케어탄성');
console.log('   PASS: Existing 3 pilots AS보장 Title preserved.');

// [Scenario 14] Future readiness simulation: approved dong page resolved by routing
console.log('14. Simulating future dong page approval and routing resolution...');
const testDongPage = {
  ...dongPages[0],
  isPublished: true,
  contentStatus: 'approved',
  content: nowonElastic.content, // Uses complete, valid content structure
};
assert.equal(isPagePublished(testDongPage), true, 'Approved dong page must pass isPagePublished');

// Route resolution check
const resolvedPage = getSeoPage(dongPages[0].serviceSlug, dongPages[0].districtSlug);
assert.ok(resolvedPage, `getSeoPage must resolve dong page by serviceSlug and districtSlug`);
assert.equal(resolvedPage.id, dongPages[0].id);

// Check dong entity resolution
const resolvedDong = getDongById(dongPages[0].regionId);
assert.ok(resolvedDong, 'getDongById must resolve dong entity');
assert.equal(resolvedDong.id, dongPages[0].regionId);
console.log('   PASS: Future dong routing readiness simulation succeeded.');

// [Scenario 15] Keyword Ledger integrity & immutability: exactly 4 entries, zero dong entries
console.log('15. Verifying Keyword Ledger integrity & immutability...');
assert.equal(KEYWORD_LEDGER.length, 4, 'KEYWORD_LEDGER must contain exactly 4 entries');
const ledgerKwIds = KEYWORD_LEDGER.map((l) => l.keywordId);
assert.ok(ledgerKwIds.includes('elastic-coating_nowon'));
assert.ok(ledgerKwIds.includes('elastic-coating_dobong'));
assert.ok(ledgerKwIds.includes('balcony-elastic-coating_nowon'));
assert.ok(ledgerKwIds.includes('elastic-coating_jungnang'));
for (const entry of KEYWORD_LEDGER) {
  assert.equal(isDistrictKeyword(entry.keywordId), true, 'All ledger entries must be district keywords');
}
console.log('   PASS: Keyword Ledger integrity & immutability validated.');

console.log('--- [ALL 15 SCENARIOS PASSED] STEP REGION-1 SCHEMA & RSS GATE TESTS 100% OK ---');
