import { test, describe } from 'node:test';
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
import { KEYWORD_LEDGER } from './src/data/keywordRegistry.ts';

const DIST_DIR = path.resolve('dist');

describe('STEP DONG-1: Sanggye & Myeonmok Dong SEO Pilot Content Suite', () => {
  const sanggyePage = SEO_PAGES.find((p) => p.id === 'elastic-coating_nowon-sanggye');
  const myeonmokPage = SEO_PAGES.find((p) => p.id === 'elastic-coating_jungnang-myeonmok');

  test('1. Sanggye and Myeonmok pages exist in SEO_PAGES with correct identifiers', () => {
    assert.ok(sanggyePage, 'elastic-coating_nowon-sanggye must exist');
    assert.ok(myeonmokPage, 'elastic-coating_jungnang-myeonmok must exist');

    assert.equal(sanggyePage.serviceSlug, 'elastic-coating');
    assert.equal(sanggyePage.districtSlug, 'seoul-sanggye-dong');
    assert.equal(sanggyePage.regionLevel, 'dong');
    assert.equal(sanggyePage.parentRegionId, 'nowon');

    assert.equal(myeonmokPage.serviceSlug, 'elastic-coating');
    assert.equal(myeonmokPage.districtSlug, 'seoul-myeonmok-dong');
    assert.equal(myeonmokPage.regionLevel, 'dong');
    assert.equal(myeonmokPage.parentRegionId, 'jungnang');
  });

  test('2. Approved and Published status for Sanggye and Myeonmok (5 Gu + 2 Dong = 7)', () => {
    for (const [name, page] of [['Sanggye', sanggyePage], ['Myeonmok', myeonmokPage]]) {
      assert.equal(page.isPublished, true, `${name} isPublished must be true`);
      assert.equal(page.contentStatus, 'approved', `${name} contentStatus must be 'approved'`);
      assert.equal(isPagePublished(page), true, `${name} isPagePublished must return true`);
    }

    const published = getPublishedSeoPages();
    assert.equal(published.length, 7, 'Exactly 7 pages published (5 Gu + 2 Dong)');
    const publishedDong = published.filter((p) => p.regionLevel === 'dong');
    assert.equal(publishedDong.length, 2, 'Exactly 2 Dong pages published');
  });

  test('3. Content completeness validation (P0 gate)', () => {
    const sanggyeVal = validateSeoPageContentCompleteness(sanggyePage);
    assert.equal(sanggyeVal.valid, true, `Sanggye errors: ${sanggyeVal.errors.join(', ')}`);

    const myeonmokVal = validateSeoPageContentCompleteness(myeonmokPage);
    assert.equal(myeonmokVal.valid, true, `Myeonmok errors: ${myeonmokVal.errors.join(', ')}`);
  });

  test('4. Exact section structure and item counts (3 spaces, 4 wall conditions, 3 scope factors, 4 preps, 4 steps, 5 faqs)', () => {
    for (const [name, page] of [['Sanggye', sanggyePage], ['Myeonmok', myeonmokPage]]) {
      const c = page.content;
      assert.ok(c, `${name} content must be defined`);
      assert.equal(c.targetSpaces.length, 3, `${name} targetSpaces must have 3 items`);
      assert.equal(c.wallConditions.length, 4, `${name} wallConditions must have 4 items`);
      assert.equal(c.scopeFactors.length, 3, `${name} scopeFactors must have 3 items`);
      assert.equal(c.consultationPreps.length, 4, `${name} consultationPreps must have 4 items`);
      assert.equal(c.processSteps.length, 4, `${name} processSteps must have 4 items`);
      assert.equal(c.faqs.length, 5, `${name} faqs must have exactly 5 items`);
    }
  });

  test('5. Exact SEO Title, H1, Meta Description, and Gu-name exclusion rule', () => {
    // Title
    assert.equal(sanggyePage.metaTitle, '상계동 탄성코트 시공 | AS보장 | 올케어탄성');
    assert.equal(myeonmokPage.metaTitle, '면목동 탄성코트 시공 | AS보장 | 올케어탄성');

    // Title Gu exclusion rule
    assert.equal(sanggyePage.metaTitle.includes('노원구'), false, 'Title must not include Gu name');
    assert.equal(myeonmokPage.metaTitle.includes('중랑구'), false, 'Title must not include Gu name');

    // H1
    assert.equal(sanggyePage.h1, '상계동 탄성코트 시공 안내');
    assert.equal(myeonmokPage.h1, '면목동 탄성코트 시공 안내');

    // Meta Description starts with keyword
    assert.ok(sanggyePage.metaDescription.startsWith('상계동 탄성코트 시공'));
    assert.ok(myeonmokPage.metaDescription.startsWith('면목동 탄성코트 시공'));
    assert.notEqual(sanggyePage.metaDescription, myeonmokPage.metaDescription);
  });

  test('6. Content differentiation between Sanggye and Myeonmok', () => {
    const sSpaces = sanggyePage.content.targetSpaces.map((s) => s.title).join('|');
    const mSpaces = myeonmokPage.content.targetSpaces.map((s) => s.title).join('|');
    assert.notEqual(sSpaces, mSpaces, 'Target spaces must differ');

    const sFaqs = sanggyePage.content.faqs.map((f) => f.question).join('|');
    const mFaqs = myeonmokPage.content.faqs.map((f) => f.question).join('|');
    assert.notEqual(sFaqs, mFaqs, 'FAQs must differ');
  });

  test('7. HTML generated in dist/seo/ for Sanggye and Myeonmok', () => {
    const sanggyeHtml = path.join(DIST_DIR, 'seo', 'elastic-coating', 'seoul-sanggye-dong.html');
    const myeonmokHtml = path.join(DIST_DIR, 'seo', 'elastic-coating', 'seoul-myeonmok-dong.html');
    assert.equal(fs.existsSync(sanggyeHtml), true, 'Sanggye HTML must exist in dist');
    assert.equal(fs.existsSync(myeonmokHtml), true, 'Myeonmok HTML must exist in dist');
  });

  test('8. Links present in HTML Hub and URLs in XML Sitemap', () => {
    const hubPath = path.join(DIST_DIR, 'sitemap-seoul.html');
    if (fs.existsSync(hubPath)) {
      const hubHtml = fs.readFileSync(hubPath, 'utf8');
      assert.equal(hubHtml.includes('seoul-sanggye-dong.html'), true, 'Hub must have Sanggye link');
      assert.equal(hubHtml.includes('seoul-myeonmok-dong.html'), true, 'Hub must have Myeonmok link');
    }

    const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
    if (fs.existsSync(sitemapPath)) {
      const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
      assert.equal(sitemapXml.includes('seoul-sanggye-dong.html'), true, 'Sitemap must have Sanggye URL');
      assert.equal(sitemapXml.includes('seoul-myeonmok-dong.html'), true, 'Sitemap must have Myeonmok URL');
    }
  });

  test('9. KEYWORD_LEDGER unchanged (no dong keyword entries)', () => {
    for (const entry of KEYWORD_LEDGER) {
      assert.equal(entry.keywordId.includes('sanggye'), false, 'No sanggye in ledger');
      assert.equal(entry.keywordId.includes('myeonmok'), false, 'No myeonmok in ledger');
    }
  });

  test('10. Route resolution works via getSeoPage', () => {
    const sPage = getSeoPage('elastic-coating', 'seoul-sanggye-dong');
    assert.ok(sPage);
    assert.equal(sPage.id, sanggyePage.id);

    const mPage = getSeoPage('elastic-coating', 'seoul-myeonmok-dong');
    assert.ok(mPage);
    assert.equal(mPage.id, myeonmokPage.id);
  });
});
