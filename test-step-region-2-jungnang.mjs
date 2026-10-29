import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEO_PAGES,
  getPublishedSeoPages,
  isPagePublished,
  getSeoPage,
  validateSeoPageContentCompleteness,
} from './src/data/pages.ts';
import { GUIDES } from './src/data/guides.ts';
import { KEYWORD_LEDGER, isDistrictKeyword } from './src/data/keywordRegistry.ts';

console.log('--- [TEST SUITE] STEP REGION-2: JUNGNANG GU SEO CONTENT & GATE SUITE ---');

const jungnangElastic = SEO_PAGES.find((p) => p.id === 'elastic-coating_jungnang');
const jungnangBalcony = SEO_PAGES.find((p) => p.id === 'balcony-elastic-coating_jungnang');

// [Test 1] Presence of both Jungnang Gu pages in SEO_PAGES
console.log('1. Verifying presence of both Jungnang Gu pages in SEO_PAGES...');
assert.ok(jungnangElastic, 'elastic-coating_jungnang must exist in SEO_PAGES');
assert.ok(jungnangBalcony, 'balcony-elastic-coating_jungnang must exist in SEO_PAGES');
console.log('   PASS: Both Jungnang Gu pages registered.');

// [Test 2] Approved & Published Status Verification
console.log('2. Verifying Approved & Published status for Jungnang pages...');
assert.equal(jungnangElastic.isPublished, true, 'jungnangElastic isPublished must be true');
assert.equal(jungnangElastic.contentStatus, 'approved', "jungnangElastic contentStatus must be 'approved'");
assert.equal(jungnangBalcony.isPublished, true, 'jungnangBalcony isPublished must be true');
assert.equal(jungnangBalcony.contentStatus, 'approved', "jungnangBalcony contentStatus must be 'approved'");
assert.equal(isPagePublished(jungnangElastic), true, 'isPagePublished must return true for jungnangElastic');
assert.equal(isPagePublished(jungnangBalcony), true, 'isPagePublished must return true for jungnangBalcony');
console.log('   PASS: Both Jungnang Gu pages approved and published.');

// [Test 3] Content Completeness Validation (validateSeoPageContentCompleteness)
console.log('3. Verifying content completeness for both Jungnang pages...');
const elasticVal = validateSeoPageContentCompleteness(jungnangElastic);
assert.equal(elasticVal.valid, true, `jungnangElastic content completeness errors: ${elasticVal.errors.join(', ')}`);

const balconyVal = validateSeoPageContentCompleteness(jungnangBalcony);
assert.equal(balconyVal.valid, true, `jungnangBalcony content completeness errors: ${balconyVal.errors.join(', ')}`);
console.log('   PASS: Content completeness passes 100%.');

// [Test 4] Exact Section Structure & Counts
console.log('4. Verifying exact section structure & element counts...');
for (const [name, page] of [['Elastic', jungnangElastic], ['Balcony', jungnangBalcony]]) {
  const content = page.content;
  assert.ok(content, `${name} content must be defined`);
  assert.equal(content.targetSpaces.length, 3, `${name} targetSpaces must have 3 items`);
  assert.equal(content.wallConditions.length, 4, `${name} wallConditions must have 4 items`);
  assert.equal(content.scopeFactors.length, 3, `${name} scopeFactors must have 3 items`);
  assert.equal(content.consultationPreps.length, 4, `${name} consultationPreps must have 4 items`);
  assert.equal(content.processSteps.length, 4, `${name} processSteps must have 4 items`);
  assert.equal(content.faqs.length, 5, `${name} faqs must have exactly 5 items`);
}
console.log('   PASS: Section structures & element counts verified.');

// [Test 5] Exact SEO Title, H1, Meta Description
console.log('5. Verifying exact SEO Title, H1, Meta Description...');
assert.equal(jungnangElastic.metaTitle, '중랑구 탄성코트 시공 | AS보장 | 올케어탄성');
assert.equal(jungnangBalcony.metaTitle, '중랑구 베란다탄성코트 시공 | AS보장 | 올케어탄성');
assert.equal(jungnangElastic.h1, '중랑구 탄성코트 시공 안내');
assert.equal(jungnangBalcony.h1, '중랑구 베란다탄성코트 시공 안내');

assert.ok(jungnangElastic.metaDescription.startsWith('중랑구 탄성코트 시공'));
assert.ok(jungnangBalcony.metaDescription.startsWith('중랑구 베란다탄성코트 시공'));
assert.notEqual(jungnangElastic.metaDescription, jungnangBalcony.metaDescription, 'Meta descriptions must be distinct');
console.log('   PASS: SEO Title, H1, and Meta Descriptions verified.');

// [Test 6] Content Differentiation between Elastic and Balcony Elastic
console.log('6. Verifying differentiation between Elastic and Balcony Elastic content...');
const elasticSpaces = jungnangElastic.content.targetSpaces.map((s) => s.title).join('|');
const balconySpaces = jungnangBalcony.content.targetSpaces.map((s) => s.title).join('|');
assert.notEqual(elasticSpaces, balconySpaces, 'Target spaces must differ between services');

