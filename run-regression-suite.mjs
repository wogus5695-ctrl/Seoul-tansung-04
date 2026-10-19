import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const PAGES_PATH = path.resolve('src', 'data', 'pages.ts');
const originalPagesSource = fs.readFileSync(PAGES_PATH, 'utf-8');

function cleanDist() {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
}

function runBuild(envVars = {}) {
  cleanDist();
  const env = { ...process.env, ...envVars };
  execSync('npm.cmd run build', { env, stdio: 'pipe' });
}

console.log('================================================================');
console.log('STEP 4-A: Comprehensive Publication & SEO Regression Test Suite');
console.log('================================================================\n');

try {
  // -------------------------------------------------------------
  // TEST CASE 1: Default State (All 24 unpublished, No SITE_URL)
  // -------------------------------------------------------------
  console.log('[CASE 1] Verifying all 24 unpublished, domain unset default...');
  runBuild();
  assert.ok(fs.existsSync('dist/index.html'), 'dist/index.html must exist');
  assert.ok(fs.existsSync('dist/robots.txt'), 'dist/robots.txt must exist');
  assert.equal(fs.existsSync('dist/seo'), false, 'dist/seo must NOT exist in Case 1');
  assert.equal(fs.existsSync('dist/sitemap-index.xml'), false, 'sitemap must NOT exist when domain unset');
  const case1Robots = fs.readFileSync('dist/robots.txt', 'utf-8');
  assert.match(case1Robots, /Disallow: \//, 'Robots must disallow when domain unset');
  console.log('  -> CASE 1 PASSED: Only index.html and safe robots.txt generated.\n');

  // -------------------------------------------------------------
  // TEST CASE 3: P0 Vulnerability Defense (in_review + isPublished=true)
  // -------------------------------------------------------------
  console.log('[CASE 3] Verifying P0 Defense: in_review + isPublished=true...');
  let case3Source = originalPagesSource.replace(
    'isPublished: false, // STEP 3-F 최종 비공개 원복 (24개 전체 false)',
    'isPublished: isNowonElastic || isNowonBalconyElastic || isDobongElastic,'
  );
  fs.writeFileSync(PAGES_PATH, case3Source, 'utf-8');
  runBuild();
  assert.equal(fs.existsSync('dist/seo'), false, 'P0 DEFENSE: in_review pages MUST NOT be emitted');
  console.log('  -> CASE 3 PASSED: in_review status 100% blocked from build.\n');

  // -------------------------------------------------------------
  // TEST CASE 4: approved + isPublished=false
  // -------------------------------------------------------------
  console.log('[CASE 4] Verifying approved + isPublished=false...');
  let case4Source = originalPagesSource.replace(
    'contentStatus,',
    "contentStatus: (isNowonElastic || isNowonBalconyElastic || isDobongElastic) ? 'approved' : 'draft',"
  );
  fs.writeFileSync(PAGES_PATH, case4Source, 'utf-8');
  runBuild();
  assert.equal(fs.existsSync('dist/seo'), false, 'approved + isPublished=false MUST NOT be emitted');
  console.log('  -> CASE 4 PASSED: approved but unpublished pages correctly withheld.\n');

  // -------------------------------------------------------------
  // TEST CASE 2: 3 Pilots Approved & Published + Production Domain
  // -------------------------------------------------------------
  console.log('[CASE 2] Verifying 3 Pilots Approved & Published with SITE_URL...');
  const TEST_DOMAIN = 'https://allcare-test-seoul.kr';
  let case2Source = originalPagesSource
    .replace(
      'isPublished: false, // STEP 3-F 최종 비공개 원복 (24개 전체 false)',
      'isPublished: isNowonElastic || isNowonBalconyElastic || isDobongElastic,'
    )
    .replace(
      'contentStatus,',
      "contentStatus: (isNowonElastic || isNowonBalconyElastic || isDobongElastic) ? 'approved' : 'draft',"
    );
  fs.writeFileSync(PAGES_PATH, case2Source, 'utf-8');
  runBuild({ SITE_URL: TEST_DOMAIN });

  // 1. Check generated HTML files
  const expectedFiles = [
    'dist/index.html',
    'dist/seo/elastic-coating/seoul-nowon-gu.html',
    'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
    'dist/seo/elastic-coating/seoul-dobong-gu.html',
  ];
  for (const f of expectedFiles) {
    assert.ok(fs.existsSync(f), `${f} must exist in Case 2`);
  }

  // 2. Check Sitemap
  assert.ok(fs.existsSync('dist/sitemap-index.xml'), 'sitemap-index.xml must be generated');
  assert.ok(fs.existsSync('dist/sitemap-0.xml'), 'sitemap-0.xml must be generated');
  const sitemap0Content = fs.readFileSync('dist/sitemap-0.xml', 'utf-8');
  assert.match(sitemap0Content, new RegExp(`${TEST_DOMAIN}/<`), 'Home page in sitemap');
  assert.match(sitemap0Content, new RegExp(`${TEST_DOMAIN}/seo/elastic-coating/seoul-nowon-gu.html`), 'Pilot A in sitemap');
  assert.match(sitemap0Content, new RegExp(`${TEST_DOMAIN}/seo/balcony-elastic-coating/seoul-nowon-gu.html`), 'Pilot B in sitemap');
  assert.match(sitemap0Content, new RegExp(`${TEST_DOMAIN}/seo/elastic-coating/seoul-dobong-gu.html`), 'Pilot C in sitemap');
  assert.equal(sitemap0Content.includes('gangnam'), false, 'Unpublished district must NOT be in sitemap');

  // 3. Check Robots.txt in production mode
  const case2Robots = fs.readFileSync('dist/robots.txt', 'utf-8');
  assert.match(case2Robots, /Allow: \//, 'Robots must allow crawling in production mode');
  assert.match(case2Robots, new RegExp(`Sitemap: ${TEST_DOMAIN}/sitemap-index.xml`), 'Robots must point to sitemap-index.xml');

  // 4. Check Canonicals on all 4 pages
  for (const f of expectedFiles) {
    const html = fs.readFileSync(f, 'utf-8');
    const relCanonicalMatches = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/g);
    assert.ok(relCanonicalMatches, `Canonical must exist on ${f}`);
    assert.equal(relCanonicalMatches.length, 1, `Exactly one canonical allowed on ${f}`);
    assert.equal(html.includes('allcaretan.co.kr'), false, `Cross-canonical to old domain prohibited on ${f}`);
  }

  // 5. Check Open Graph & Twitter on all 4 pages
  for (const f of expectedFiles) {
    const html = fs.readFileSync(f, 'utf-8');
    assert.match(html, /<meta property="og:url" content="https:\/\/allcare-test-seoul\.kr/, `og:url on ${f}`);
    assert.match(html, /<meta property="og:image" content="https:\/\/allcare-test-seoul\.kr\/images\/allcare\/official-allcare-logo\.png/, `og:image on ${f}`);
    assert.match(html, /<meta name="twitter:card" content="summary"/, `twitter:card on ${f}`);
  }

  // 6. Check JSON-LD on all 4 pages
  const homeHtml = fs.readFileSync('dist/index.html', 'utf-8');
  assert.match(homeHtml, /"WebSite"/, 'WebSite schema on home page');
  assert.match(homeHtml, /"WebPage"/, 'WebPage schema on home page');

  const nowonHtml = fs.readFileSync('dist/seo/elastic-coating/seoul-nowon-gu.html', 'utf-8');
  assert.match(nowonHtml, /"BreadcrumbList"/, 'BreadcrumbList schema on district page');
  assert.match(nowonHtml, /"WebPage"/, 'WebPage schema on district page');

  console.log('  -> CASE 2 PASSED: 4 pages, sitemap, canonical, OG, JSON-LD all verified.\n');

  console.log('================================================================');
  console.log('ALL REGRESSION CASES PASSED (CASE 1, 2, 3, 4)');
  console.log('================================================================');

} finally {
  // Always restore original file
  fs.writeFileSync(PAGES_PATH, originalPagesSource, 'utf-8');
  console.log('\n[TEARDOWN] src/data/pages.ts restored to original state (isPublished: false).');
  runBuild();
  console.log('[TEARDOWN] Clean build completed. Verifying dist/seo absence...');
  assert.equal(fs.existsSync('dist/seo'), false, 'dist/seo must be absent after teardown');
  console.log('[TEARDOWN] Verified dist/seo is absent (False).');
}
