import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateProductionSiteUrl,
  buildBreadcrumbJsonLd,
} from './src/utils/seo.ts';

describe('STEP 4-B: Production Validation Gate & URL Verification', () => {
  test('1. Production Gate: Fails on missing or empty SITE_URL', () => {
    assert.equal(validateProductionSiteUrl(undefined).valid, false);
    assert.equal(validateProductionSiteUrl('').valid, false);
    assert.equal(validateProductionSiteUrl('   ').valid, false);
  });

  test('2. Production Gate: Fails on non-https protocols', () => {
    const res = validateProductionSiteUrl('http://allcare-new-domain.com');
    assert.equal(res.valid, false);
    assert.match(res.error, /https:\/\//);
  });

  test('3. Production Gate: Fails on localhost or loopback IP', () => {
    assert.equal(validateProductionSiteUrl('https://localhost').valid, false);
    assert.equal(validateProductionSiteUrl('https://localhost:4321').valid, false);
    assert.equal(validateProductionSiteUrl('https://127.0.0.1').valid, false);
  });

  test('4. Production Gate: Fails on legacy domain allcaretan.co.kr', () => {
    const res = validateProductionSiteUrl('https://allcaretan.co.kr');
    assert.equal(res.valid, false);
    assert.match(res.error, /기존 운영 사이트/);
  });

  test('5. Production Gate: Fails on dummy or test domains', () => {
    assert.equal(validateProductionSiteUrl('https://example.com').valid, false);
    assert.equal(validateProductionSiteUrl('https://example.org').valid, false);
    assert.equal(validateProductionSiteUrl('https://allcare.test').valid, false);
    assert.equal(validateProductionSiteUrl('https://test.com').valid, false);
  });

  test('6. Production Gate: Fails on subdirectories, queries, or hashes', () => {
    assert.equal(validateProductionSiteUrl('https://new-allcare.co.kr/subpath').valid, false);
    assert.equal(validateProductionSiteUrl('https://new-allcare.co.kr?utm=test').valid, false);
    assert.equal(validateProductionSiteUrl('https://new-allcare.co.kr#anchor').valid, false);
  });

  test('7. Production Gate: Passes on valid production HTTPS domains', () => {
    assert.equal(validateProductionSiteUrl('https://allcare-seoul.co.kr').valid, true);
    assert.equal(validateProductionSiteUrl('https://allcare-seoul.kr/').valid, true);
    assert.equal(validateProductionSiteUrl('https://allcaretan-seoul.com').valid, true);
  });
});

describe('STEP 4-B: Breadcrumb Structure Verification', () => {
  test('1. BreadcrumbList uses clean document hierarchy without anchor fragments', () => {
    const siteUrl = 'https://allcare-seoul.co.kr';
    const canonicalUrl = `${siteUrl}/seo/elastic-coating/seoul-nowon-gu.html`;
    const items = [
      { name: '홈', url: `${siteUrl}/` },
      { name: '노원구 탄성코트', url: canonicalUrl },
    ];
    const schema = buildBreadcrumbJsonLd(items);
    assert.ok(schema);
    assert.equal(schema['@type'], 'BreadcrumbList');
    assert.equal(schema.itemListElement.length, 2);
    assert.equal(schema.itemListElement[0].name, '홈');
    assert.equal(schema.itemListElement[0].item, 'https://allcare-seoul.co.kr/');
    assert.equal(schema.itemListElement[1].name, '노원구 탄성코트');
    assert.equal(schema.itemListElement[1].item, canonicalUrl);
    // Ensure no /#regions anchor tag is used in structured data
    const jsonStr = JSON.stringify(schema);
    assert.equal(jsonStr.includes('#'), false, 'BreadcrumbList must not contain fragment identifiers');
  });
});

describe('STEP 4-B: vercel.json Cache Policy Verification', () => {
  test('1. vercel.json exists and configures revalidatable cache for images', () => {
    const vPath = path.resolve('vercel.json');
    assert.ok(fs.existsSync(vPath), 'vercel.json must exist');
    const vConfig = JSON.parse(fs.readFileSync(vPath, 'utf-8'));
    
    // Check cleanUrls: false
    assert.equal(vConfig.cleanUrls, false, 'cleanUrls must be false to preserve .html direct access');
    assert.equal(vConfig.trailingSlash, false, 'trailingSlash must be false');

    // Check headers
    const imageHeader = vConfig.headers.find(h => h.source === '/images/(.*)');
    assert.ok(imageHeader, '/images/(.*) header must exist');
    const cacheControl = imageHeader.headers.find(h => h.key === 'Cache-Control');
    assert.ok(cacheControl, 'Cache-Control header for images must exist');
    assert.equal(cacheControl.value.includes('immutable'), false, '/images must NOT be immutable to allow photo replacement');
    assert.match(cacheControl.value, /stale-while-revalidate/, 'Images must use stale-while-revalidate');

    const astroHeader = vConfig.headers.find(h => h.source === '/_astro/(.*)');
    assert.ok(astroHeader, '/_astro/(.*) header must exist');
    const astroCache = astroHeader.headers.find(h => h.key === 'Cache-Control');
    assert.match(astroCache.value, /immutable/, 'Hashed assets in /_astro can be immutable');
  });
});
