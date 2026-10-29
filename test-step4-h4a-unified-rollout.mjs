import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

test('STEP 4-H-4A: Regional Unified Template Rollout Test Suite', async (t) => {
  const nowonPath = path.join(DIST_DIR, 'seo/elastic-coating/seoul-nowon-gu.html');
  const dobongPath = path.join(DIST_DIR, 'seo/elastic-coating/seoul-dobong-gu.html');
  const nowonBalconyPath = path.join(DIST_DIR, 'seo/balcony-elastic-coating/seoul-nowon-gu.html');
  const templatePath = path.resolve('src/pages/seo/[service]/[district].astro');

  assert.ok(fs.existsSync(nowonPath), 'Nowon HTML must exist');
  assert.ok(fs.existsSync(dobongPath), 'Dobong HTML must exist');
  assert.ok(fs.existsSync(nowonBalconyPath), 'Nowon Balcony HTML must exist');
  assert.ok(fs.existsSync(templatePath), 'Template source must exist');

  const nowonHtml = fs.readFileSync(nowonPath, 'utf8');
  const dobongHtml = fs.readFileSync(dobongPath, 'utf8');
  const nowonBalconyHtml = fs.readFileSync(nowonBalconyPath, 'utf8');
  const templateSource = fs.readFileSync(templatePath, 'utf8');

  await t.test('1. Removal of isPilotLayout and legacy conditional branches in template source', () => {
    assert.doesNotMatch(templateSource, /isPilotLayout/, 'Template must not contain isPilotLayout');
    assert.doesNotMatch(templateSource, /TARGET SPACES/, 'Template must not contain legacy TARGET SPACES uppercase label');
    assert.doesNotMatch(templateSource, /SCOPE FACTORS/, 'Template must not contain legacy SCOPE FACTORS uppercase label');
    assert.doesNotMatch(templateSource, /HOW TO PREPARE/, 'Template must not contain legacy HOW TO PREPARE uppercase label');
    assert.doesNotMatch(templateSource, /WORK PROCESS/, 'Template must not contain legacy WORK PROCESS uppercase label');
  });

  await t.test('2. All 3 published pages have the 9 unified sections in exact order', () => {
    const pages = [
      { name: 'nowon', html: nowonHtml, h1: '노원구 탄성코트 시공 안내' },
      { name: 'dobong', html: dobongHtml, h1: '도봉구 탄성코트 시공 안내' },
      { name: 'nowonBalcony', html: nowonBalconyHtml, h1: '노원구 베란다탄성코트 시공 안내' },
    ];

    for (const p of pages) {
      // 01. Hero
      const h1Count = (p.html.match(/<h1[\s>]/gi) || []).length;
      assert.strictEqual(h1Count, 1, `${p.name} must have exactly 1 H1`);
      assert.match(p.html, new RegExp(`<h1[^>]*>${p.h1}</h1>`), `${p.name} H1 must match`);

      // Order checks
      const idxHero = p.html.indexOf('ALLCARE SEOUL');
      const idxGallery = p.html.indexOf('id="before-after"');
      const idxWall = p.html.indexOf('id="wall-check"');
      const idxDistrict = p.html.indexOf('id="district-points"');
      const idxSpaces = p.html.indexOf('id="spaces"');
      const idxProcess = p.html.indexOf('id="process"');
      const idxFaq = p.html.indexOf('id="faq"');
      const idxNotice = p.html.indexOf('서비스 지역 및 관련 안내');
      const idxConsult = p.html.indexOf('id="consultation"');

      assert.ok(idxHero > -1, `${p.name} Hero section missing`);
      assert.ok(idxGallery > idxHero, `${p.name} BeforeAfter must follow Hero`);
      assert.ok(idxWall > idxGallery, `${p.name} WallCheck must follow BeforeAfter`);
      assert.ok(idxDistrict > idxWall, `${p.name} DistrictPoints must follow WallCheck`);
      assert.ok(idxSpaces > idxDistrict, `${p.name} PreConsultation must follow DistrictPoints`);
      assert.ok(idxProcess > idxSpaces, `${p.name} ProcessTimeline must follow PreConsultation`);
      assert.ok(idxFaq > idxProcess, `${p.name} Faq must follow ProcessTimeline`);
      assert.ok(idxNotice > idxFaq, `${p.name} Notice must follow Faq`);
      assert.ok(idxConsult > idxNotice, `${p.name} ConsultationBanner must follow Notice`);
    }
  });

  await t.test('3. Dobong-gu Elastic Coating unique content preservation (Zero Omission)', () => {
    // SEO Meta (STEP AS-1: AS보장 검색 제목 반영)
    assert.match(dobongHtml, /<title>도봉구 탄성코트 시공 \| AS보장 \| 올케어탄성<\/title>/);
    assert.match(dobongHtml, /<meta name="description" content="[^"]*도봉구 탄성코트 시공 전, 어떤 부분을 확인해야 할까요\?/);
    assert.match(dobongHtml, /<meta property="og:title" content="도봉구 탄성코트 시공 \| AS보장 \| 올케어탄성"/);
    assert.match(dobongHtml, /<meta property="og:description" content="[^"]*도봉구 탄성코트 시공 전, 어떤 부분을 확인해야 할까요\?/);
    assert.match(dobongHtml, /<meta property="og:image" content="https:\/\/www\.seoulallcaretan\.com\/images\/hero\/hero-bg-default\.jpg"/);
    assert.match(dobongHtml, /<meta property="og:image:width" content="1024"/);
    assert.match(dobongHtml, /<meta property="og:image:height" content="768"/);

    // Target Spaces (3 items)
    assert.match(dobongHtml, /베란다 \(발코니 창가 벽면\)/);
    assert.match(dobongHtml, /외벽 창호 주변 기존 도막 및 결로 흔적 점검/);
    assert.match(dobongHtml, /세탁실 및 다용도실/);
    assert.match(dobongHtml, /배수 설비 주변 벽체와 습기 정체 환경 확인/);
    assert.match(dobongHtml, /보일러실 및 실외기 공간/);
    assert.match(dobongHtml, /배관 관통부 단차 및 설비 주변 보양 여건/);

    // Scope Factors (3 items)
    assert.match(dobongHtml, /기존 수성페인트 노후도 및 박리 상태/);
    assert.match(dobongHtml, /창호 주변 실리콘 코킹 상태/);
    assert.match(dobongHtml, /작업 공간 내 대형 가전 및 짐 배치/);

    // Consultation Preps (4 items)
    assert.match(dobongHtml, /도봉구 현장 작업 공간 전경/);
    assert.match(dobongHtml, /벽면 하자 부위 근접 사진/);
    assert.match(dobongHtml, /설비 및 배관 위치 확인/);
    assert.match(dobongHtml, /도봉구 내 대략적인 위치\(쌍문동, 방학동, 창동, 도봉동 등\)/);

    // Process Steps (4 items)
    assert.match(dobongHtml, /현장 확인 및 정밀 보양/);
    assert.match(dobongHtml, /바탕면 긁어내기 및 균열 정리/);
    assert.match(dobongHtml, /탄성코트 균일 도포/);
    assert.match(dobongHtml, /보양재 제거 및 마감 검수/);

    // FAQs (5 items)
    assert.match(dobongHtml, /도봉구 지역은 방문 견적이나 시공 상담이 가능한가요\?/);
    assert.match(dobongHtml, /거주 중인 세대인데 세탁실이나 베란다 시공이 가능한가요\?/);
    assert.match(dobongHtml, /시공 후 도료 냄새는 어느 정도이며 건조에 얼마나 걸리나요\?/);
    assert.match(dobongHtml, /탄성코트를 시공하면 결로와 누수를 완전히 해결할 수 있나요\?/);
    assert.match(dobongHtml, /도봉구 탄성코트 시공 상담 전에 무엇을 준비해야 하나요\?/);
  });

  await t.test('4. Nowon-gu Balcony Elastic Coating unique content preservation (Zero Omission)', () => {
    // SEO Meta (STEP AS-1: AS보장 검색 제목 반영)
    assert.match(nowonBalconyHtml, /<title>노원구 베란다탄성코트 시공 \| AS보장 \| 올케어탄성<\/title>/);
    assert.match(nowonBalconyHtml, /<meta name="description" content="[^"]*노원구 베란다탄성코트 시공, 창호 주변 밑작업이 궁금하신가요\?/);
    assert.match(nowonBalconyHtml, /<meta property="og:title" content="노원구 베란다탄성코트 시공 \| AS보장 \| 올케어탄성"/);
    assert.match(nowonBalconyHtml, /<meta property="og:description" content="[^"]*노원구 베란다탄성코트 시공, 창호 주변 밑작업이 궁금하신가요\?/);
    assert.match(nowonBalconyHtml, /<meta property="og:image" content="https:\/\/www\.seoulallcaretan\.com\/images\/hero\/hero-bg-default\.jpg"/);
    assert.match(nowonBalconyHtml, /<meta property="og:image:width" content="1024"/);
    assert.match(nowonBalconyHtml, /<meta property="og:image:height" content="768"/);

    // Target Spaces (3 items)
    assert.match(nowonBalconyHtml, /전면 베란다 \(거실·안방 창가\)/);
    assert.match(nowonBalconyHtml, /창호 주변 도막 들뜸과 햇빛 노출 점검/);
    assert.match(nowonBalconyHtml, /후면 베란다 \(주방 인접 공간\)/);
    assert.match(nowonBalconyHtml, /외벽 환기구 주변 및 그늘진 벽체 습기 점검/);
    assert.match(nowonBalconyHtml, /베란다 창고 · 수납장 내부/);
    assert.match(nowonBalconyHtml, /밀폐 구역 공기 정체 및 벽면 통기 환경 확인/);

    // Scope Factors (3 items)
    assert.match(nowonBalconyHtml, /베란다 창호 주변 코킹 및 균열 상태/);
    assert.match(nowonBalconyHtml, /베란다 화단 철거 흔적 및 벽면 요철/);
    assert.match(nowonBalconyHtml, /베란다 내 시설물 및 보양 난이도/);

    // Consultation Preps (4 items)
    assert.match(nowonBalconyHtml, /베란다 창가 전체 전경 사진/);
    assert.match(nowonBalconyHtml, /창호 주변 및 균열 근접 사진/);
    assert.match(nowonBalconyHtml, /수납장 및 시설물 배치 상태/);

    // Process Steps (4 items)
    assert.match(nowonBalconyHtml, /베란다 현장 확인 및 보양/);
    assert.match(nowonBalconyHtml, /창호 주변 바탕면 정리/);
    assert.match(nowonBalconyHtml, /베란다 탄성코트 고른 도포/);
    assert.match(nowonBalconyHtml, /보양재 철거 및 환기 안내/);

    // FAQs (5 items)
    assert.match(nowonBalconyHtml, /베란다 벽면의 기존 페인트가 들뜬 경우 바로 시공할 수 있나요\?/);
    assert.match(nowonBalconyHtml, /창호 주변에 습기나 얼룩이 있으면 무엇을 먼저 확인해야 하나요\?/);
    assert.match(nowonBalconyHtml, /베란다에 짐이나 시설물이 있어도 작업할 수 있나요\?/);
    assert.match(nowonBalconyHtml, /베란다 탄성코트 시공으로 결로나 누수를 완전히 해결할 수 있나요\?/);
    assert.match(nowonBalconyHtml, /베란다 탄성코트 상담 전에 어떤 정보를 준비하면 좋은가요\?/);
  });

  await t.test('5. Dynamic Section Titles on all 3 pages', () => {
    // District points section title
    assert.match(nowonHtml, /노원구 탄성코트 시공 전 확인할 사항/);
    assert.match(dobongHtml, /도봉구 탄성코트 시공 전 확인할 사항/);
    assert.match(nowonBalconyHtml, /노원구 베란다탄성코트 시공 전 확인할 사항/);

    // ConsultationBanner title
    assert.match(nowonHtml, /노원구 탄성코트, 전문가에게 상담하세요!/);
    assert.match(dobongHtml, /도봉구 탄성코트, 전문가에게 상담하세요!/);
    assert.match(nowonBalconyHtml, /노원구 베란다탄성코트, 전문가에게 상담하세요!/);
  });

  await t.test('6. Unapproved pages strictly blocked (Zero HTML generated in dist)', () => {
    const seoDir = path.join(DIST_DIR, 'seo');
    const findHtml = (dir) => {
      let results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(findHtml(fullPath));
        } else if (entry.name.endsWith('.html')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const files = findHtml(seoDir);
    assert.strictEqual(files.length, 5, 'Exactly 5 approved regional pages allowed in dist/seo');
  });
});
