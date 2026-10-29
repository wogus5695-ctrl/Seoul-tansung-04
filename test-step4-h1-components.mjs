import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const COMPONENTS_DIR = path.resolve('src/components/common');

test('STEP 4-H-1: Component Extensions & Regression Test Suite', async (t) => {

  await t.test('1. PreConsultationGuide.astro source integrity and interface exports', () => {
    const filePath = path.join(COMPONENTS_DIR, 'PreConsultationGuide.astro');
    assert.ok(fs.existsSync(filePath), 'PreConsultationGuide.astro must exist');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.match(content, /export interface GuideItem/, 'Must export GuideItem interface');
    assert.match(content, /export interface Props/, 'Must export Props interface');
    assert.match(content, /items\?: GuideItem\[\]/, 'Props must accept optional items');
    assert.match(content, /title\?: string/, 'Props must accept optional title');
    assert.match(content, /description\?: string/, 'Props must accept optional description');
    assert.match(content, /subDescription\?: string/, 'Props must accept optional subDescription');
    assert.match(content, /DEFAULT_ITEMS/, 'Must have default items for zero-prop calls');
    assert.doesNotMatch(content, /<h1[\s>]/, 'Must NOT contain any h1 tag');
  });

  await t.test('2. ProcessTimeline.astro source integrity and interface exports', () => {
    const filePath = path.join(COMPONENTS_DIR, 'ProcessTimeline.astro');
    assert.ok(fs.existsSync(filePath), 'ProcessTimeline.astro must exist');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.match(content, /export interface TimelineStep/, 'Must export TimelineStep interface');
    assert.match(content, /export interface Props/, 'Must export Props interface');
    assert.match(content, /steps\?: TimelineStep\[\]/, 'Props must accept optional steps');
    assert.match(content, /keyword\?: string/, 'Props must accept optional keyword');
    assert.match(content, /title\?: string/, 'Props must accept optional title');
    assert.match(content, /description\?: string/, 'Props must accept optional description');
    assert.match(content, /isFourSteps/, 'Must handle 4-step dynamic layout for regional pages');
    assert.match(content, /grid-cols-4/, 'Must support grid-cols-4');
    assert.match(content, /grid-cols-5/, 'Must support grid-cols-5');
    assert.doesNotMatch(content, /<h1[\s>]/, 'Must NOT contain any h1 tag');
  });

  await t.test('3. DistrictPointsSection.astro source integrity and design system compliance', () => {
    const filePath = path.join(COMPONENTS_DIR, 'DistrictPointsSection.astro');
    assert.ok(fs.existsSync(filePath), 'DistrictPointsSection.astro must exist');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.match(content, /export interface Props/, 'Must export Props interface');
    assert.match(content, /targetSpaces\?: TargetSpaceItem\[\]/, 'Props must accept targetSpaces');
    assert.match(content, /scopeFactors\?: ScopeFactorItem\[\]/, 'Props must accept scopeFactors');
    assert.match(content, /keyword: string/, 'Props must require keyword');
    assert.match(content, /regionName\?: string/, 'Props must accept regionName');
    
    // Design tokens
    assert.match(content, /#F5F3EE/, 'Must use background #F5F3EE');
    assert.match(content, /#FAF8F5/, 'Must use card background #FAF8F5');
    assert.match(content, /#E7D9C1/, 'Must use border #E7D9C1');
    assert.match(content, /#3E443B/, 'Must use heading color #3E443B');
    assert.match(content, /#4F5844/, 'Must use accent color #4F5844');
    assert.match(content, /#5C5549/, 'Must use body text color #5C5549');

    // Strict SEO heading hierarchy
    assert.doesNotMatch(content, /<h1[\s>]/, 'Must NOT contain any h1 tag');
    assert.match(content, /<h2[\s>]/, 'Must use h2 for section titles');
    assert.match(content, /<h3[\s>]/, 'Must use h3 for card titles');
  });

  await t.test('4. Main page (dist/index.html) default rendering verification (Zero Regression)', () => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'dist/index.html must exist');
    const html = fs.readFileSync(indexPath, 'utf8');

    // 1. Single H1 check
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    assert.strictEqual(h1Matches?.length, 1, 'Main page must have exactly 1 H1 tag');
    assert.match(h1Matches[0], /서울 탄성코트 전문 시공, 올케어탄성/, 'H1 content must match expected brand/service keyword');

    // 2. PreConsultationGuide default render in index.html
    assert.match(html, /상담 전, 아래 내용을 확인해 주세요!/, 'PreConsultationGuide title must exist in index.html');
    assert.match(html, /미리 확인할 수 있는 정보만 알려주셔도 좋습니다\./, 'PreConsultationGuide description must exist');
    assert.match(html, /벽면 상태와 작업 범위를 파악해 보다 원활하게 상담을 진행할 수 있습니다\./, 'PreConsultationGuide subDescription must exist');
    assert.match(html, /pre-consultation-guide\.webp/, 'PreConsultationGuide webp image source must exist');
    assert.match(html, /pre-consultation-guide\.jpg/, 'PreConsultationGuide fallback image must exist');
    assert.match(html, /시공이 필요한 공간/, 'Guide item 1 title must exist');
    assert.match(html, /기존 벽면 상태/, 'Guide item 2 title must exist');
    assert.match(html, /현장사진 준비/, 'Guide item 3 title must exist');
    assert.match(html, /대략적인 작업 범위/, 'Guide item 4 title must exist');
    assert.match(html, /현장 내부 작업 조건/, 'Guide item 5 title must exist');
    assert.match(html, /시공 지역 및 희망 일정/, 'Guide item 6 title must exist');

    // 3. ProcessTimeline default render in index.html
    assert.match(html, /상담부터 작업까지/, 'ProcessTimeline title must exist');
    assert.match(html, /현장 상태와 위치를 공유해주시면 <strong class="font-semibold text-\[#2D322A\]">탄성코트<\/strong> 상담부터 견적, 작업 일정 안내까지 보다 빠르게 도와드릴 수 있습니다\./, 'ProcessTimeline description with keyword must match');
    assert.match(html, /grid-cols-5/, 'ProcessTimeline must use 5-column grid for 5 steps on PC');
    assert.match(html, /상담 접수/, 'Step 1 title must exist');
    assert.match(html, /현장 상태 확인/, 'Step 2 title must exist');
    assert.match(html, /작업 범위 안내/, 'Step 3 title must exist');
    assert.match(html, /보양 및 시공/, 'Step 4 title must exist');
    assert.match(html, /마감 확인 및 안내/, 'Step 5 title must exist');
  });

  await t.test('5. Existing pilot regional SEO pages (3 pages) intact & unaltered', () => {
    const pilotPages = [
      'seo/elastic-coating/seoul-nowon-gu.html',
      'seo/elastic-coating/seoul-dobong-gu.html',
      'seo/balcony-elastic-coating/seoul-nowon-gu.html',
    ];

    for (const pilot of pilotPages) {
      const pagePath = path.join(DIST_DIR, pilot);
      assert.ok(fs.existsSync(pagePath), `Pilot page ${pilot} must exist in dist`);
      const html = fs.readFileSync(pagePath, 'utf8');

      // Verify single H1
      const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
      assert.strictEqual(h1Count, 1, `Pilot page ${pilot} must have exactly 1 H1`);

      // Verify regional unique sections are preserved
      assert.match(html, /시공 대상 공간 안내/, `Pilot page ${pilot} must retain target spaces`);
      assert.match(html, /작업 범위와 견적에 영향을 주는 실제 조건/, `Pilot page ${pilot} must retain scope factors`);
      // In STEP 4-H-4A, all 3 published pages use the unified PreConsultationGuide layout
      assert.match(html, /상담 전, 아래 내용을 확인해 주세요!/, `Pilot page ${pilot} must have unified consultation prep guide`);
      assert.match(html, /시공 과정 안내/, `Pilot page ${pilot} must retain process steps`);
    }
  });

  await t.test('6. Unapproved pages isolation check', () => {
    const seoDir = path.join(DIST_DIR, 'seo');
    if (fs.existsSync(seoDir)) {
      // Collect all html files in seo directory
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

      const seoHtmlFiles = findHtml(seoDir);
      assert.strictEqual(seoHtmlFiles.length, 5, 'Exactly 5 regional SEO pages should be generated under dist/seo');
    }
  });
});
