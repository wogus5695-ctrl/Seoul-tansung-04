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

const DIST_DIR = path.resolve('dist');

describe('STEP DONG-4A: North Dong SEO Batch Expansion Suite (8 Drafts)', () => {
  const targetIds = [
    'elastic-coating_nowon-junggye',
    'balcony-elastic-coating_nowon-junggye',
    'elastic-coating_nowon-hagye',
    'balcony-elastic-coating_nowon-hagye',
    'elastic-coating_jungnang-sangbong',
    'balcony-elastic-coating_jungnang-sangbong',
    'elastic-coating_jungnang-junghwa',
    'balcony-elastic-coating_jungnang-junghwa',
  ];

  const targetPages = targetIds.map((id) => {
    const page = SEO_PAGES.find((p) => p.id === id);
    assert.ok(page, `Target page ${id} must exist in SEO_PAGES`);
    return page;
  });

  test('1. Exactly 8 target draft pages exist in SEO_PAGES and total count is 46', () => {
    assert.equal(targetPages.length, 8, 'Exactly 8 target pages');
    assert.equal(SEO_PAGES.length, 46, 'Total SEO_PAGES must be exactly 46');
  });

  test('2. Approved and Published status: isPublished=true, contentStatus=approved, isPagePublished=true', () => {
    for (const page of targetPages) {
      assert.equal(page.isPublished, true, `Page ${page.id} must have isPublished: true`);
      assert.equal(page.contentStatus, 'approved', `Page ${page.id} must have contentStatus: 'approved'`);
      assert.equal(isPagePublished(page), true, `isPagePublished must return true for ${page.id}`);
    }

    const published = getPublishedSeoPages();
    assert.equal(published.length, 17, 'Exactly 17 pages published (5 Gu + 12 Dong)');
    const unpublished = SEO_PAGES.filter((p) => !published.includes(p));
    assert.equal(unpublished.length, 29, 'Exactly 29 pages unpublished (19 Gu + 10 Dong)');
  });

  test('3. Metadata conformity: Title ends with AS보장, H1 match, Meta Description starts with keyword', () => {
    const expected = [
      {
        id: 'elastic-coating_nowon-junggye',
        title: '중계동 탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '중계동 탄성코트 시공 안내',
        descPrefix: '중계동 탄성코트 시공',
        url: '/seo/elastic-coating/seoul-junggye-dong.html',
      },
      {
        id: 'balcony-elastic-coating_nowon-junggye',
        title: '중계동 베란다탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '중계동 베란다탄성코트 시공 안내',
        descPrefix: '중계동 베란다탄성코트 시공',
        url: '/seo/balcony-elastic-coating/seoul-junggye-dong.html',
      },
      {
        id: 'elastic-coating_nowon-hagye',
        title: '하계동 탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '하계동 탄성코트 시공 안내',
        descPrefix: '하계동 탄성코트 시공',
        url: '/seo/elastic-coating/seoul-hagye-dong.html',
      },
      {
        id: 'balcony-elastic-coating_nowon-hagye',
        title: '하계동 베란다탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '하계동 베란다탄성코트 시공 안내',
        descPrefix: '하계동 베란다탄성코트 시공',
        url: '/seo/balcony-elastic-coating/seoul-hagye-dong.html',
      },
      {
        id: 'elastic-coating_jungnang-sangbong',
        title: '상봉동 탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '상봉동 탄성코트 시공 안내',
        descPrefix: '상봉동 탄성코트 시공',
        url: '/seo/elastic-coating/seoul-sangbong-dong.html',
      },
      {
        id: 'balcony-elastic-coating_jungnang-sangbong',
        title: '상봉동 베란다탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '상봉동 베란다탄성코트 시공 안내',
        descPrefix: '상봉동 베란다탄성코트 시공',
        url: '/seo/balcony-elastic-coating/seoul-sangbong-dong.html',
      },
      {
        id: 'elastic-coating_jungnang-junghwa',
        title: '중화동 탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '중화동 탄성코트 시공 안내',
        descPrefix: '중화동 탄성코트 시공',
        url: '/seo/elastic-coating/seoul-junghwa-dong.html',
      },
      {
        id: 'balcony-elastic-coating_jungnang-junghwa',
        title: '중화동 베란다탄성코트 시공 | AS보장 | 올케어탄성',
        h1: '중화동 베란다탄성코트 시공 안내',
        descPrefix: '중화동 베란다탄성코트 시공',
        url: '/seo/balcony-elastic-coating/seoul-junghwa-dong.html',
      },
    ];

    for (const exp of expected) {
      const page = SEO_PAGES.find((p) => p.id === exp.id);
      assert.ok(page, `Page ${exp.id} must exist`);
      assert.equal(page.metaTitle, exp.title);
      assert.equal(page.h1, exp.h1);
      assert.ok(page.metaDescription.startsWith(exp.descPrefix));
      assert.equal(page.urlPath, exp.url);
    }
  });

  test('4. Content completeness & P0 validation for all 8 draft pages', () => {
    for (const page of targetPages) {
      const val = validateSeoPageContentCompleteness(page);
      assert.equal(val.valid, true, `Validation failed for ${page.id}: ${val.errors.join(', ')}`);
      assert.equal(page.content.targetSpaces.length, 3, `${page.id} targetSpaces count`);
      assert.equal(page.content.wallConditions.length, 4, `${page.id} wallConditions count`);
      assert.equal(page.content.scopeFactors.length, 3, `${page.id} scopeFactors count`);
      assert.equal(page.content.consultationPreps.length, 4, `${page.id} consultationPreps count`);
      assert.equal(page.content.processSteps.length, 4, `${page.id} processSteps count`);
      assert.equal(page.content.faqs.length, 5, `${page.id} faqs count`);

      // Check no false AS claims in FAQs
      for (const faq of page.content.faqs) {
        assert.equal(faq.answer.includes('AS 보장 기간'), false, `No fake AS claims in ${page.id}`);
        assert.equal(faq.answer.includes('결로 완전 방지'), false, `No fake claims in ${page.id}`);
      }
    }
  });

  test('5. HTML files generated in dist/ for all 8 published pages', () => {
    for (const page of targetPages) {
      const relPath = page.urlPath.startsWith('/') ? page.urlPath.slice(1) : page.urlPath;
      const htmlPath = path.join(DIST_DIR, relPath);
      assert.equal(fs.existsSync(htmlPath), true, `Published page HTML must exist: ${htmlPath}`);
    }
  });

  test('6. Dist HTML count, Sitemap and Hub integrity verified for 17 published pages', () => {
    const hubPath = path.join(DIST_DIR, 'sitemap-seoul.html');
    if (fs.existsSync(hubPath)) {
      const hubHtml = fs.readFileSync(hubPath, 'utf8');
      const seoLinks = hubHtml.match(/href="\/seo\/[^"]+"/g) || [];
      assert.equal(seoLinks.length, 17, 'Hub must contain exactly 17 links');

      for (const page of targetPages) {
        assert.equal(hubHtml.includes(page.urlPath), true, `Hub must link to published page: ${page.urlPath}`);
      }
    }

    const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
    if (fs.existsSync(sitemapPath)) {
      const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
      const locs = sitemapXml.match(/<loc>[^<]+<\/loc>/g) || [];
      assert.equal(locs.length, 24, 'Sitemap must contain exactly 24 URLs');

      for (const page of targetPages) {
        const slug = page.districtSlug;
        assert.equal(sitemapXml.includes(slug), true, `Sitemap must include published slug: ${slug}`);
      }
    }
  });
});
