import assert from 'node:assert';
import { SEO_PAGES, isPagePublished, validateSeoPageContentCompleteness } from './src/data/pages.ts';

console.log('================================================================');
console.log('STEP REGION-EXPAND-1A: Gu-level SEO Content Build Verification');
console.log('================================================================');

const TARGET_IDS = [
  'elastic-coating_seongbuk',
  'balcony-elastic-coating_seongbuk',
  'elastic-coating_dongdaemun',
  'balcony-elastic-coating_dongdaemun',
  'elastic-coating_gangbuk',
  'balcony-elastic-coating_gangbuk',
  'balcony-elastic-coating_dobong'
];

const TARGET_DETAILS = {
  'elastic-coating_seongbuk': {
    regionName: '성북구',
    serviceName: '탄성코트',
    expectedPath: '/seo/elastic-coating/seoul-seongbuk-gu.html',
    expectedTitle: '성북구 탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '성북구 탄성코트 시공 안내'
  },
  'balcony-elastic-coating_seongbuk': {
    regionName: '성북구',
    serviceName: '베란다탄성코트',
    expectedPath: '/seo/balcony-elastic-coating/seoul-seongbuk-gu.html',
    expectedTitle: '성북구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '성북구 베란다탄성코트 시공 안내'
  },
  'elastic-coating_dongdaemun': {
    regionName: '동대문구',
    serviceName: '탄성코트',
    expectedPath: '/seo/elastic-coating/seoul-dongdaemun-gu.html',
    expectedTitle: '동대문구 탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '동대문구 탄성코트 시공 안내'
  },
  'balcony-elastic-coating_dongdaemun': {
    regionName: '동대문구',
    serviceName: '베란다탄성코트',
    expectedPath: '/seo/balcony-elastic-coating/seoul-dongdaemun-gu.html',
    expectedTitle: '동대문구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '동대문구 베란다탄성코트 시공 안내'
  },
  'elastic-coating_gangbuk': {
    regionName: '강북구',
    serviceName: '탄성코트',
    expectedPath: '/seo/elastic-coating/seoul-gangbuk-gu.html',
    expectedTitle: '강북구 탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '강북구 탄성코트 시공 안내'
  },
  'balcony-elastic-coating_gangbuk': {
    regionName: '강북구',
    serviceName: '베란다탄성코트',
    expectedPath: '/seo/balcony-elastic-coating/seoul-gangbuk-gu.html',
    expectedTitle: '강북구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '강북구 베란다탄성코트 시공 안내'
  },
  'balcony-elastic-coating_dobong': {
    regionName: '도봉구',
    serviceName: '베란다탄성코트',
    expectedPath: '/seo/balcony-elastic-coating/seoul-dobong-gu.html',
    expectedTitle: '도봉구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
    expectedH1: '도봉구 베란다탄성코트 시공 안내'
  }
};

console.log(`\n[CHECK 1] Verifying total registry counts...`);
console.log(`Total SEO_PAGES: ${SEO_PAGES.length}`);
assert.strictEqual(SEO_PAGES.length, 100, 'Total SEO_PAGES count must be 100');

const publishedPages = SEO_PAGES.filter(p => isPagePublished(p));
const draftPages = SEO_PAGES.filter(p => !isPagePublished(p));
console.log(`Published SEO Pages: ${publishedPages.length} (Expected: 24)`);
console.log(`Unpublished (Draft) SEO Pages: ${draftPages.length} (Expected: 76)`);
assert.strictEqual(publishedPages.length, 24, 'Published SEO pages must be exactly 24');
assert.strictEqual(draftPages.length, 76, 'Draft SEO pages must be exactly 76');

console.log(`\n[CHECK 2] Verifying existing published Dobong page...`);
const existingDobong = SEO_PAGES.find(p => p.id === 'elastic-coating_dobong');
assert.ok(existingDobong, 'elastic-coating_dobong must exist');
assert.strictEqual(existingDobong.isPublished, true, 'elastic-coating_dobong must be isPublished: true');
assert.strictEqual(existingDobong.contentStatus, 'approved', 'elastic-coating_dobong must be approved');
assert.strictEqual(isPagePublished(existingDobong), true, 'elastic-coating_dobong isPagePublished must be true');
console.log('✓ Existing Dobong elastic-coating untouched and published.');

console.log(`\n[CHECK 3] Verifying 7 Gu targets individual content & status...`);
TARGET_IDS.forEach(id => {
  const page = SEO_PAGES.find(p => p.id === id);
  assert.ok(page, `Target page ${id} must exist in SEO_PAGES`);
  const detail = TARGET_DETAILS[id];

  // 1. Status Approval Check
  assert.strictEqual(page.isPublished, true, `${id}: isPublished must be true`);
  assert.strictEqual(page.contentStatus, 'approved', `${id}: contentStatus must be approved`);
  assert.strictEqual(isPagePublished(page), true, `${id}: isPagePublished must evaluate to true`);

  // 2. URL check
  assert.strictEqual(page.urlPath, detail.expectedPath, `${id}: path must be ${detail.expectedPath}`);

  // 3. Completeness validation check
  const valResult = validateSeoPageContentCompleteness(page);
  assert.ok(valResult.valid, `${id}: Content must pass completeness validation. Errors: ${valResult.errors?.join(', ')}`);

  // 4. Meta & H1 checks
  assert.strictEqual(page.metaTitle, detail.expectedTitle, `${id}: Title mismatch. Got: ${page.metaTitle}`);
  assert.strictEqual(page.h1, detail.expectedH1, `${id}: H1 mismatch. Got: ${page.h1}`);
  assert.ok(page.metaDescription.startsWith(`${detail.regionName} ${detail.serviceName}`),
    `${id}: Meta description must start with '${detail.regionName} ${detail.serviceName}'`);

  // 5. Structure counts in page.content
  assert.ok(page.content, `${id}: page.content must exist`);
  assert.strictEqual(page.content.targetSpaces.length, 3, `${id}: targetSpaces count must be 3`);
  assert.strictEqual(page.content.wallConditions.length, 4, `${id}: wallConditions count must be 4`);
  assert.strictEqual(page.content.scopeFactors.length, 3, `${id}: scopeFactors count must be 3`);
  assert.strictEqual(page.content.consultationPreps.length, 4, `${id}: consultationPreps count must be 4`);
  assert.strictEqual(page.content.processSteps.length, 4, `${id}: processSteps count must be 4`);
  assert.strictEqual(page.content.faqs.length, 5, `${id}: faqs count must be exactly 5`);

  // 6. Non-empty check for items
  page.content.faqs.forEach((faq, idx) => {
    assert.ok(faq.question && faq.question.length > 5, `${id}: FAQ[${idx}] question is empty or too short`);
    assert.ok(faq.answer && faq.answer.length > 10, `${id}: FAQ[${idx}] answer is empty or too short`);
  });

  console.log(`✓ ${id} (${detail.regionName} ${detail.serviceName}) verified: draft isolated, complete structure, title & H1 valid.`);
});

console.log(`\n================================================================`);
console.log('ALL STEP REGION-EXPAND-1A VERIFICATION CHECKS PASSED (7/7)!');
console.log('================================================================');
