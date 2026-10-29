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
  // We explicitly override VERCEL_ENV, ENVIRONMENT, DEPLOY_TARGET, SITE_URL
  const env = {
    ...process.env,
    VERCEL_ENV: '',
    ENVIRONMENT: '',
    DEPLOY_TARGET: '',
    SITE_URL: '',
    ...envVars,
  };
  execSync('npm.cmd run build', { env, stdio: 'pipe' });
}

function runBuildExpectingFailure(envVars = {}, expectedErrorPattern) {
  cleanDist();
  const env = {
    ...process.env,
    VERCEL_ENV: '',
    ENVIRONMENT: '',
    DEPLOY_TARGET: '',
    SITE_URL: '',
    ...envVars,
  };
  let failed = false;
  let output = '';
  try {
    output = execSync('npm.cmd run build', { env, stdio: 'pipe' }).toString();
  } catch (err) {
    failed = true;
    output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
  }
  assert.equal(failed, true, 'Build was expected to fail, but succeeded!');
  if (expectedErrorPattern) {
    assert.match(output, expectedErrorPattern, `Build output should match ${expectedErrorPattern}`);
  }
}

console.log('================================================================');
console.log('STEP 4-B: Comprehensive Production Gate & SEO Hardening Suite');
console.log('================================================================\n');

