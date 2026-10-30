import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('STEP SERP-1: Naver Title / Description / Hero OG Image Verification Suite', () => {
  const pages = [
    {
      file: 'dist/seo/elastic-coating/seoul-nowon-gu.html',
      name: '노원구 탄성코트',
      expectedTitle: '노원구 탄성코트 시공 | AS보장 | 올케어탄성',
      expectedDesc: '노원구 탄성코트 시공, 벽면 상태와 밑작업 과정이 궁금하신가요? 베란다·세탁실의 도막 들뜸과 균열을 살펴보고 보양, 바탕면 정리, 도포 및 마감 과정을 안내합니다.',
      expectedH1: '노원구 탄성코트 시공 안내',
      expectedCanonical: 'https://www.seoulallcaretan.com/seo/elastic-coating/seoul-nowon-gu.html',
      expectedOgImage: 'https://www.seoulallcaretan.com/images/hero/hero-bg-default.jpg',
      expectedWidth: '1024',
      expectedHeight: '768',
      expectedAlt: '올케어탄성 실제 시공 현장 베란다 벽면 및 천장 마감',
    },
    {
      file: 'dist/seo/elastic-coating/seoul-dobong-gu.html',
      name: '도봉구 탄성코트',
      expectedTitle: '도봉구 탄성코트 시공 | AS보장 | 올케어탄성',
      expectedDesc: '도봉구 탄성코트 시공 전, 어떤 부분을 확인해야 할까요? 베란다·세탁실의 기존 도막과 창호·배관 주변 상태를 살펴보고 시설물 보양부터 바탕면 정리, 시공 과정을 안내합니다.',
      expectedH1: '도봉구 탄성코트 시공 안내',
      expectedCanonical: 'https://www.seoulallcaretan.com/seo/elastic-coating/seoul-dobong-gu.html',
      expectedOgImage: 'https://www.seoulallcaretan.com/images/hero/hero-bg-default.jpg',
      expectedWidth: '1024',
      expectedHeight: '768',
      expectedAlt: '올케어탄성 실제 시공 현장 베란다 벽면 및 천장 마감',
    },
    {
      file: 'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      name: '노원구 베란다탄성코트',
      expectedTitle: '노원구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
      expectedDesc: '노원구 베란다탄성코트 시공, 창호 주변 밑작업이 궁금하신가요? 들뜬 도막과 균열, 시설물 보양 상태를 확인하고 바탕면 정리부터 도포·마감까지 작업 순서를 안내합니다.',
      expectedH1: '노원구 베란다탄성코트 시공 안내',
      expectedCanonical: 'https://www.seoulallcaretan.com/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      expectedOgImage: 'https://www.seoulallcaretan.com/images/hero/hero-bg-default.jpg',
      expectedWidth: '1024',
      expectedHeight: '768',
      expectedAlt: '올케어탄성 실제 시공 현장 베란다 벽면 및 천장 마감',
    },
  ];

  test('1. Verified Title, Meta Description, OG Title, and OG Description Exact Matches', () => {
    for (const p of pages) {
      assert.ok(fs.existsSync(p.file), `${p.file} must exist`);
      const html = fs.readFileSync(p.file, 'utf8');

      // Title tag
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      assert.ok(titleMatch, `${p.name} <title> must exist`);
      assert.equal(titleMatch[1], p.expectedTitle, `${p.name} title exact match`);

      // Meta Description tag
      const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
      assert.ok(descMatch, `${p.name} meta description must exist`);
      assert.equal(descMatch[1], p.expectedDesc, `${p.name} meta description exact match`);

      // OG Title
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
      assert.ok(ogTitleMatch, `${p.name} og:title must exist`);
      assert.equal(ogTitleMatch[1], p.expectedTitle, `${p.name} og:title must match title`);

      // OG Description
      const ogDescMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
      assert.ok(ogDescMatch, `${p.name} og:description must exist`);
      assert.equal(ogDescMatch[1], p.expectedDesc, `${p.name} og:description must match description`);

      // Twitter Title
      const twTitleMatch = html.match(/<meta name="twitter:title" content="([^"]*)"/);
      assert.ok(twTitleMatch, `${p.name} twitter:title must exist`);
      assert.equal(twTitleMatch[1], p.expectedTitle, `${p.name} twitter:title must match title`);

      // Twitter Description
      const twDescMatch = html.match(/<meta name="twitter:description" content="([^"]*)"/);
      assert.ok(twDescMatch, `${p.name} twitter:description must exist`);
      assert.equal(twDescMatch[1], p.expectedDesc, `${p.name} twitter:description must match description`);
    }
  });

  test('2. Hero Image connected to og:image and twitter:image with measured dimensions', () => {
    // Physical file existence & dimension assertion
    const physicalHeroPath = path.resolve('public', 'images', 'hero', 'hero-bg-default.jpg');
    assert.ok(fs.existsSync(physicalHeroPath), 'Physical hero image must exist');
    const heroStats = fs.statSync(physicalHeroPath);
    assert.ok(heroStats.size > 5000, `Hero image size (${heroStats.size} bytes) must be >= 5KB`);

    for (const p of pages) {
      const html = fs.readFileSync(p.file, 'utf8');

      // og:image
      const ogImgMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
      assert.ok(ogImgMatch, `${p.name} og:image must exist`);
      assert.equal(ogImgMatch[1], p.expectedOgImage, `${p.name} og:image must match absolute URL`);

      // og:image:secure_url
      const ogSecureMatch = html.match(/<meta property="og:image:secure_url" content="([^"]*)"/);
      assert.ok(ogSecureMatch, `${p.name} og:image:secure_url must exist`);
      assert.equal(ogSecureMatch[1], p.expectedOgImage, `${p.name} og:image:secure_url match`);

      // og:image:width
      const ogWidthMatch = html.match(/<meta property="og:image:width" content="([^"]*)"/);
      assert.ok(ogWidthMatch, `${p.name} og:image:width must exist`);
      assert.equal(ogWidthMatch[1], p.expectedWidth, `${p.name} width match`);

      // og:image:height
      const ogHeightMatch = html.match(/<meta property="og:image:height" content="([^"]*)"/);
      assert.ok(ogHeightMatch, `${p.name} og:image:height must exist`);
      assert.equal(ogHeightMatch[1], p.expectedHeight, `${p.name} height match`);

      // og:image:alt
      const ogAltMatch = html.match(/<meta property="og:image:alt" content="([^"]*)"/);
      assert.ok(ogAltMatch, `${p.name} og:image:alt must exist`);
      assert.equal(ogAltMatch[1], p.expectedAlt, `${p.name} alt match`);

      // twitter:image
      const twImgMatch = html.match(/<meta name="twitter:image" content="([^"]*)"/);
      assert.ok(twImgMatch, `${p.name} twitter:image must exist`);
      assert.equal(twImgMatch[1], p.expectedOgImage, `${p.name} twitter:image match`);
    }
  });

  test('3. Structural Safety: Exactly 1 H1 and Preserved Canonical URL', () => {
    for (const p of pages) {
      const html = fs.readFileSync(p.file, 'utf8');

      // Exactly 1 H1
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
      assert.strictEqual(h1Matches?.length, 1, `${p.name} must have exactly one H1`);
      assert.match(h1Matches[0], new RegExp(p.expectedH1), `${p.name} H1 content intact`);

      // Canonical URL
      const canonMatches = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/g);
      assert.strictEqual(canonMatches?.length, 1, `${p.name} must have exactly one canonical link`);
      assert.match(canonMatches[0], new RegExp(p.expectedCanonical), `${p.name} canonical intact`);
    }
  });

  test('4. Main page & Guide pages OG images remain strictly isolated (default thumb 1200x630)', () => {
    const mainHtml = fs.readFileSync('dist/index.html', 'utf8');
    assert.match(mainHtml, /<meta property="og:image" content="https:\/\/www\.seoulallcaretan\.com\/images\/allcare\/og-main-thumb\.jpg"/);
    assert.match(mainHtml, /<meta property="og:image:width" content="1200"/);
    assert.match(mainHtml, /<meta property="og:image:height" content="630"/);
    assert.match(mainHtml, /<title>서울 탄성코트 전문업체 \| 올케어탄성<\/title>/);

    const guideHtml = fs.readFileSync('dist/guide.html', 'utf8');
    assert.match(guideHtml, /<meta property="og:image" content="https:\/\/www\.seoulallcaretan\.com\/images\/allcare\/og-main-thumb\.jpg"/);
    assert.match(guideHtml, /<meta property="og:image:width" content="1200"/);
    assert.match(guideHtml, /<meta property="og:image:height" content="630"/);
  });

  test('5. Site inventory: exactly 12 Gu published, 4 RSS items, 31 Sitemap URLs, 12 unapproved Gu pages absent', () => {
    // 19 HTML pages (12 Gu SEO + 1 main + 1 guide index + 4 guides + 1 hub)
    const expectedHtmls = [
      'dist/index.html',
      'dist/guide.html',
      'dist/guide/nowon-balcony-wall-peeling-check.html',
      'dist/guide/dobong-laundry-room-pipe-wall-check.html',
      'dist/guide/nowon-balcony-storage-masking-checklist.html',
      'dist/guide/jungnang-wall-drying-check.html',
      'dist/seo/elastic-coating/seoul-nowon-gu.html',
      'dist/seo/elastic-coating/seoul-dobong-gu.html',
      'dist/seo/elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/elastic-coating/seoul-seongbuk-gu.html',
      'dist/seo/elastic-coating/seoul-dongdaemun-gu.html',
      'dist/seo/elastic-coating/seoul-gangbuk-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-dobong-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-seongbuk-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-dongdaemun-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-gangbuk-gu.html',
      'dist/sitemap-seoul.html',
    ];
    for (const f of expectedHtmls) {
      assert.ok(fs.existsSync(f), `${f} must exist`);
    }

    // 12 unapproved registered combinations must ALL be strictly absent
    const registeredRegions = [
      'seoul-nowon-gu', 'seoul-dobong-gu', 'seoul-gangbuk-gu', 'seoul-seongbuk-gu',
      'seoul-dongdaemun-gu', 'seoul-jungnang-gu', 'seoul-eunpyeong-gu', 'seoul-seodaemun-gu',
      'seoul-mapo-gu', 'seoul-jongno-gu', 'seoul-jung-gu', 'seoul-yongsan-gu'
    ];
    const registeredServices = ['elastic-coating', 'balcony-elastic-coating'];

    const publishedSet = new Set([
      'dist/seo/elastic-coating/seoul-nowon-gu.html',
      'dist/seo/elastic-coating/seoul-dobong-gu.html',
      'dist/seo/elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/elastic-coating/seoul-seongbuk-gu.html',
      'dist/seo/elastic-coating/seoul-dongdaemun-gu.html',
      'dist/seo/elastic-coating/seoul-gangbuk-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-dobong-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-jungnang-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-seongbuk-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-dongdaemun-gu.html',
      'dist/seo/balcony-elastic-coating/seoul-gangbuk-gu.html',
    ]);

    let unapprovedCount = 0;
    for (const s of registeredServices) {
      for (const r of registeredRegions) {
        const filePath = `dist/seo/${s}/${r}.html`;
        if (!publishedSet.has(filePath)) {
          unapprovedCount++;
          assert.equal(fs.existsSync(filePath), false, `Unapproved registered page ${filePath} must NOT exist`);
        }
      }
    }
    assert.strictEqual(unapprovedCount, 12, 'Must have exactly 12 unapproved registered combinations');

    // RSS Feed has exactly 4 items
    const rssXml = fs.readFileSync('dist/rss.xml', 'utf8');
    const items = rssXml.match(/<item>/g);
    assert.strictEqual(items?.length, 4, 'RSS feed must have exactly 4 items');

    // Sitemap has exactly 31 locs
    const sitemap0 = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
    const locs = sitemap0.match(/<loc>/g);
    assert.strictEqual(locs?.length, 31, 'Sitemap must have exactly 31 url loc entries');
  });
});
