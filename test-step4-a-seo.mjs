import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- Pure Function Mirrors for Unit Testing ---
function getSiteUrl(astroSite, envSiteUrl = '') {
  if (astroSite && astroSite.origin && astroSite.origin !== 'null') {
    return astroSite.origin.replace(/\/$/, '');
  }
  return envSiteUrl ? envSiteUrl.trim().replace(/\/$/, '') : '';
}

function getCanonicalUrl(urlPath, siteUrl) {
  if (!siteUrl) return null;
  const cleanPath = urlPath ? urlPath.split('?')[0].split('#')[0] : '';
  if (!cleanPath || cleanPath === '/') {
    return `${siteUrl}/`;
  }
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${siteUrl}${normalizedPath}`;
}

function buildWebSiteJsonLd(siteUrl) {
  if (!siteUrl) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '올케어탄성',
    alternateName: 'ALLCARE',
    url: `${siteUrl}/`,
  };
}

function buildWebPageJsonLd(title, description, url) {
  if (!url) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url,
  };
}

function buildBreadcrumbJsonLd(items) {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function isPagePublished(page) {
  return page.isPublished === true && page.contentStatus === 'approved';
}

describe('STEP 4-A: Unit Tests for Technical SEO Logic', () => {
  test('1. getSiteUrl strips trailing slashes', () => {
    assert.equal(getSiteUrl(new URL('https://allcare-seoul.kr/')), 'https://allcare-seoul.kr');
    assert.equal(getSiteUrl(null, 'https://test-site.kr/'), 'https://test-site.kr');
    assert.equal(getSiteUrl(null, ''), '');
  });

  test('2. getCanonicalUrl returns null when siteUrl is not provided', () => {
    assert.equal(getCanonicalUrl('/', ''), null);
    assert.equal(getCanonicalUrl('/seo/elastic-coating/seoul-nowon-gu.html', ''), null);
  });

  test('3. getCanonicalUrl formats home and file routes without query/hash', () => {
    const site = 'https://allcare-seoul.kr';
    assert.equal(getCanonicalUrl('/', site), 'https://allcare-seoul.kr/');
    assert.equal(getCanonicalUrl('', site), 'https://allcare-seoul.kr/');
    assert.equal(
      getCanonicalUrl('/seo/elastic-coating/seoul-nowon-gu.html?from=naver#section', site),
      'https://allcare-seoul.kr/seo/elastic-coating/seoul-nowon-gu.html'
    );
  });

  test('4. WebSite JSON-LD contains valid Schema.org structure', () => {
    assert.equal(buildWebSiteJsonLd(''), null);
    const schema = buildWebSiteJsonLd('https://allcare-seoul.kr');
    assert.ok(schema);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.equal(schema['@type'], 'WebSite');
    assert.equal(schema.name, '올케어탄성');
    assert.equal(schema.url, 'https://allcare-seoul.kr/');
  });

  test('5. WebPage JSON-LD contains valid Schema.org structure', () => {
    assert.equal(buildWebPageJsonLd('Title', 'Desc', null), null);
    const schema = buildWebPageJsonLd('Title', 'Desc', 'https://allcare-seoul.kr/page.html');
    assert.ok(schema);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.equal(schema['@type'], 'WebPage');
    assert.equal(schema.name, 'Title');
    assert.equal(schema.url, 'https://allcare-seoul.kr/page.html');
  });

  test('6. BreadcrumbList JSON-LD creates correct itemListElement hierarchy', () => {
    const items = [
      { name: '홈', url: 'https://allcare-seoul.kr/' },
      { name: '서울권 시공 안내', url: 'https://allcare-seoul.kr/#regions' },
      { name: '노원구 탄성코트', url: 'https://allcare-seoul.kr/seo/elastic-coating/seoul-nowon-gu.html' },
    ];
    const schema = buildBreadcrumbJsonLd(items);
    assert.ok(schema);
    assert.equal(schema['@type'], 'BreadcrumbList');
    assert.equal(schema.itemListElement.length, 3);
    assert.equal(schema.itemListElement[0].position, 1);
    assert.equal(schema.itemListElement[0].name, '홈');
    assert.equal(schema.itemListElement[2].position, 3);
    assert.equal(schema.itemListElement[2].name, '노원구 탄성코트');
  });

  test('7. isPagePublished publication gate test (All 4 core cases)', () => {
    // CASE 1: draft + false -> false
    assert.equal(isPagePublished({ isPublished: false, contentStatus: 'draft' }), false);
    // CASE 2: approved + false -> false
    assert.equal(isPagePublished({ isPublished: false, contentStatus: 'approved' }), false);
    // CASE 3: in_review + true -> false (P0 방어)
    assert.equal(isPagePublished({ isPublished: true, contentStatus: 'in_review' }), false);
    // CASE 4: approved + true -> true
    assert.equal(isPagePublished({ isPublished: true, contentStatus: 'approved' }), true);
  });
});

describe('STEP 4-A: Build Output & HTML Static Analysis Tests', () => {
  const distDir = path.resolve('dist');

  test('1. dist/index.html exists and contains valid Title and Description', () => {
    const indexPath = path.join(distDir, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'dist/index.html must exist');
    const html = fs.readFileSync(indexPath, 'utf-8');
    assert.match(html, /<title>서울 탄성코트 시공 안내 \| 올케어탄성<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]*서울권 베란다와 세탁실의 탄성코트 시공을 안내합니다/);
  });

  test('2. Exactly one H1 tag on index.html', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
    assert.ok(h1Matches, 'H1 tag must exist');
    assert.equal(h1Matches.length, 1, 'Exactly one H1 tag permitted');
  });

  test('3. OpenGraph basic metadata present on index.html', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta property="og:description"/);
    assert.match(html, /<meta property="og:type" content="website"/);
    assert.match(html, /<meta property="og:site_name" content="올케어탄성"/);
    assert.match(html, /<meta property="og:locale" content="ko_KR"/);
  });

  test('4. Representative phone CTA 010-8492-6900 verified', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    assert.match(html, /href="tel:01084926900"/);
    assert.match(html, /010-8492-6900/);
  });

  test('5. dist/robots.txt exists and is valid text/plain format', () => {
    const robotsPath = path.join(distDir, 'robots.txt');
    assert.ok(fs.existsSync(robotsPath), 'dist/robots.txt must exist');
    const robots = fs.readFileSync(robotsPath, 'utf-8');
    assert.match(robots, /User-agent:\s*\*/i);
  });

  test('6. No unpublished /seo pages exist in default build state', () => {
    const seoDir = path.join(distDir, 'seo');
    // When isPublished is false for all pages, dist/seo must NOT exist
    assert.equal(fs.existsSync(seoDir), false, 'dist/seo must NOT exist when pages are unpublished');
  });
});
