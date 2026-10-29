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

  test('1. Sanggye and Myeonmok are approved and published (7 published total)', () => {
    assert.equal(sanggyePage.isPublished, true);
    assert.equal(sanggyePage.contentStatus, 'approved');
    assert.equal(isPagePublished(sanggyePage), true);

    assert.equal(myeonmokPage.isPublished, true);
    assert.equal(myeonmokPage.contentStatus, 'approved');
    assert.equal(isPagePublished(myeonmokPage), true);

    const published = getPublishedSeoPages();
    assert.equal(published.length, 7, 'Exactly 7 pages published (5 Gu + 2 Dong)');
  });

  test('2. Astro component template contains conditional Gu vs Dong relocation logic', () => {
    const pageTemplate = fs.readFileSync('src/pages/seo/[service]/[district].astro', 'utf8');
    
    // Position 04 is only rendered when regionLevel !== 'dong'
    assert.ok(
      pageTemplate.includes("page.regionLevel !== 'dong'") || pageTemplate.includes("page.regionLevel !== \"dong\""),
      'Section 04 must be conditionally rendered only for non-dong pages'
    );

    // Position 10 is rendered after ConsultationBanner when regionLevel === 'dong' with collapsible={true}
    const idxConsultation = pageTemplate.indexOf('<ConsultationBanner');
    const idxDongCollapsible = pageTemplate.lastIndexOf("page.regionLevel === 'dong'");
    assert.ok(idxConsultation > 0, 'ConsultationBanner must exist');
    assert.ok(idxDongCollapsible > idxConsultation, 'Dong collapsible section must come AFTER ConsultationBanner');
    assert.ok(pageTemplate.includes('collapsible={true}'), 'Dong section must pass collapsible={true}');
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

  test('4. Existing Published Gu pages retain original layout without accordion', () => {
    const publishedGu = getPublishedSeoPages().filter((p) => p.regionLevel === 'gu');
    assert.equal(publishedGu.length, 5, 'Exactly 5 Gu pages published');
    for (const p of publishedGu) {
      assert.equal(p.regionLevel, 'gu');
      const htmlPath = path.join(DIST_DIR, 'seo', p.serviceSlug, `${p.districtSlug}.html`);
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        // Gu page must NOT have the collapsible summary text
        assert.equal(
          html.includes('시공 전 작업 공간·견적 기준 자세히 보기'),
          false,
          `Gu page ${p.id} must NOT have collapsible summary`
        );
        // Gu page must have district-points BEFORE consultation
        const idxDistrict = html.indexOf('id="district-points"');
        const idxConsult = html.indexOf('전문가에게 상담하세요!');
        assert.ok(idxDistrict > 0 && idxConsult > 0, 'Both sections must exist');
        assert.ok(idxDistrict < idxConsult, 'On Gu pages, district-points must precede consultation');
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