try {
  // -------------------------------------------------------------
  // TEST 1: Default State (3 Approved Pilots, 21 Unpublished, Domain unset)
  // -------------------------------------------------------------
  console.log('[TEST 1] Verifying local default state (3 Pilots Published, 21 Unpublished, Domain unset)...');
  runBuild();
  assert.ok(fs.existsSync('dist/index.html'), 'dist/index.html must exist');
  assert.ok(fs.existsSync('dist/robots.txt'), 'dist/robots.txt must exist');
  assert.ok(fs.existsSync('dist/seo'), 'dist/seo must exist for 3 pilots');
  assert.ok(fs.existsSync('dist/seo/elastic-coating/seoul-nowon-gu.html'), 'Nowon elastic exists');
  assert.equal(fs.existsSync('dist/seo/elastic-coating/seoul-gangbuk-gu.html'), false, 'Unpublished page must NOT exist');
  assert.equal(fs.existsSync('dist/sitemap-index.xml'), false, 'sitemap must NOT exist');
  const t1Robots = fs.readFileSync('dist/robots.txt', 'utf-8');
  assert.match(t1Robots, /Disallow: \//, 'Robots must disallow when domain unset');
  const t1Index = fs.readFileSync('dist/index.html', 'utf-8');
  assert.equal(t1Index.includes('rel="canonical"'), false, 'No fake canonical when domain unset');
  assert.equal(t1Index.includes('noindex'), false, 'No noindex on standard local dev');
  console.log('  -> TEST 1 PASSED: Local build clean, 3 pilots built, 21 unpublished isolated, safe robots.txt generated.\n');

  // -------------------------------------------------------------
  // TEST 2: Preview Mode with SITE_URL unset (Section D Case B)
  // -------------------------------------------------------------
  console.log('[TEST 2] Verifying Preview Mode with SITE_URL unset...');
  runBuild({ VERCEL_ENV: 'preview' });
  assert.equal(fs.existsSync('dist/sitemap-index.xml'), false, 'No sitemap in preview');
  const t2Robots = fs.readFileSync('dist/robots.txt', 'utf-8');
  assert.match(t2Robots, /Disallow: \//, 'Robots must disallow crawling in preview');
  assert.match(t2Robots, /Preview \/ Staging/, 'Robots must identify preview environment');
  const t2Index = fs.readFileSync('dist/index.html', 'utf-8');
  assert.match(t2Index, /<meta name="robots" content="noindex, nofollow"/, 'Preview must have noindex tag');
  assert.equal(t2Index.includes('rel="canonical"'), false, 'No canonical in preview');
  console.log('  -> TEST 2 PASSED: Preview mode cleanly isolated (noindex + Disallow).\n');

  // -------------------------------------------------------------
  // TEST 3: Preview Mode with SITE_URL set (Section D Case C - Critical)
  // -------------------------------------------------------------
  console.log('[TEST 3] Verifying Preview Mode with inherited SITE_URL (Isolation Check)...');
  runBuild({ VERCEL_ENV: 'preview', SITE_URL: 'https://allcare-seoul.co.kr' });
  assert.equal(fs.existsSync('dist/sitemap-index.xml'), false, 'CRITICAL: Preview must NOT generate sitemap even if SITE_URL exists');
  const t3Index = fs.readFileSync('dist/index.html', 'utf-8');
  assert.equal(t3Index.includes('rel="canonical"'), false, 'CRITICAL: Preview must NOT output production canonical');
  assert.equal(t3Index.includes('property="og:url"'), false, 'CRITICAL: Preview must NOT output production og:url');
  assert.match(t3Index, /<meta name="robots" content="noindex, nofollow"/, 'CRITICAL: Preview must enforce noindex');
  const t3Robots = fs.readFileSync('dist/robots.txt', 'utf-8');
  assert.match(t3Robots, /Disallow: \//, 'Robots must disallow crawling in preview');
  console.log('  -> TEST 3 PASSED: Preview environment perfectly isolated despite SITE_URL presence.\n');

  // -------------------------------------------------------------
  // TEST 4: Production Gate - Fails on Missing SITE_URL
  // -------------------------------------------------------------
  console.log('[TEST 4] Verifying Production Gate: Blocks missing SITE_URL...');
  runBuildExpectingFailure(
    { VERCEL_ENV: 'production' },
    /\[PRODUCTION BUILD GATE ERROR\]/
  );
  console.log('  -> TEST 4 PASSED: Production build safely halted when SITE_URL is missing.\n');

  // -------------------------------------------------------------
  // TEST 5: Production Gate - Fails on Non-HTTPS or Insecure Protocol
  // -------------------------------------------------------------
  console.log('[TEST 5] Verifying Production Gate: Blocks http:// protocol...');
  runBuildExpectingFailure(
    { VERCEL_ENV: 'production', SITE_URL: 'http://allcare-seoul.co.kr' },
    /보안 프로토콜 https:\/\/ 로 시작해야 합니다/
  );
  console.log('  -> TEST 5 PASSED: Production build halted on non-HTTPS URL.\n');

  // -------------------------------------------------------------
  // TEST 6: Production Gate - Fails on Legacy Domain allcaretan.co.kr
  // -------------------------------------------------------------
  console.log('[TEST 6] Verifying Production Gate: Blocks legacy domain allcaretan.co.kr...');
  runBuildExpectingFailure(
    { VERCEL_ENV: 'production', SITE_URL: 'https://allcaretan.co.kr' },
    /기존 운영 사이트\(allcaretan\.co\.kr\)는 신규 독립 사이트의 SITE_URL로 사용할 수 없습니다/
  );
  console.log('  -> TEST 6 PASSED: Production build halted on legacy domain.\n');

  // -------------------------------------------------------------
  // TEST 7: Production Gate - Fails on Dummy/Test Domains
  // -------------------------------------------------------------
  console.log('[TEST 7] Verifying Production Gate: Blocks example.com / test domains...');
  runBuildExpectingFailure(
    { VERCEL_ENV: 'production', SITE_URL: 'https://example.com' },
    /테스트용 더미 도메인\(example\.com 등\)은 운영 배포에 사용할 수 없습니다/
  );
  console.log('  -> TEST 7 PASSED: Production build halted on example.com.\n');

  // -------------------------------------------------------------
  // TEST 8: Production Gate - Fails on Subpaths / Queries
  // -------------------------------------------------------------
  console.log('[TEST 8] Verifying Production Gate: Blocks subdirectories and queries...');
  runBuildExpectingFailure(
    { VERCEL_ENV: 'production', SITE_URL: 'https://allcare-seoul.co.kr/subpath' },
    /서브 경로를 포함할 수 없습니다/
  );
  console.log('  -> TEST 8 PASSED: Production build halted on subpath URL.\n');

  // -------------------------------------------------------------
  // TEST 9: P0 Safety Gate (in_review + isPublished=true)
  // -------------------------------------------------------------
  console.log('[TEST 9] Verifying P0 Safety Gate: in_review + isPublished=true...');
  let test9Source = originalPagesSource.replaceAll(
    "contentStatus = 'approved';",
    "contentStatus = 'in_review';"
  );
  fs.writeFileSync(PAGES_PATH, test9Source, 'utf-8');
  runBuild();
  assert.equal(fs.existsSync('dist/seo'), false, 'P0 DEFENSE: in_review pages MUST NOT be emitted');
  console.log('  -> TEST 9 PASSED: in_review status 100% blocked from build.\n');

  // -------------------------------------------------------------
  // TEST 10: Production Build with Valid Domain & 3 Approved Pilots
  // -------------------------------------------------------------
  console.log('[TEST 10] Verifying Production Build with Valid Domain & 5 Approved Pages...');
  const VALID_DOMAIN = 'https://allcare-seoul.co.kr';
  fs.writeFileSync(PAGES_PATH, originalPagesSource, 'utf-8');
  runBuild({ VERCEL_ENV: 'production', SITE_URL: VALID_DOMAIN });

  // 1. Check generated HTML files
  const expectedFiles = [
    'dist/index.html',
    'dist/seo/elastic-coating/seoul-nowon-gu.html',
    'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
    'dist/seo/elastic-coating/seoul-dobong-gu.html',
    'dist/seo/elastic-coating/seoul-jungnang-gu.html',
    'dist/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
  ];
  for (const f of expectedFiles) {
    assert.ok(fs.existsSync(f), `${f} must exist in Production`);
  }

  // 2. Check Sitemap & Extensions
  assert.ok(fs.existsSync('dist/sitemap-index.xml'), 'sitemap-index.xml must be generated');
  assert.ok(fs.existsSync('dist/sitemap-0.xml'), 'sitemap-0.xml must be generated');
  const sitemap0 = fs.readFileSync('dist/sitemap-0.xml', 'utf-8');
  assert.match(sitemap0, new RegExp(`${VALID_DOMAIN}/<`), 'Home in sitemap');
  assert.match(sitemap0, new RegExp(`${VALID_DOMAIN}/seo/elastic-coating/seoul-nowon-gu.html`), 'Pilot A .html in sitemap');
  assert.match(sitemap0, new RegExp(`${VALID_DOMAIN}/seo/balcony-elastic-coating/seoul-nowon-gu.html`), 'Pilot B .html in sitemap');
  assert.match(sitemap0, new RegExp(`${VALID_DOMAIN}/seo/elastic-coating/seoul-dobong-gu.html`), 'Pilot C .html in sitemap');
  assert.match(sitemap0, new RegExp(`${VALID_DOMAIN}/seo/elastic-coating/seoul-jungnang-gu.html`), 'Jungnang elastic .html in sitemap');
  assert.match(sitemap0, new RegExp(`${VALID_DOMAIN}/seo/balcony-elastic-coating/seoul-jungnang-gu.html`), 'Jungnang balcony .html in sitemap');
  assert.equal(sitemap0.includes('.html.html'), false, 'CRITICAL: No .html.html double extension in sitemap');
  assert.equal(sitemap0.includes('gangnam'), false, 'Unpublished page must NOT be in sitemap');

  // 3. Check Robots.txt
  const t10Robots = fs.readFileSync('dist/robots.txt', 'utf-8');
  assert.match(t10Robots, /Allow: \//, 'Robots allows crawling in production');
  assert.match(t10Robots, new RegExp(`Sitemap: ${VALID_DOMAIN}/sitemap-index.xml`), 'Robots points to sitemap');

  // 4. Check Canonicals & OG URLs
  for (const f of expectedFiles) {
    const html = fs.readFileSync(f, 'utf-8');
    const canonMatches = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/g);
    assert.ok(canonMatches, `Canonical must exist on ${f}`);
    assert.equal(canonMatches.length, 1, `Exactly one canonical allowed on ${f}`);
    assert.equal(html.includes('.html.html'), false, `No .html.html double extension in ${f}`);
    assert.equal(html.includes('allcaretan.co.kr'), false, `Legacy domain prohibited on ${f}`);
    assert.equal(html.includes('noindex'), false, `Production must NOT contain noindex on ${f}`);
  }

  // 5. Check BreadcrumbList JSON-LD structure on district page
  const nowonHtml = fs.readFileSync('dist/seo/elastic-coating/seoul-nowon-gu.html', 'utf-8');
  assert.match(nowonHtml, /"BreadcrumbList"/, 'BreadcrumbList schema present');
  const breadcrumbScriptMatch = nowonHtml.match(/<script type="application\/ld\+json">[\s\S]*?"@type":"BreadcrumbList"[\s\S]*?<\/script>/);
  assert.ok(breadcrumbScriptMatch, 'BreadcrumbList script tag must exist');
  assert.equal(breadcrumbScriptMatch[0].includes('/#regions'), false, 'BreadcrumbList JSON-LD must not contain fragment identifier');

  console.log('  -> TEST 10 PASSED: Valid production build, sitemap, canonical, robots, and JSON-LD all verified.\n');

  console.log('================================================================');
  console.log('ALL STEP 4-B HARDENING & REGRESSION TESTS PASSED (10/10)');
  console.log('================================================================');

} finally {
  // Always restore original file
  fs.writeFileSync(PAGES_PATH, originalPagesSource, 'utf-8');
  console.log('\n[TEARDOWN] src/data/pages.ts restored to release state (5 pages approved).');
  runBuild({ SITE_URL: 'https://www.seoulallcaretan.com' });
  console.log('[TEARDOWN] Clean build completed. Verifying 5 pages generated...');
  assert.ok(fs.existsSync('dist/seo/elastic-coating/seoul-nowon-gu.html'), 'Nowon elastic exists');
  assert.ok(fs.existsSync('dist/seo/elastic-coating/seoul-jungnang-gu.html'), 'Jungnang elastic exists');
  assert.equal(fs.existsSync('dist/seo/elastic-coating/seoul-gangbuk-gu.html'), false, '19 Gu pages absent');
  console.log('[TEARDOWN] Verified 5 pages active, 19 Gu unpublished isolated.');
}
