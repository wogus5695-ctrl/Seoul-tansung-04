import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('STEP AS-1: Regional SEO AS Guarantee Title Verification Suite', () => {
  const targets = [
    {
      file: 'dist/seo/elastic-coating/seoul-nowon-gu.html',
      name: '노원구 탄성코트',
      expectedTitle: '노원구 탄성코트 시공 | AS보장 | 올케어탄성',
      expectedH1: '노원구 탄성코트 시공 안내',
      expectedDesc:
        '노원구 탄성코트 시공, 벽면 상태와 밑작업 과정이 궁금하신가요? 베란다·세탁실의 도막 들뜸과 균열을 살펴보고 보양, 바탕면 정리, 도포 및 마감 과정을 안내합니다.',
      expectedCanonical: 'https://www.seoulallcaretan.com/seo/elastic-coating/seoul-nowon-gu.html',
    },
    {
      file: 'dist/seo/elastic-coating/seoul-dobong-gu.html',
      name: '도봉구 탄성코트',
      expectedTitle: '도봉구 탄성코트 시공 | AS보장 | 올케어탄성',
      expectedH1: '도봉구 탄성코트 시공 안내',
      expectedDesc:
        '도봉구 탄성코트 시공 전, 어떤 부분을 확인해야 할까요? 베란다·세탁실의 기존 도막과 창호·배관 주변 상태를 살펴보고 시설물 보양부터 바탕면 정리, 시공 과정을 안내합니다.',
      expectedCanonical: 'https://www.seoulallcaretan.com/seo/elastic-coating/seoul-dobong-gu.html',
    },
    {
      file: 'dist/seo/balcony-elastic-coating/seoul-nowon-gu.html',
      name: '노원구 베란다탄성코트',
      expectedTitle: '노원구 베란다탄성코트 시공 | AS보장 | 올케어탄성',
      expectedH1: '노원구 베란다탄성코트 시공 안내',
      expectedDesc:
        '노원구 베란다탄성코트 시공, 창호 주변 밑작업이 궁금하신가요? 들뜬 도막과 균열, 시설물 보양 상태를 확인하고 바탕면 정리부터 도포·마감까지 작업 순서를 안내합니다.',
      expectedCanonical: 'https://www.seoulallcaretan.com/seo/balcony-elastic-coating/seoul-nowon-gu.html',
    },
  ];

  test('1. Exact title update to AS보장 for all 3 published regional pages', () => {
    for (const t of targets) {
      assert.ok(fs.existsSync(t.file), `${t.file} must exist`);
      const html = fs.readFileSync(t.file, 'utf8');

      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      assert.ok(titleMatch, `${t.name} <title> must exist`);
      assert.strictEqual(titleMatch[1], t.expectedTitle, `${t.name} Title exact match`);
    }
  });

  test('2. 100% synchronization of <title>, og:title, and twitter:title', () => {
    for (const t of targets) {
      const html = fs.readFileSync(t.file, 'utf8');

      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/)?.[1];
      const twTitle = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/)?.[1];

      assert.ok(ogTitle, `${t.name} og:title must exist`);
      assert.ok(twTitle, `${t.name} twitter:title must exist`);
      assert.strictEqual(ogTitle, t.expectedTitle, `${t.name} og:title matches expected`);
      assert.strictEqual(twTitle, t.expectedTitle, `${t.name} twitter:title matches expected`);
      assert.strictEqual(title, ogTitle, `${t.name} title and og:title strictly match`);
      assert.strictEqual(title, twTitle, `${t.name} title and twitter:title strictly match`);
    }
  });

  test('3. Zero regression on Meta Description, H1, Canonical, and Hero Image', () => {
    for (const t of targets) {
      const html = fs.readFileSync(t.file, 'utf8');

      // Description
      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
      assert.ok(descMatch, `${t.name} description exists`);
      assert.strictEqual(descMatch[1], t.expectedDesc, `${t.name} description preserved`);

      // H1 (single)
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
      assert.strictEqual(h1Matches?.length, 1, `${t.name} exactly one H1`);
      const h1Text = h1Matches[0].replace(/<[^>]+>/g, '').trim();
      assert.strictEqual(h1Text, t.expectedH1, `${t.name} H1 text preserved`);

      // Canonical
      const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
      assert.ok(canonMatch, `${t.name} canonical exists`);
      assert.strictEqual(canonMatch[1], t.expectedCanonical, `${t.name} canonical preserved`);

      // Hero OG Image
      const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
      assert.ok(ogImgMatch, `${t.name} og:image exists`);
      assert.strictEqual(
        ogImgMatch[1],
        'https://www.seoulallcaretan.com/images/hero/hero-bg-default.jpg',
        `${t.name} hero og:image preserved`
      );
    }
  });

  test('4. Preservation of exactly 5 FAQs on each regional page without arbitrary additions', () => {
    for (const t of targets) {
      const html = fs.readFileSync(t.file, 'utf8');
      const faqSummaries = html.match(/<summary[^>]*>[\s\S]*?Q\d+\.[\s\S]*?<\/summary>/gi) || [];
      assert.strictEqual(faqSummaries.length, 5, `${t.name} must preserve exactly 5 FAQs`);
    }
  });

  test('5. Non-target pages (Main, Hub, Guide) titles are completely untouched', () => {
    // Main page
    const mainHtml = fs.readFileSync('dist/index.html', 'utf8');
    const mainTitle = mainHtml.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.strictEqual(mainTitle, '서울 탄성코트 전문업체 | 올케어탄성');

    // Hub page
    const hubHtml = fs.readFileSync('dist/sitemap-seoul.html', 'utf8');
    const hubTitle = hubHtml.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.strictEqual(hubTitle, '서울 탄성코트 시공지역 안내 | 올케어탄성');

    // Guide Index
    const guideHtml = fs.readFileSync('dist/guide.html', 'utf8');
    const guideTitle = guideHtml.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.strictEqual(guideTitle, '탄성코트 시공 정보 | 올케어탄성');
  });
});
