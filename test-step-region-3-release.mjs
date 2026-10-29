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
import { REGIONS } from './src/data/regions.ts';
import { DONGS } from './src/data/dongs.ts';
import { SERVICES } from './src/data/services.ts';
import { GUIDES } from './src/data/guides.ts';
import { KEYWORD_LEDGER, getAllDynamicKeywords, getAllCombinedDynamicKeywords } from './src/data/keywordRegistry.ts';

const DIST_DIR = path.resolve('dist');

describe('STEP REGION-3: Jungnang Gu SEO Production Release Suite', () => {
  const jungnangElastic = SEO_PAGES.find((p) => p.id === 'elastic-coating_jungnang');
  const jungnangBalcony = SEO_PAGES.find((p) => p.id === 'balcony-elastic-coating_jungnang');

  test('1. Jungnang Gu pages approved and published status verified', () => {
    assert.ok(jungnangElastic, 'elastic-coating_jungnang must exist in SEO_PAGES');
    assert.ok(jungnangBalcony, 'balcony-elastic-coating_jungnang must exist in SEO_PAGES');

    assert.equal(jungnangElastic.isPublished, true, 'jungnangElastic isPublished must be true');
    assert.equal(jungnangElastic.contentStatus, 'approved', "jungnangElastic contentStatus must be 'approved'");
    assert.equal(jungnangBalcony.isPublished, true, 'jungnangBalcony isPublished must be true');
    assert.equal(jungnangBalcony.contentStatus, 'approved', "jungnangBalcony contentStatus must be 'approved'");

    assert.equal(isPagePublished(jungnangElastic), true, 'isPagePublished must be true for jungnangElastic');
    assert.equal(isPagePublished(jungnangBalcony), true, 'isPagePublished must be true for jungnangBalcony');
  });

  test('2. Total published SEO pages count is exactly 5 and Dong published count is 0', () => {
    const published = getPublishedSeoPages();
    assert.equal(published.length, 5, 'Exactly 5 regional SEO pages must be published');

    const publishedGu = published.filter((p) => p.regionLevel === 'gu');
    const publishedDong = published.filter((p) => p.regionLevel === 'dong');
    assert.equal(publishedGu.length, 5, 'All 5 published pages are Gu level');
    assert.equal(publishedDong.length, 0, 'Zero Dong pages published');

    // Expected 5 published page IDs
    const publishedIds = published.map((p) => p.id).sort();
    const expectedIds = [
      'balcony-elastic-coating_jungnang',
      'balcony-elastic-coating_nowon',
      'elastic-coating_dobong',
      'elastic-coating_jungnang',
      'elastic-coating_nowon',
    ].sort();
    assert.deepEqual(publishedIds, expectedIds);
  });

  test('3. All 22 Dong pages remain strictly Draft and unpublished', () => {
    const dongPages = SEO_PAGES.filter((p) => p.regionLevel === 'dong');
    assert.equal(dongPages.length, 22, 'Must have 22 Dong pages');
    for (const dp of dongPages) {
      assert.equal(dp.isPublished, false, `Dong page ${dp.id} isPublished must be false`);
      assert.equal(dp.contentStatus, 'draft', `Dong page ${dp.id} contentStatus must be 'draft'`);
      assert.equal(isPagePublished(dp), false, `Dong page ${dp.id} isPagePublished must be false`);
    }
  });

  test('4. Build output files exist in dist/seo for all 5 published pages and zero unpublished', () => {
    const expectedFiles = [
      'dist/seo/elastic-coating/seoul-nowon-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      'dist/seo/elastic-coating/seoul-dobong-gu.html',
      'dist/seo/elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
    ];

    for (const f of expectedFiles) {
      assert.ok(fs.existsSync(path.resolve(f)), `${f} must exist in dist`);
    }

    // Ensure all 19 unpublished Gu pages and 22 Dong pages are NOT generated
    const unpublishedGu = SEO_PAGES.filter((p) => p.regionLevel === 'gu' && !p.isPublished);
    assert.equal(unpublishedGu.length, 19, 'Must have 19 unpublished Gu pages');
    for (const p of unpublishedGu) {
      const fullPath = path.resolve('dist', p.urlPath.replace(/^\//, ''));
      assert.equal(fs.existsSync(fullPath), false, `Unpublished Gu HTML ${fullPath} must NOT exist`);
    }

    for (const d of DONGS) {
      for (const s of SERVICES) {
        const dongPath = path.resolve('dist', 'seo', s.slug, `${d.slug}.html`);
        assert.equal(fs.existsSync(dongPath), false, `Dong HTML ${dongPath} must NOT exist`);
      }
    }
  });

  test('5. HTML Hub (dist/sitemap-seoul.html) links count exactly 5 and groups are correct', () => {
    const hubHtml = fs.readFileSync(path.resolve(DIST_DIR, 'sitemap-seoul.html'), 'utf8');

    // 5 regional links
    const regionalLinks = hubHtml.match(/href="\/seo\/[^"]+"/g) || [];
    assert.equal(regionalLinks.length, 5, 'Hub must contain exactly 5 regional links');

    assert.ok(hubHtml.includes('/seo/elastic-coating/seoul-jungnang-gu.html'), 'Jungnang elastic link in hub');
    assert.ok(hubHtml.includes('/seo/balcony-elastic-coating/seoul-jungnang-gu.html'), 'Jungnang balcony link in hub');
  });

  test('6. XML Sitemap (dist/sitemap-0.xml) contains exactly 11 loc entries', () => {
    const sitemapXml = fs.readFileSync(path.resolve(DIST_DIR, 'sitemap-0.xml'), 'utf8');
    const locs = sitemapXml.match(/<loc>[^<]+<\/loc>/g) || [];
    assert.equal(locs.length, 11, 'Sitemap must contain exactly 11 URLs');

    assert.ok(sitemapXml.includes('/seo/elastic-coating/seoul-jungnang-gu.html'), 'Jungnang elastic in sitemap');
    assert.ok(sitemapXml.includes('/seo/balcony-elastic-coating/seoul-jungnang-gu.html'), 'Jungnang balcony in sitemap');
    assert.equal(sitemapXml.includes('.html.html'), false, 'No double extension in sitemap');
  });

  test('7. RSS Feed (dist/rss.xml) strictly maintains 3 items and KEYWORD_LEDGER unchanged', () => {
    const rssXml = fs.readFileSync(path.resolve(DIST_DIR, 'rss.xml'), 'utf8');
    const items = rssXml.match(/<item>/g) || [];
    assert.equal(items.length, 3, 'RSS feed must have exactly 3 items');
    assert.equal(GUIDES.length, 3, 'GUIDES length must be 3');
    assert.equal(KEYWORD_LEDGER.length, 3, 'KEYWORD_LEDGER length must be 3');
  });

  test('8. Jungnang Gu pages HTML content verification (H1, AS보장 Title, canonical, meta, FAQs)', () => {
    const targets = [
      {
        path: 'dist/seo/elastic-coating/seoul-jungnang-gu.html',
        expectedTitle: '중랑구 탄성코트 시공 | AS보장 | 올케어탄성',
        expectedH1: '중랑구 탄성코트 시공 안내',
        expectedCanonical: 'https://www.seoulallcaretan.com/seo/elastic-coating/seoul-jungnang-gu.html',
      },
      {
        path: 'dist/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
        expectedTitle: '중랑구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
        expectedH1: '중랑구 베란다탄성코트 시공 안내',
        expectedCanonical: 'https://www.seoulallcaretan.com/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
      },
    ];

    for (const t of targets) {
      const html = fs.readFileSync(path.resolve(t.path), 'utf8');

      // Title & OG Title & Twitter Title
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      assert.ok(titleMatch, `${t.path} Title must exist`);
      assert.equal(titleMatch[1], t.expectedTitle);

      const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
      assert.equal(ogTitle, t.expectedTitle);

      // Single H1
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      assert.equal(h1Matches.length, 1, `${t.path} must have exactly 1 H1`);
      assert.ok(h1Matches[0].includes(t.expectedH1));

      // Canonical
      const canonMatch = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
      assert.equal(canonMatch, t.expectedCanonical);

      // Exactly 5 FAQs
      const faqMatches = html.match(/<summary[^>]*>[\s\S]*?Q\d+\.[\s\S]*?<\/summary>/gi) || [];
      assert.equal(faqMatches.length, 5, `${t.path} must have exactly 5 FAQs`);
    }
  });
});
