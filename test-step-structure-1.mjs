import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REGIONS } from './src/data/regions.ts';
import { SEO_PAGES, getPublishedSeoPages } from './src/data/pages.ts';

const DIST_DIR = path.resolve('dist');

describe('STEP STRUCTURE-1: Global SEO Layout Unification & Gu-Centric SEO Hub Suite', () => {
  const publishedPages = getPublishedSeoPages();
  const hubHtmlPath = path.join(DIST_DIR, 'sitemap-seoul.html');

  test('1. Inventory check: Exactly 17 published pages, 83 unpublished, 100 total', () => {
    assert.strictEqual(SEO_PAGES.length, 100, 'Total SEO pages must be exactly 100 (24 Gu + 76 Dong)');
    assert.strictEqual(publishedPages.length, 24, 'Published SEO pages must be exactly 24 (12 Gu + 12 Dong)');
    const unpublished = SEO_PAGES.filter((p) => !publishedPages.includes(p));
    assert.strictEqual(unpublished.length, 76, 'Unpublished SEO pages must be exactly 76 (12 Gu + 64 Dong)');
  });

  test('2. All 24 published regional pages adopt the unified collapsible bottom layout', () => {
    for (const page of publishedPages) {
      const htmlPath = path.join(DIST_DIR, 'seo', page.serviceSlug, `${page.districtSlug}.html`);
      assert.ok(fs.existsSync(htmlPath), `HTML file for ${page.id} must exist at ${htmlPath}`);

      const html = fs.readFileSync(htmlPath, 'utf8');

      // Check section ordering
      const idxWall = html.indexOf('id="wall-check"');
      const idxSpaces = html.indexOf('id="spaces"');
      const idxProcess = html.indexOf('id="process"');
      const idxFaq = html.indexOf('id="faq"');
      const idxNotice = html.indexOf('서비스 지역 및 관련 안내');
      const idxConsult = html.indexOf('id="consultation"');
      const idxDistrict = html.indexOf('id="district-points"');

      assert.ok(idxWall > 0, `${page.id}: Wall check section must exist`);
      assert.ok(idxSpaces > idxWall, `${page.id}: Spaces (PreConsultation) must follow Wall check`);
      assert.ok(idxProcess > idxSpaces, `${page.id}: Process must follow Spaces`);
      assert.ok(idxFaq > idxProcess, `${page.id}: Faq must follow Process`);
      assert.ok(idxConsult > idxFaq, `${page.id}: Consultation banner must follow Faq`);
      assert.ok(idxNotice > idxConsult, `${page.id}: Service notice must follow Consultation banner`);
      assert.ok(idxDistrict > idxNotice, `${page.id}: Collapsible DistrictPoints must follow Service notice`);

      // Check collapsible accordion tags and summary
      assert.ok(html.includes('<details'), `${page.id}: Must render <details> tag`);
      assert.ok(html.includes('<summary'), `${page.id}: Must render <summary> tag`);
      assert.ok(
        html.includes('시공 전 작업 공간·견적 기준 자세히 보기'),
        `${page.id}: Must include summary text "시공 전 작업 공간·견적 기준 자세히 보기"`
      );

      // Check all 6 cards preserved (3 target spaces + 3 scope factors)
      if (page.content) {
        for (const space of page.content.targetSpaces) {
          assert.ok(html.includes(space.title), `${page.id}: Target space title "${space.title}" must be preserved`);
        }
        for (const factor of page.content.scopeFactors) {
          assert.ok(html.includes(factor.title), `${page.id}: Scope factor title "${factor.title}" must be preserved`);
        }
      }
    }
  });

  test('3. SEO Hub (sitemap-seoul.html) has Gu-centric hierarchical structure', () => {
    assert.ok(fs.existsSync(hubHtmlPath), 'dist/sitemap-seoul.html must exist');
    const html = fs.readFileSync(hubHtmlPath, 'utf8');

    // Single H1
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    assert.strictEqual(h1Matches.length, 1, 'Exactly one H1 tag permitted on SEO Hub');
    assert.ok(h1Matches[0].includes('서울 탄성코트 시공지역 안내'), 'H1 text must match');

    // 1st tier: Gu headings (H2)
    const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
    assert.strictEqual(h2Matches.length, 6, 'Must have exactly 6 Gu sections (H2)');
    const guNames = h2Matches.map((h2) => h2.replace(/<[^>]+>/g, '').trim());
    assert.deepStrictEqual(guNames, ['노원구', '도봉구', '강북구', '성북구', '동대문구', '중랑구'], 'Gus must be in REGIONS order');

    // Verify unpublished Gus do NOT have H2 sections
    const unpublishedGus = REGIONS.filter((r) => !['nowon', 'dobong', 'gangbuk', 'seongbuk', 'dongdaemun', 'jungnang'].includes(r.id));
    for (const ug of unpublishedGus) {
      assert.equal(
        guNames.includes(ug.name),
        false,
        `Unpublished Gu ${ug.name} must NOT have an H2 section`
      );
    }

    // 2nd tier: Service headings (H3)
    const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];
    assert.strictEqual(h3Matches.length, 12, 'Must have exactly 12 service sub-sections across the 6 Gus');
    const serviceNames = h3Matches.map((h3) => h3.replace(/<[^>]+>/g, '').trim());
    assert.deepStrictEqual(
      serviceNames,
      ['탄성코트', '베란다탄성코트', '탄성코트', '베란다탄성코트', '탄성코트', '베란다탄성코트', '탄성코트', '베란다탄성코트', '탄성코트', '베란다탄성코트', '탄성코트', '베란다탄성코트'],
      'Service groups must appear in correct Gu and Service order'
    );
  });

  test('4. SEO Hub Clean Link Design: keyword text only, no URLs, no buttons, no arrows', () => {
    const html = fs.readFileSync(hubHtmlPath, 'utf8');

    // Extract all regional SEO links from the hub
    const linkMatches = [...html.matchAll(/<a\s+href="(\/seo\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.strictEqual(linkMatches.length, 24, 'Must have exactly 24 published links on the Hub');

    const expectedKeywords = [
      { url: '/seo/elastic-coating/seoul-nowon-gu.html', keyword: '노원구 탄성코트' },
      { url: '/seo/elastic-coating/seoul-sanggye-dong.html', keyword: '상계동 탄성코트' },
      { url: '/seo/elastic-coating/seoul-junggye-dong.html', keyword: '중계동 탄성코트' },
      { url: '/seo/elastic-coating/seoul-hagye-dong.html', keyword: '하계동 탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-nowon-gu.html', keyword: '노원구 베란다탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-sanggye-dong.html', keyword: '상계동 베란다탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-junggye-dong.html', keyword: '중계동 베란다탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-hagye-dong.html', keyword: '하계동 베란다탄성코트' },
      { url: '/seo/elastic-coating/seoul-dobong-gu.html', keyword: '도봉구 탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-dobong-gu.html', keyword: '도봉구 베란다탄성코트' },
      { url: '/seo/elastic-coating/seoul-gangbuk-gu.html', keyword: '강북구 탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-gangbuk-gu.html', keyword: '강북구 베란다탄성코트' },
      { url: '/seo/elastic-coating/seoul-seongbuk-gu.html', keyword: '성북구 탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-seongbuk-gu.html', keyword: '성북구 베란다탄성코트' },
      { url: '/seo/elastic-coating/seoul-dongdaemun-gu.html', keyword: '동대문구 탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-dongdaemun-gu.html', keyword: '동대문구 베란다탄성코트' },
      { url: '/seo/elastic-coating/seoul-jungnang-gu.html', keyword: '중랑구 탄성코트' },
      { url: '/seo/elastic-coating/seoul-myeonmok-dong.html', keyword: '면목동 탄성코트' },
      { url: '/seo/elastic-coating/seoul-sangbong-dong.html', keyword: '상봉동 탄성코트' },
      { url: '/seo/elastic-coating/seoul-junghwa-dong.html', keyword: '중화동 탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-jungnang-gu.html', keyword: '중랑구 베란다탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-myeonmok-dong.html', keyword: '면목동 베란다탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-sangbong-dong.html', keyword: '상봉동 베란다탄성코트' },
      { url: '/seo/balcony-elastic-coating/seoul-junghwa-dong.html', keyword: '중화동 베란다탄성코트' },
    ];

    for (let i = 0; i < expectedKeywords.length; i++) {
      const exp = expectedKeywords[i];
      const match = linkMatches[i];
      assert.strictEqual(match[1], exp.url, `Link ${i} URL must match ${exp.url}`);
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      assert.strictEqual(text, exp.keyword, `Link ${i} inner text must ONLY be the keyword "${exp.keyword}"`);
    }

    // Verify complete absence of legacy UI elements
    assert.equal(html.includes('상세 안내 보기'), false, 'Must NOT contain "상세 안내 보기" text');
    assert.equal(html.includes('&rarr;'), false, 'Must NOT contain "&rarr;" arrows');
    assert.equal(html.includes('→'), false, 'Must NOT contain "→" arrows');
  });

  test('5. Zero exposure of 76 unpublished dynamic keywords on SEO Hub', () => {
    const html = fs.readFileSync(hubHtmlPath, 'utf8');
    const unpublishedPages = SEO_PAGES.filter((p) => !publishedPages.includes(p));

    for (const up of unpublishedPages) {
      assert.equal(
        html.includes(`href="${up.urlPath}"`),
        false,
        `Unpublished URL ${up.urlPath} must NOT appear on SEO Hub`
      );
    }
  });

  test('6. Production metadata, guides, and RSS feed preservation', () => {
    // RSS Feed
    const rssPath = path.join(DIST_DIR, 'rss.xml');
    assert.ok(fs.existsSync(rssPath), 'rss.xml must exist');
    const rss = fs.readFileSync(rssPath, 'utf8');
    const rssItems = (rss.match(/<item>/g) || []).length;
    assert.strictEqual(rssItems, 4, 'RSS feed must have exactly 4 items');

    // 4 Guides exist in dist
    const guideFiles = [
      'guide/nowon-balcony-wall-peeling-check.html',
      'guide/dobong-laundry-room-pipe-wall-check.html',
      'guide/nowon-balcony-storage-masking-checklist.html',
      'guide/jungnang-wall-drying-check.html',
    ];
    for (const g of guideFiles) {
      assert.ok(fs.existsSync(path.join(DIST_DIR, g)), `Guide ${g} must exist in dist`);
    }

    // Contact phone number integrity
    const nowonHtml = fs.readFileSync(path.join(DIST_DIR, 'seo/elastic-coating/seoul-nowon-gu.html'), 'utf8');
    assert.ok(nowonHtml.includes('010-8492-6900'), 'Phone number must be preserved');
    assert.ok(nowonHtml.includes('tel:01084926900'), 'Tel link must be preserved');
  });
});