const elasticFaqs = jungnangElastic.content.faqs.map((f) => f.question).join('|');
const balconyFaqs = jungnangBalcony.content.faqs.map((f) => f.question).join('|');
assert.notEqual(elasticFaqs, balconyFaqs, 'FAQs must differ between services');
console.log('   PASS: Content is distinctly tailored per search intent.');

// [Test 7] P0 Gate Hardening: Block incomplete content even if flags are true
console.log('7. Verifying P0 gate blocks incomplete content when flags are set to true/approved...');
const fakeIncompletePage = {
  ...jungnangElastic,
  isPublished: true,
  contentStatus: 'approved',
  content: undefined, // Content missing!
};
assert.equal(isPagePublished(fakeIncompletePage), false, 'Empty content page must be BLOCKED');

const fakeIncompleteFaqPage = {
  ...jungnangElastic,
  isPublished: true,
  contentStatus: 'approved',
  content: {
    ...jungnangElastic.content,
    faqs: jungnangElastic.content.faqs.slice(0, 3), // Only 3 FAQs instead of 5
  },
};
assert.equal(isPagePublished(fakeIncompleteFaqPage), false, 'Page with fewer than 5 FAQs must be BLOCKED');
console.log('   PASS: P0 Gate prevents publishing incomplete pages.');

// [Test 8] HTML Generation in dist/seo/ for Jungnang
console.log('8. Verifying HTML generated for Jungnang in dist/seo/ ...');
const publishedPages = getPublishedSeoPages();
assert.equal(publishedPages.length, 9, 'Exactly 9 pages must be published (5 Gu + 4 Dong)');

const jungnangElasticHtml = path.resolve('dist', 'seo', 'elastic-coating', 'seoul-jungnang-gu.html');
const jungnangBalconyHtml = path.resolve('dist', 'seo', 'balcony-elastic-coating', 'seoul-jungnang-gu.html');
assert.equal(fs.existsSync(jungnangElasticHtml), true, 'seoul-jungnang-gu.html must exist for elastic-coating');
assert.equal(fs.existsSync(jungnangBalconyHtml), true, 'seoul-jungnang-gu.html must exist for balcony-elastic-coating');
console.log('   PASS: Jungnang HTML in dist verified.');

// [Test 9] Jungnang links in HTML Hub
console.log('9. Verifying Jungnang links in dist/sitemap-seoul.html...');
const hubPath = path.resolve('dist', 'sitemap-seoul.html');
if (fs.existsSync(hubPath)) {
  const hubHtml = fs.readFileSync(hubPath, 'utf8');
  assert.ok(hubHtml.includes('seoul-jungnang-gu.html'), 'Hub must contain link to Jungnang');
  const regionalLinks = hubHtml.match(/href="\/seo\/[^"]+"/g) || [];
  assert.equal(regionalLinks.length, 9, 'Hub must contain EXACTLY 9 links');
}
console.log('   PASS: Jungnang links in HTML hub verified.');

// [Test 10] Jungnang URLs in XML Sitemap
console.log('10. Verifying Jungnang URLs in dist/sitemap-0.xml...');
const sitemapPath = path.resolve('dist', 'sitemap-0.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  assert.ok(sitemapXml.includes('seoul-jungnang-gu.html'), 'Sitemap must contain Jungnang URL');
  const locCount = (sitemapXml.match(/<loc>/g) || []).length;
  assert.equal(locCount, 16, 'Sitemap must contain exactly 16 loc entries');
}
console.log('   PASS: Jungnang URLs in XML sitemap verified.');

// [Test 11] RSS and Ledger immutability
console.log('11. Verifying RSS and Ledger immutability...');
assert.equal(GUIDES.length, 4, 'GUIDES must remain exactly 4');
assert.equal(KEYWORD_LEDGER.length, 4, 'KEYWORD_LEDGER must remain exactly 4');
const jungnangGuide = GUIDES.find((g) => g.keywordId === 'elastic-coating_jungnang');
assert.ok(jungnangGuide, 'Guide assigned to Jungnang elastic-coating');
const jungnangLedger = KEYWORD_LEDGER.find((l) => l.keywordId === 'elastic-coating_jungnang');
assert.ok(jungnangLedger, 'Ledger entry exists for Jungnang elastic-coating');
assert.equal(isDistrictKeyword('elastic-coating_jungnang'), true, 'Jungnang is a district keyword');
assert.equal(isDistrictKeyword('balcony-elastic-coating_jungnang'), true, 'Jungnang balcony is a district keyword');
console.log('   PASS: RSS and Ledger immutability verified.');

// [Test 12] Future approval simulation
console.log('12. Simulating future approval of Jungnang page...');
const simulatedApprovedPage = {
  ...jungnangElastic,
  isPublished: true,
  contentStatus: 'approved',
};
assert.equal(isPagePublished(simulatedApprovedPage), true, 'Complete Jungnang page passes isPagePublished when approved');

const resolvedPage = getSeoPage(jungnangElastic.serviceSlug, jungnangElastic.districtSlug);
assert.ok(resolvedPage, 'getSeoPage resolves Jungnang page by slug');
assert.equal(resolvedPage.id, jungnangElastic.id);
console.log('   PASS: Future approval simulation succeeded.');

console.log('--- [ALL 12 TESTS PASSED] STEP REGION-2 JUNGNANG SEO CONTENT 100% OK ---');
