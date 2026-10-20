import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

test('STEP 4-H-2: Regional Layout Unification Pilot Suite', async (t) => {
  const nowonPath = path.join(DIST_DIR, 'seo/elastic-coating/seoul-nowon-gu.html');
  const dobongPath = path.join(DIST_DIR, 'seo/elastic-coating/seoul-dobong-gu.html');
  const nowonBalconyPath = path.join(DIST_DIR, 'seo/balcony-elastic-coating/seoul-nowon-gu.html');
  const indexPath = path.join(DIST_DIR, 'index.html');

  assert.ok(fs.existsSync(nowonPath), 'Nowon pilot HTML must exist');
  assert.ok(fs.existsSync(dobongPath), 'Dobong HTML must exist');
  assert.ok(fs.existsSync(nowonBalconyPath), 'Nowon balcony HTML must exist');
  assert.ok(fs.existsSync(indexPath), 'Index HTML must exist');

  const nowonHtml = fs.readFileSync(nowonPath, 'utf8');
  const dobongHtml = fs.readFileSync(dobongPath, 'utf8');
  const nowonBalconyHtml = fs.readFileSync(nowonBalconyPath, 'utf8');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  await t.test('1. SEO Technical Metadata & Single H1 Verification on Nowon Pilot', () => {
    // 1. Single H1 check
    const h1Matches = nowonHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    assert.strictEqual(h1Matches?.length, 1, 'Nowon pilot must have exactly 1 H1 tag');
    assert.match(h1Matches[0], /노원구 탄성코트 시공 안내/, 'H1 content must match exact page.h1');

    // 2. Title & Meta Description
    assert.match(nowonHtml, /<title>노원구 탄성코트 전문업체 \| 올케어탄성<\/title>/, 'Title must be preserved');
    assert.match(nowonHtml, /<meta name="description" content="[^"]*노원구 탄성코트 시공을 고려하고 계신가요\?/, 'Meta description must be preserved');

    // 3. Canonical URL
    assert.match(nowonHtml, /<link rel="canonical" href="https:\/\/www\.seoulallcaretan\.com\/seo\/elastic-coating\/seoul-nowon-gu\.html"/, 'Canonical must match exact URL');

    // 4. JSON-LD Schemas
    assert.match(nowonHtml, /"@type":"WebPage"/, 'WebPage JSON-LD must be present');
    assert.match(nowonHtml, /"@type":"BreadcrumbList"/, 'BreadcrumbList JSON-LD must be present');
  });

  await t.test('2. 9 Unified Layout Sections in Exact Order on Nowon Pilot', () => {
    // 01. HeroSection
    const idx01 = nowonHtml.indexOf('ALLCARE SEOUL · 서울 노원구');
    assert.ok(idx01 > -1, '01. Hero section badge must exist');

    // 02. BeforeAfterGallery
    const idx02 = nowonHtml.indexOf('id="before-after"');
    assert.ok(idx02 > idx01, '02. BeforeAfterGallery must follow Hero');
    assert.match(nowonHtml, /올케어 작업 현장/, 'Section 02 title must be present');

    // 03. WallCheckSection (variant="full" dark band)
    const idx03 = nowonHtml.indexOf('id="wall-check"');
    assert.ok(idx03 > idx02, '03. WallCheckSection must follow BeforeAfterGallery');
    assert.match(nowonHtml, /bg-\[#2D322A\]/, 'WallCheckSection must use full-width dark background');

    // 04. DistrictPointsSection
    const idx04 = nowonHtml.indexOf('id="district-points"');
    assert.ok(idx04 > idx03, '04. DistrictPointsSection must follow WallCheckSection');
    assert.match(nowonHtml, /노원구 탄성코트 시공 전 확인할 사항/, 'DistrictPointsSection title must be present');

    // 05. PreConsultationGuide
    const idx05 = nowonHtml.indexOf('id="spaces"');
    assert.ok(idx05 > idx04, '05. PreConsultationGuide must follow DistrictPointsSection');
    assert.match(nowonHtml, /상담 전, 아래 내용을 확인해 주세요!/, 'PreConsultationGuide title must be present');

    // 06. ProcessTimeline
    const idx06 = nowonHtml.indexOf('id="process"');
    assert.ok(idx06 > idx05, '06. ProcessTimeline must follow PreConsultationGuide');
    assert.match(nowonHtml, /탄성코트 시공 과정 안내/, 'ProcessTimeline title must be present');

    // 07. FaqAccordion
    const idx07 = nowonHtml.indexOf('id="faq"');
    assert.ok(idx07 > idx06, '07. FaqAccordion must follow ProcessTimeline');
    assert.match(nowonHtml, /노원구 시공 관련 자주 묻는 질문/, 'Faq title must be present');

    // 08. Service scope notice & internal links
    const idx08 = nowonHtml.indexOf('서비스 지역 및 관련 안내');
    assert.ok(idx08 > idx07, '08. Internal links section must follow FaqAccordion');

    // 09. ConsultationBanner (variant="main")
    const idx09 = nowonHtml.indexOf('id="consultation"');
    assert.ok(idx09 > idx08, '09. ConsultationBanner must follow internal links');
    assert.match(nowonHtml, /노원구 탄성코트, 전문가에게 상담하세요!/, 'ConsultationBanner title must be present');
    assert.match(nowonHtml, /tel:01084926900/, 'Phone CTA must be present');
    assert.match(nowonHtml, /https:\/\/pf\.kakao\.com\/_UjxcFX/, 'Kakao CTA must be present');
  });

  await t.test('3. 100% Regional Content Preservation on Nowon Pilot (Zero Omission)', () => {
    // A. Target Spaces (3 items)
    assert.match(nowonHtml, /베란다 \(앞·뒤 발코니\)/, 'TargetSpace 1 title preserved');
    assert.match(nowonHtml, /외벽 창호 결로 및 기존 도막 상태 점검/, 'TargetSpace 1 subtitle preserved');
    assert.match(nowonHtml, /세탁실 \(다용도실\)/, 'TargetSpace 2 title preserved');
    assert.match(nowonHtml, /배관 주변 습기 및 환기 여건 확인/, 'TargetSpace 2 subtitle preserved');
    assert.match(nowonHtml, /다용도 공간 · 실외기실/, 'TargetSpace 3 title preserved');
    assert.match(nowonHtml, /벽면 요철 및 보양 환경 점검/, 'TargetSpace 3 subtitle preserved');

    // B. Scope Factors (3 items)
    assert.match(nowonHtml, /기존 도막 상태 \(들뜸·노후도\)/, 'ScopeFactor 1 title preserved');
    assert.match(nowonHtml, /균열 및 실리콘 상태/, 'ScopeFactor 2 title preserved');
    assert.match(nowonHtml, /작업 공간 시설물 및 보양 난이도/, 'ScopeFactor 3 title preserved');

    // C. Consultation Preps (4 items)
    assert.match(nowonHtml, /작업 희망 공간 전체 전경/, 'ConsultationPrep 1 title preserved');
    assert.match(nowonHtml, /문제 부위 근접 사진/, 'ConsultationPrep 2 title preserved');
    assert.match(nowonHtml, /설비 및 가전 배치 상태/, 'ConsultationPrep 3 title preserved');
    assert.match(nowonHtml, /상담 희망 지역 및 일정/, 'ConsultationPrep 4 title preserved');

    // D. Process Steps (4 items)
    assert.match(nowonHtml, /현장 확인 및 보양 작업/, 'ProcessStep 1 title preserved');
    assert.match(nowonHtml, /바탕면 정리 및 부분 보수/, 'ProcessStep 2 title preserved');
    assert.match(nowonHtml, /탄성코트 도포 작업/, 'ProcessStep 3 title preserved');
    assert.match(nowonHtml, /보양재 제거 및 마감 안내/, 'ProcessStep 4 title preserved');

    // E. FAQs (5 items)
    assert.match(nowonHtml, /노원구 지역은 방문 상담이나 시공 상담이 가능한가요\?/, 'FAQ 1 preserved');
    assert.match(nowonHtml, /거주 중인 살림집인데 시공이 가능한가요\?/, 'FAQ 2 preserved');
    assert.match(nowonHtml, /시공 후 냄새와 건조 시간은 어느 정도 걸리나요\?/, 'FAQ 3 preserved');
    assert.match(nowonHtml, /탄성코트를 시공하면 결로와 누수를 완전히 해결할 수 있나요\?/, 'FAQ 4 preserved');
    assert.match(nowonHtml, /기존 페인트가 많이 들떠 있으면 작업 범위나 견적이 달라지나요\?/, 'FAQ 5 preserved');

    // F. Notice & Internal Links
    assert.match(nowonHtml, /올케어탄성은 서울 노원구를 포함하여 서울 전역 주거 공간을 대상으로 방문 시공 상담을 제공합니다/, 'Notice preserved');
    assert.match(nowonHtml, /href="\/seo\/elastic-coating\/seoul-dobong-gu\.html"/, 'Link to approved Dobong pilot preserved');
    assert.match(nowonHtml, /href="\/seo\/balcony-elastic-coating\/seoul-nowon-gu\.html"/, 'Link to approved Nowon Balcony pilot preserved');
  });

  await t.test('4. Full Rollout Verification (Dobong & Nowon Balcony adopt unified layout)', () => {
    // In STEP 4-H-4A, Dobong and Nowon Balcony now use the unified layout
    assert.match(dobongHtml, /id="before-after"/, 'Dobong must contain BeforeAfterGallery');
    assert.match(dobongHtml, /id="district-points"/, 'Dobong must contain DistrictPointsSection');
    assert.match(dobongHtml, /id="spaces"/, 'Dobong must contain PreConsultationGuide');

    assert.match(nowonBalconyHtml, /id="before-after"/, 'Nowon Balcony must contain BeforeAfterGallery');
    assert.match(nowonBalconyHtml, /id="district-points"/, 'Nowon Balcony must contain DistrictPointsSection');
    assert.match(nowonBalconyHtml, /id="spaces"/, 'Nowon Balcony must contain PreConsultationGuide');

    // Main page unchanged
    assert.match(indexHtml, /서울 탄성코트 전문 시공, 올케어탄성/, 'Main page H1 preserved');
    assert.match(indexHtml, /서울 지역별 시공 안내/, 'Main page regions preserved');
  });
});
