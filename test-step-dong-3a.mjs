import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEO_PAGES,
  getPublishedSeoPages,
  isPagePublished,
  validateSeoPageContentCompleteness,
} from './src/data/pages.ts';

const DIST_DIR = path.resolve('dist');

describe('STEP DONG-3A: Balcony Elastic Coating Dong Pilot Draft Suite', () => {
  const sanggyeBalcony = SEO_PAGES.find((p) => p.id === 'balcony-elastic-coating_nowon-sanggye');
  const myeonmokBalcony = SEO_PAGES.find((p) => p.id === 'balcony-elastic-coating_jungnang-myeonmok');

  test('1. Both Balcony Dong pilots exist in SEO_PAGES registry', () => {
    assert.ok(sanggyeBalcony, 'Sanggye balcony pilot must exist in SEO_PAGES');
    assert.ok(myeonmokBalcony, 'Myeonmok balcony pilot must exist in SEO_PAGES');
    assert.equal(SEO_PAGES.length, 100, 'Total SEO_PAGES must be exactly 100');
  });

  test('2. Approved and Published status: isPublished=true, contentStatus=approved, isPagePublished=true', () => {
    assert.equal(sanggyeBalcony.isPublished, true, 'Sanggye balcony must have isPublished: true');
    assert.equal(sanggyeBalcony.contentStatus, 'approved', 'Sanggye balcony must have contentStatus: approved');
    assert.equal(isPagePublished(sanggyeBalcony), true, 'Sanggye balcony isPagePublished must be true');

    assert.equal(myeonmokBalcony.isPublished, true, 'Myeonmok balcony must have isPublished: true');
    assert.equal(myeonmokBalcony.contentStatus, 'approved', 'Myeonmok balcony must have contentStatus: approved');
    assert.equal(isPagePublished(myeonmokBalcony), true, 'Myeonmok balcony isPagePublished must be true');

    const published = getPublishedSeoPages();
    assert.equal(published.length, 24, 'Exactly 24 pages published (12 Gu + 12 Dong)');
    const unpublished = SEO_PAGES.filter((p) => !published.includes(p));
    assert.equal(unpublished.length, 76, 'Exactly 76 pages unpublished (12 Gu + 64 Dong)');
  });

  test('3. SEO metadata exact conformity (Title with AS보장, H1, Meta Description)', () => {
    // Sanggye
    assert.equal(sanggyeBalcony.metaTitle, '상계동 베란다탄성코트 시공 | AS보장 | 올케어탄성');
    assert.equal(sanggyeBalcony.h1, '상계동 베란다탄성코트 시공 안내');
    assert.ok(
      sanggyeBalcony.metaDescription.startsWith('상계동 베란다탄성코트 시공'),
      'Sanggye meta description must start with dynamic keyword'
    );
    assert.equal(sanggyeBalcony.urlPath, '/seo/balcony-elastic-coating/seoul-sanggye-dong.html');

    // Myeonmok
    assert.equal(myeonmokBalcony.metaTitle, '면목동 베란다탄성코트 시공 | AS보장 | 올케어탄성');
    assert.equal(myeonmokBalcony.h1, '면목동 베란다탄성코트 시공 안내');
    assert.ok(
      myeonmokBalcony.metaDescription.startsWith('면목동 베란다탄성코트 시공'),
      'Myeonmok meta description must start with dynamic keyword'
    );
    assert.equal(myeonmokBalcony.urlPath, '/seo/balcony-elastic-coating/seoul-myeonmok-dong.html');
  });

  test('4. Content completeness & P0 structural integrity (3 spaces, 3 scope, 5 FAQs)', () => {
    const sanggyeVal = validateSeoPageContentCompleteness(sanggyeBalcony);
    assert.equal(sanggyeVal.valid, true, `Sanggye content validation failed: ${sanggyeVal.errors.join(', ')}`);

    const myeonmokVal = validateSeoPageContentCompleteness(myeonmokBalcony);
    assert.equal(myeonmokVal.valid, true, `Myeonmok content validation failed: ${myeonmokVal.errors.join(', ')}`);

    assert.equal(sanggyeBalcony.content.targetSpaces.length, 3, 'Sanggye must have 3 target spaces');
    assert.equal(sanggyeBalcony.content.scopeFactors.length, 3, 'Sanggye must have 3 scope factors');
    assert.equal(sanggyeBalcony.content.consultationPreps.length, 4, 'Sanggye must have 4 consultation preps');
    assert.equal(sanggyeBalcony.content.processSteps.length, 4, 'Sanggye must have 4 process steps');
    assert.equal(sanggyeBalcony.content.faqs.length, 5, 'Sanggye must have exactly 5 FAQs');

    assert.equal(myeonmokBalcony.content.targetSpaces.length, 3, 'Myeonmok must have 3 target spaces');
    assert.equal(myeonmokBalcony.content.scopeFactors.length, 3, 'Myeonmok must have 3 scope factors');
    assert.equal(myeonmokBalcony.content.consultationPreps.length, 4, 'Myeonmok must have 4 consultation preps');
    assert.equal(myeonmokBalcony.content.processSteps.length, 4, 'Myeonmok must have 4 process steps');
    assert.equal(myeonmokBalcony.content.faqs.length, 5, 'Myeonmok must have exactly 5 FAQs');
  });

  test('5. Genuine differentiation between Sanggye and Myeonmok Balcony content', () => {
    const sFaqs = sanggyeBalcony.content.faqs.map((f) => f.question);
    const mFaqs = myeonmokBalcony.content.faqs.map((f) => f.question);

    let identicalCount = 0;
    for (const q of sFaqs) {
      if (mFaqs.includes(q)) identicalCount++;
    }
    assert.equal(identicalCount, 0, 'Sanggye and Myeonmok FAQs must be completely distinct');

    // No AS claims inside FAQs
    for (const f of sanggyeBalcony.content.faqs) {
      assert.equal(f.answer.includes('AS 보장 기간'), false, 'No fake AS claims in Sanggye FAQ');
      assert.equal(f.answer.includes('결로 완전 방지'), false, 'No false claims in Sanggye FAQ');
    }
    for (const f of myeonmokBalcony.content.faqs) {
      assert.equal(f.answer.includes('AS 보장 기간'), false, 'No fake AS claims in Myeonmok FAQ');
      assert.equal(f.answer.includes('결로 완전 방지'), false, 'No false claims in Myeonmok FAQ');
    }
  });

  test('6. Production release build: HTML files generated in dist', () => {
    const sanggyeHtml = path.join(DIST_DIR, 'seo/balcony-elastic-coating/seoul-sanggye-dong.html');
    const myeonmokHtml = path.join(DIST_DIR, 'seo/balcony-elastic-coating/seoul-myeonmok-dong.html');

    assert.equal(fs.existsSync(sanggyeHtml), true, 'Sanggye balcony HTML must exist in dist');
    assert.equal(fs.existsSync(myeonmokHtml), true, 'Myeonmok balcony HTML must exist in dist');
  });

  test('7. Screenshots generated and stored in artifact directory', () => {
    const artifactOutDir = 'C:\\Users\\wogus\\.gemini\\antigravity\\brain\\66fb9482-d14c-4494-8fb4-5213323bfc7b\\dong-preview';
    const expectedShots = [
      'sanggye-balcony-elastic-pc.png',
      'sanggye-balcony-elastic-mo.png',
      'myeonmok-balcony-elastic-pc.png',
      'myeonmok-balcony-elastic-mo.png',
    ];

    for (const shot of expectedShots) {
      const p = path.join(artifactOutDir, shot);
      assert.ok(fs.existsSync(p), `Screenshot must exist: ${shot}`);
      const stat = fs.statSync(p);
      assert.ok(stat.size > 10000, `Screenshot ${shot} size must be valid (>10KB)`);
    }
  });

  test('8. FAQ minimal correction verification: no unverified rigid numbers', () => {
    const sFaq4 = sanggyeBalcony.content.faqs[3].answer;
    assert.equal(sFaq4.includes('5~10cm'), false, 'Sanggye FAQ must not contain rigid 5~10cm');
    assert.equal(sFaq4.includes('1~2일'), false, 'Sanggye FAQ must not contain rigid 1~2일');
    assert.ok(sFaq4.includes('현장 구조와 환기 여건'), 'Sanggye FAQ must emphasize site-specific ventilation');

    const mFaq2 = myeonmokBalcony.content.faqs[1].answer;
    assert.equal(mFaq2.includes('30~50cm'), false, 'Myeonmok FAQ must not contain rigid 30~50cm');
    assert.ok(mFaq2.includes('현장 배치에 맞춰 사전 상담'), 'Myeonmok FAQ must emphasize customized consultation');

    const mFaq4 = myeonmokBalcony.content.faqs[3].answer;
    assert.equal(mFaq4.includes('최소 1~2일간'), false, 'Myeonmok FAQ must not contain rigid 1~2일');
    assert.ok(mFaq4.includes('개별 안내'), 'Myeonmok FAQ must emphasize customized notice');
  });
});
