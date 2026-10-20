import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUIDES,
  isGuidePublished,
  getPublishedGuides,
} from './src/data/guides.ts';
import {
  KEYWORD_LEDGER,
} from './src/data/keywordRegistry.ts';
import {
  validatePostKeywordUsage,
} from './src/utils/keywordValidation.ts';

test('STEP RSS-3B: Factuality & Pre-Publish Audit Suite', async (t) => {
  const post = GUIDES[0];
  assert.ok(post, 'Target post must exist in GUIDES');

  await t.test('1. [교정 A] 초킹과 백화 현상이 정확히 분리 설명됨 (동일 현상 단정 금지)', () => {
    // Must NOT equate chalking with efflorescence
    assert.equal(post.body.includes('초크 현상(백화'), false, '초킹과 백화를 단일 증상으로 괄호 병기해서는 안 됨');
    assert.ok(post.body.includes('초킹 현상'), '초킹 현상 설명 존재');
    assert.ok(post.body.includes('백화 현상'), '백화 현상 설명 존재');
    assert.ok(post.body.includes('염류가 표면으로 이동'), '백화의 화학적 원인(염류 이동) 기술');
  });

  await t.test('2. [교정 B] 노후화 과정을 순차적 3단계로 단정하지 않음', () => {
    assert.equal(post.body.includes('세 단계로 진행'), false, '노후화를 필연적 3단계로 단정하는 문구 제거');
    assert.ok(post.body.includes('반드시 순서대로 진행되는 것은 아니며'), '복합적 증상 발현 조건부 설명');
  });

  await t.test('3. [교정 C] 부분 보수 기준에서 임의의 "손바닥 크기" 수치 제거 및 종합 기준 제시', () => {
    assert.equal(post.body.includes('손바닥 크기'), false, '임의의 손바닥 크기 기준 제거');
    assert.ok(post.body.includes('단순히 손상된 면적의 크기만으로 판단할 수 없습니다'), '면적 외 종합 판단 명시');
    assert.ok(post.body.includes('주변 도막의 부착 상태'), '주변 도막 부착성 확인 명시');
  });

  await t.test('4. [교정 D] 전체 시공 기준에서 임의의 "30% 이상" 수치 제거 및 조건부 설명 적용', () => {
    assert.equal(post.body.includes('30% 이상'), false, '기술적 근거 없는 30% 수치 제거');
    assert.ok(post.body.includes('연쇄적으로 벗겨지거나'), '광범위 점검 기준의 정성적 기술 조건 제시');
  });

  await t.test('5. [교정 E] 탄성코트 성능의 조건부 설명 및 누수 원인 수리와의 명확한 분리', () => {
    assert.equal(post.body.includes('탁월한 효과를 내는'), false, '무조건적 탁월성 주장 완화');
    assert.ok(post.body.includes('모든 누수나 결로를 원천적으로 차단해 주는 방수 도료는 아닙니다'), '방수 도료와의 명확한 한계 명시');
    assert.ok(post.body.includes('누수 원인을 방치한 채 마감재만 칠하는 것은 근본적인 해결이 되지 않습니다'), '누수 선행 해결 필요성 명시');
  });

  await t.test('6. [KEYWORD_LEDGER 시간 검증] assignedAt이 미래 시각이 아닌 실제 예약 시점으로 정합 보존되며 status는 PUBLISHED', () => {
    const entry = KEYWORD_LEDGER.find((e) => e.keywordId === 'elastic-coating_nowon');
    assert.ok(entry, 'Ledger entry exists');
    assert.equal(entry.status, 'PUBLISHED');
    assert.equal(entry.postId, 'guide-nowon-wall-peeling-check');

    // 2026-10-20 18:12:00 KST (+09:00) converted to UTC ISO is 2026-10-20T09:12:00.000Z
    assert.equal(entry.assignedAt, '2026-10-20T09:12:00.000Z');
    assert.equal(entry.assignedAt.includes('18:12:00.000Z'), false, '오류였던 미래 시각(2026-10-21 03:12 KST) 제거');

    const assignedDate = new Date(entry.assignedAt);
    const now = new Date();
    // Must be in the past or present, never in the future relative to execution
    assert.ok(assignedDate.getTime() <= now.getTime() + 60000, 'assignedAt must not be in the future');
  });

  await t.test('7. 제목 키워드 1회 및 본문 키워드 1회 엄격 검증', () => {
    const validation = validatePostKeywordUsage(post.title, post.body, '노원구 탄성코트');
    assert.equal(validation.valid, true);
    assert.equal(validation.titleCount, 1, 'Title keyword must be exactly 1');
    assert.equal(validation.bodyCount, 1, 'Body keyword must be exactly 1');
    assert.equal(validation.errors.length, 0);
  });

  await t.test('8. 게시글 상태는 approved 및 isPublished: true로 정식 공개됨', () => {
    assert.equal(post.contentStatus, 'approved');
    assert.equal(post.isPublished, true);
    assert.equal(post.publishedAt, '2026-10-20T14:15:00.000Z');
    assert.equal(post.updatedAt, '2026-10-20T14:15:00.000Z');
    assert.equal(isGuidePublished(post), true);
    assert.equal(getPublishedGuides(GUIDES).length, 1);
  });
});
