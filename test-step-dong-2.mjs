import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEO_PAGES,
  getPublishedSeoPages,
  isPagePublished,
  validateSeoPageContentCompleteness,
} from './src/data/pages.ts';
import { KEYWORD_LEDGER } from './src/data/keywordRegistry.ts';
import { GUIDES } from './src/data/guides.ts';
import { SITE_CONTACT } from './src/data/siteConfig.ts';

const DIST_DIR = path.resolve('dist');

describe('STEP DONG-2: Dong SEO Pilot Production Release Suite', () => {
  const sanggyePage = SEO_PAGES.find((p) => p.id === 'elastic-coating_nowon-sanggye');
  const myeonmokPage = SEO_PAGES.find((p) => p.id === 'elastic-coating_jungnang-myeonmok');

  test('1. Sanggye and Myeonmok published and approved in SEO_PAGES', () => {
    assert.ok(sanggyePage, 'Sanggye page must exist');
    assert.ok(myeonmokPage, 'Myeonmok page must exist');

    assert.equal(sanggyePage.isPublished, true, 'Sanggye must be isPublished: true');
    assert.equal(sanggyePage.contentStatus, 'approved', 'Sanggye must be contentStatus: approved');
    assert.equal(isPagePublished(sanggyePage), true, 'Sanggye must pass isPagePublished');

    assert.equal(myeonmokPage.isPublished, true, 'Myeonmok must be isPublished: true');
    assert.equal(myeonmokPage.contentStatus, 'approved', 'Myeonmok must be contentStatus: approved');
    assert.equal(isPagePublished(myeonmokPage), true, 'Myeonmok must pass isPagePublished');
  });

  test('2. Total published count is exactly 7 (5 Gu + 2 Dong) and unapproved count is 39 (19 Gu + 20 Dong)', () => {
    const published = getPublishedSeoPages();
    assert.equal(published.length, 7, 'Exactly 7 published SEO pages');

    const publishedGu = published.filter((p) => p.regionLevel === 'gu');
    const publishedDong = published.filter((p) => p.regionLevel === 'dong');
    assert.equal(publishedGu.length, 5, '5 Gu pages published');
    assert.equal(publishedDong.length, 2, '2 Dong pages published');

    const unpublished = SEO_PAGES.filter((p) => !isPagePublished(p));
    assert.equal(unpublished.length, 39, 'Exactly 39 unpublished SEO pages (19 Gu + 20 Dong)');
    const unpublishedGu = unpublished.filter((p) => p.regionLevel === 'gu');
    const unpublishedDong = unpublished.filter((p) => p.regionLevel === 'dong');
    assert.equal(unpublishedGu.length, 19, '19 Gu pages unpublished');
    assert.equal(unpublishedDong.length, 20, '20 Dong pages unpublished');
  });

  test('3. P0 Completeness validation passes for both published Dong pages', () => {
    const sVal = validateSeoPageContentCompleteness(sanggyePage);
    assert.equal(sVal.valid, true, `Sanggye errors: ${sVal.errors.join(', ')}`);

    const mVal = validateSeoPageContentCompleteness(myeonmokPage);
    assert.equal(mVal.valid, true, `Myeonmok errors: ${mVal.errors.join(', ')}`);
  });

  test('4. SEO Title, H1, Meta Description, and AS보장 Title-only policy', () => {
    // Title includes AS보장
    assert.equal(sanggyePage.metaTitle, '상계동 탄성코트 시공 | AS보장 | 올케어탄성');
    assert.equal(myeonmokPage.metaTitle, '면목동 탄성코트 시공 | AS보장 | 올케어탄성');

    // Title excludes parent Gu name
    assert.equal(sanggyePage.metaTitle.includes('노원구'), false);
    assert.equal(myeonmokPage.metaTitle.includes('중랑구'), false);

    // H1
    assert.equal(sanggyePage.h1, '상계동 탄성코트 시공 안내');
    assert.equal(myeonmokPage.h1, '면목동 탄성코트 시공 안내');

    // Meta Description does NOT contain AS보장
    assert.equal(sanggyePage.metaDescription.includes('AS'), false, 'Sanggye desc must not contain AS');
    assert.equal(myeonmokPage.metaDescription.includes('AS'), false, 'Myeonmok desc must not contain AS');

    // Hero copy does NOT contain AS
    assert.equal(sanggyePage.heroCopy.includes('AS'), false);
    assert.equal(myeonmokPage.heroCopy.includes('AS'), false);

    // FAQs do NOT contain AS guarantees
    for (const faq of [...sanggyePage.content.faqs, ...myeonmokPage.content.faqs]) {
      assert.equal(faq.question.includes('AS'), false);
      assert.equal(faq.answer.includes('AS보장'), false);
    }
  });

  test('5. Safe text wording: No exaggerated drying time, no unverified claims', () => {
    // Sanggye FAQ 4
    const sFaq4 = sanggyePage.content.faqs[3].answer;
    assert.equal(sFaq4.includes('24~48시간'), false);
    assert.equal(sFaq4.includes('3~5일'), false);
    assert.ok(sFaq4.includes('현장 환경에 따라 달라지므로') || sFaq4.includes('현장 조건에 맞춰'));

    // Myeonmok FAQ 4
    const mFaq4 = myeonmokPage.content.faqs[3].answer;
    assert.equal(mFaq4.includes('24~48시간'), false);
    assert.equal(mFaq4.includes('3~5일'), false);
    assert.ok(mFaq4.includes('현장 상태에 따라 달라지므로') || mFaq4.includes('맞춤 안내'));

    // No unverified eco claims in process steps
    const mStep3 = myeonmokPage.content.processSteps[2].title;
    assert.equal(mStep3.includes('친환경'), false, 'Step 3 must not claim unverified eco cert');
  });

  test('6. Contact phone numbers consistency (010-8492-6900)', () => {
    assert.equal(SITE_CONTACT.phone, '010-8492-6900');
    assert.equal(SITE_CONTACT.telHref, 'tel:01084926900');
  });

  test('7. RSS Feed remains strictly 4 items, KEYWORD_LEDGER unchanged (0 Dong RSS)', () => {
    assert.equal(GUIDES.length, 4, 'GUIDES count must remain 4');
    assert.equal(KEYWORD_LEDGER.length, 4, 'KEYWORD_LEDGER count must remain 4');
    for (const entry of KEYWORD_LEDGER) {
      assert.equal(entry.keywordId.includes('sanggye'), false, 'No sanggye in ledger');
      assert.equal(entry.keywordId.includes('myeonmok'), false, 'No myeonmok in ledger');
    }
  });

  test('8. HTML generated in dist for all 7 published SEO pages', () => {
    const expected = [
      'dist/seo/elastic-coating/seoul-nowon-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      'dist/seo/elastic-coating/seoul-dobong-gu.html',
      'dist/seo/elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/elastic-coating/seoul-sanggye-dong.html',
      'dist/seo/elastic-coating/seoul-myeonmok-dong.html',
    ];

    for (const f of expected) {
      assert.ok(fs.existsSync(f), `${f} must exist in dist`);
    }
  });

  test('9. HTML Hub (dist/sitemap-seoul.html) links count exactly 7', () => {
    const hubPath = path.join(DIST_DIR, 'sitemap-seoul.html');
    assert.ok(fs.existsSync(hubPath));
    const hubHtml = fs.readFileSync(hubPath, 'utf8');

    const regionalLinks = hubHtml.match(/href="\/seo\/[^"]+"/g) || [];
    assert.equal(regionalLinks.length, 7, 'Hub must contain exactly 7 SEO links');

    assert.ok(hubHtml.includes('seoul-sanggye-dong.html'));
    assert.ok(hubHtml.includes('seoul-myeonmok-dong.html'));
    assert.ok(hubHtml.includes('상계동 탄성코트'));
    assert.ok(hubHtml.includes('면목동 탄성코트'));
  });

  test('10. XML Sitemap contains exactly 14 URLs', () => {
    const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
    assert.ok(fs.existsSync(sitemapPath));
    const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');

    const locs = sitemapXml.match(/<loc>[^<]+<\/loc>/g) || [];
    assert.equal(locs.length, 14, 'Sitemap must contain exactly 14 URLs');

    assert.ok(sitemapXml.includes('/seo/elastic-coating/seoul-sanggye-dong.html'));
    assert.ok(sitemapXml.includes('/seo/elastic-coating/seoul-myeonmok-dong.html'));
  });
});
