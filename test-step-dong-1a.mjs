import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEO_PAGES,
  getPublishedSeoPages,
  isPagePublished,
} from './src/data/pages.ts';

const DIST_DIR = path.resolve('dist');

describe('STEP DONG-1A: Dong SEO Relocation & Accordion Suite', () => {
  const sanggyePage = SEO_PAGES.find((p) => p.id === 'elastic-coating_nowon-sanggye');
  const myeonmokPage = SEO_PAGES.find((p) => p.id === 'elastic-coating_jungnang-myeonmok');

  test('1. Sanggye and Myeonmok are approved and published (24 published total)', () => {
    assert.equal(sanggyePage.isPublished, true);
    assert.equal(sanggyePage.contentStatus, 'approved');
    assert.equal(isPagePublished(sanggyePage), true);

    assert.equal(myeonmokPage.isPublished, true);
    assert.equal(myeonmokPage.contentStatus, 'approved');
    assert.equal(isPagePublished(myeonmokPage), true);

    const published = getPublishedSeoPages();
    assert.equal(published.length, 24, 'Exactly 24 pages published (12 Gu + 12 Dong)');
  });

  test('2. Astro component template renders unified collapsible section after ConsultationBanner', () => {
    const pageTemplate = fs.readFileSync('src/pages/seo/[service]/[district].astro', 'utf8');
    
    // Position 04 legacy non-dong conditional branch is removed in STEP STRUCTURE-1
    assert.equal(
      pageTemplate.includes("page.regionLevel !== 'dong'"),
      false,
      'Section 04 legacy branch must be removed in STRUCTURE-1 unification'
    );

    // Collapsible section is rendered unconditionally after ConsultationBanner
    const idxConsultation = pageTemplate.indexOf('<ConsultationBanner');
    const idxCollapsible = pageTemplate.lastIndexOf('<DistrictPointsSection');
    assert.ok(idxConsultation > 0, 'ConsultationBanner must exist');
    assert.ok(idxCollapsible > idxConsultation, 'Collapsible section must come AFTER ConsultationBanner');
    assert.ok(pageTemplate.includes('collapsible={true}'), 'Unified section must pass collapsible={true}');
  });

  test('3. DistrictPointsSection component supports collapsible details/summary UI', () => {
    const compCode = fs.readFileSync('src/components/common/DistrictPointsSection.astro', 'utf8');
    assert.ok(compCode.includes('collapsible?: boolean'), 'DistrictPointsSection Props must declare collapsible');
    assert.ok(compCode.includes('<details'), 'Must render <details> element in collapsible mode');
    assert.ok(compCode.includes('<summary'), 'Must render <summary> element in collapsible mode');
    assert.ok(
      compCode.includes('시공 전 작업 공간·견적 기준 자세히 보기'),
      'Summary must include exact text "시공 전 작업 공간·견적 기준 자세히 보기"'
    );
  });

  test('4. All Published Gu pages adopt unified layout with bottom accordion (STEP STRUCTURE-1)', () => {
    const publishedGu = getPublishedSeoPages().filter((p) => p.regionLevel === 'gu');
    assert.equal(publishedGu.length, 12, 'Exactly 12 Gu pages published');
    for (const p of publishedGu) {
      assert.equal(p.regionLevel, 'gu');
      const htmlPath = path.join(DIST_DIR, 'seo', p.serviceSlug, `${p.districtSlug}.html`);
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        // Gu page now adopts the unified collapsible summary text
        assert.equal(
          html.includes('시공 전 작업 공간·견적 기준 자세히 보기'),
          true,
          `Gu page ${p.id} must adopt unified collapsible summary`
        );
        // Gu page has district-points AFTER consultation
        const idxDistrict = html.indexOf('id="district-points"');
        const idxConsult = html.indexOf('전문가에게 상담하세요!');
        assert.ok(idxDistrict > 0 && idxConsult > 0, 'Both sections must exist');
        assert.ok(idxDistrict > idxConsult, 'On Gu pages, district-points must follow consultation');
      }
    }
  });

  test('5. HTML generated in dist/seo/ for Sanggye and Myeonmok in standard build', () => {
    const sanggyeHtml = path.join(DIST_DIR, 'seo', 'elastic-coating', 'seoul-sanggye-dong.html');
    const myeonmokHtml = path.join(DIST_DIR, 'seo', 'elastic-coating', 'seoul-myeonmok-dong.html');
    assert.equal(fs.existsSync(sanggyeHtml), true, 'Sanggye HTML must exist in dist');
    assert.equal(fs.existsSync(myeonmokHtml), true, 'Myeonmok HTML must exist in dist');
  });
});
