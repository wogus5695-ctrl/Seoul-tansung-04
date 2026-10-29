import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REGIONS } from './src/data/regions.ts';
import { SERVICES } from './src/data/services.ts';
import { getPublishedSeoPages } from './src/data/pages.ts';
import { getAllDynamicKeywords } from './src/data/keywordRegistry.ts';
import { validateKeywordRegistryIntegrity } from './scripts/audit-keywords.mjs';

const DIST_DIR = path.resolve('dist');

describe('STEP HUB-1: Dynamic Keyword HTML Hub & Management Audit Suite', () => {
  const hubHtmlPath = path.join(DIST_DIR, 'sitemap-seoul.html');

  test('1. Hub HTML file exists in dist directory', () => {
    assert.ok(fs.existsSync(hubHtmlPath), 'dist/sitemap-seoul.html must exist');
  });

  test('2. Single H1, Title, and Meta Description exact match', () => {
    const html = fs.readFileSync(hubHtmlPath, 'utf8');

    // Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    assert.ok(titleMatch, 'Title must exist');
    assert.equal(titleMatch[1], '서울 탄성코트 시공지역 안내 | 올케어탄성');

    // Meta Description
    const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
    assert.ok(descMatch, 'Meta description must exist');
    assert.equal(
      descMatch[1],
      '올케어탄성의 서울 지역별 탄성코트 및 베란다탄성코트 시공 안내를 확인하세요. 공개된 지역별 상세페이지를 작업 종류에 따라 안내합니다.'
    );

    // H1 Exactly 1
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    assert.strictEqual(h1Matches?.length, 1, 'Exactly one H1 tag permitted');
    const h1Text = h1Matches[0].replace(/<[^>]+>/g, '').trim();
    assert.equal(h1Text, '서울 탄성코트 시공지역 안내');
  });

  test('3. Service Groups count exactly 2 and Published Links count exactly 5', () => {
    const html = fs.readFileSync(hubHtmlPath, 'utf8');

    // Groups (H2)
    const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
    assert.strictEqual(h2Matches.length, 2, 'Exactly 2 service group headings (H2)');
    const groupNames = h2Matches.map((h2) => h2.replace(/<[^>]+>/g, '').trim());
    assert.ok(groupNames.includes('탄성코트'), '탄성코트 group exists');
    assert.ok(groupNames.includes('베란다탄성코트'), '베란다탄성코트 group exists');

    // Published SEO Links (3 Elastic + 2 Balcony Elastic = 5)
    const expectedUrls = [
      '/seo/elastic-coating/seoul-nowon-gu.html',
      '/seo/elastic-coating/seoul-dobong-gu.html',
      '/seo/elastic-coating/seoul-jungnang-gu.html',
      '/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      '/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
    ];

    for (const url of expectedUrls) {
      assert.ok(html.includes(`href="${url}"`), `Hub must contain link to ${url}`);
    }

    const regionalLinks = html.match(/href="\/seo\/[^"]+"/g) || [];
    assert.strictEqual(regionalLinks.length, 5, 'Must contain EXACTLY 5 published regional links');
  });

  test('4. Complete isolation of 19 unpublished regional SEO combinations', () => {
    const html = fs.readFileSync(hubHtmlPath, 'utf8');

    const publishedPages = getPublishedSeoPages();
    const publishedIds = new Set(publishedPages.map((p) => p.id));

    const allKeywords = getAllDynamicKeywords(REGIONS, SERVICES);
    let unpublishedCount = 0;

    for (const kw of allKeywords) {
      if (!publishedIds.has(kw.id)) {
        unpublishedCount++;
        assert.equal(
          html.includes(`href="${kw.targetUrlPath}"`),
          false,
          `CRITICAL: Unpublished link ${kw.targetUrlPath} must NOT appear in HTML hub`
        );
      }
    }

    assert.strictEqual(unpublishedCount, 19, 'Must verify all 19 unpublished combinations');
  });

  test('5. Canonical and Robots integrity on Hub', () => {
    const html = fs.readFileSync(hubHtmlPath, 'utf8');

    // Canonical link
    const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
    assert.ok(canonMatch, 'Canonical link must exist');
    assert.match(canonMatch[1], /\/sitemap-seoul\.html$/, 'Canonical must point to sitemap-seoul.html');

    // No noindex tag
    assert.equal(html.includes('noindex'), false, 'Hub must allow indexing in production mode');
  });

  test('6. XML Sitemap count incremented to exactly 11 URLs', () => {
    const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
    assert.ok(fs.existsSync(sitemapPath), 'sitemap-0.xml must exist');

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const locMatches = sitemapContent.match(/<loc>[^<]+<\/loc>/g) || [];
    assert.strictEqual(locMatches.length, 11, 'Sitemap must contain exactly 11 URLs (1 home + 4 guides + 5 regional SEO + 1 hub)');

    // Ensure hub is included in sitemap
    assert.match(sitemapContent, /\/sitemap-seoul\.html<\/loc>/, 'Hub must be included in XML sitemap');

    // Ensure all 5 published regional pages and home and 4 guides are preserved
    assert.match(sitemapContent, /\/seo\/elastic-coating\/seoul-nowon-gu\.html<\/loc>/);
    assert.match(sitemapContent, /\/seo\/elastic-coating\/seoul-dobong-gu\.html<\/loc>/);
    assert.match(sitemapContent, /\/seo\/elastic-coating\/seoul-jungnang-gu\.html<\/loc>/);
    assert.match(sitemapContent, /\/seo\/balcony-elastic-coating\/seoul-nowon-gu\.html<\/loc>/);
    assert.match(sitemapContent, /\/seo\/balcony-elastic-coating\/seoul-jungnang-gu\.html<\/loc>/);
    assert.match(sitemapContent, /\/guide\.html<\/loc>/);
  });

  test('7. RSS Feed item count remains strictly 3', () => {
    const rssPath = path.join(DIST_DIR, 'rss.xml');
    assert.ok(fs.existsSync(rssPath), 'rss.xml must exist');

    const rssContent = fs.readFileSync(rssPath, 'utf8');
    const itemMatches = rssContent.match(/<item>/g) || [];
    assert.strictEqual(itemMatches.length, 3, 'RSS feed must maintain exactly 3 items');
  });

  test('8. Local Keyword Audit generated 24 records without duplicates', () => {
    const artifactsDir = path.resolve('artifacts');
    const mdPath = path.join(artifactsDir, 'KEYWORD_STATUS.md');
    const csvPath = path.join(artifactsDir, 'KEYWORD_STATUS.csv');

    assert.ok(fs.existsSync(mdPath), 'artifacts/KEYWORD_STATUS.md must exist');
    assert.ok(fs.existsSync(csvPath), 'artifacts/KEYWORD_STATUS.csv must exist');

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const rows = mdContent.split('\n').filter((l) => l.startsWith('|') && !l.includes('Keyword ID') && !l.includes(':---'));
    assert.ok(rows.length === 24 || rows.length === 46, 'Markdown report must have 24 (Gu only) or 46 (Gu + Dong) keyword rows');

    // Check unique keywordIds
    const allKeywords = getAllDynamicKeywords(REGIONS, SERVICES);
    const idSet = new Set(allKeywords.map((k) => k.id));
    assert.strictEqual(idSet.size, 24, 'All 24 keyword IDs must be unique');
  });

  test('9. Main page and Footer isolation (no unapproved hub links inserted)', () => {
    const mainHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
    assert.equal(
      mainHtml.includes('href="/sitemap-seoul.html"'),
      false,
      'Main page and footer must NOT contain hub link in STEP HUB-1'
    );
  });

  test('10. Verified 12 official districts and zero foreign district contamination', () => {
    const expectedDistricts = [
      '노원구', '도봉구', '강북구', '성북구', '동대문구', '중랑구',
      '은평구', '서대문구', '마포구', '종로구', '중구', '용산구',
    ];
    assert.strictEqual(REGIONS.length, 12, 'Must have exactly 12 districts');
    const districtNames = REGIONS.map((r) => r.name);
    for (const d of expectedDistricts) {
      assert.ok(districtNames.includes(d), `District ${d} must be in REGIONS`);
    }

    // Ensure foreign districts are strictly absent
    const foreignDistricts = ['강남구', '강동구', '강서구', '관악구', '금천구', '구로구', '동작구', '서초구', '송파구', '양천구', '영등포구'];
    for (const f of foreignDistricts) {
      assert.equal(districtNames.includes(f), false, `Foreign district ${f} must NOT be in REGIONS`);
    }

    // Verify dynamic integrity check on current production data
    const integrity = validateKeywordRegistryIntegrity(REGIONS, SERVICES);
    assert.equal(integrity.valid, true);
    assert.equal(integrity.regionsCount, 12);
    assert.equal(integrity.servicesCount, 2);
    assert.equal(integrity.totalCombinations, 24);
  });

  test('11. Dynamic scaling validation with isolated test data (13 regions x 2 services = 26 combinations)', () => {
    // Isolated mock region: Gangdong-gu (test mock only, not added to production data)
    const mockRegions = [
      ...REGIONS,
      {
        id: 'mock_region_13',
        name: '테스트구',
        slug: 'seoul-test-gu',
        administrativeType: 'autonomous_district',
        displayName: '서울 테스트구',
        order: 13,
      },
    ];

    assert.equal(mockRegions.length, 13, 'Mock regions count must be 13');
    assert.equal(SERVICES.length, 2, 'Services count is 2');

    const mockKeywords = getAllDynamicKeywords(mockRegions, SERVICES);
    assert.equal(mockKeywords.length, 26, 'Dynamic extraction must scale to 26 keywords without hardcoded errors');

    // Dynamic validator should accept 13 x 2 without throwing
    const result = validateKeywordRegistryIntegrity(mockRegions, SERVICES, mockKeywords);
    assert.equal(result.valid, true);
    assert.equal(result.regionsCount, 13);
    assert.equal(result.servicesCount, 2);
    assert.equal(result.totalCombinations, 26);

    // Negative test: verify duplicate detection
    const duplicateRegions = [
      ...REGIONS,
      {
        id: 'nowon', // Duplicate ID!
        name: '중복구',
        slug: 'seoul-dup-gu',
        administrativeType: 'autonomous_district',
        displayName: '서울 중복구',
        order: 13,
      },
    ];
    assert.throws(
      () => validateKeywordRegistryIntegrity(duplicateRegions, SERVICES),
      /Region ID 중복 발견/,
      'Must detect duplicate region ID'
    );
  });
});
