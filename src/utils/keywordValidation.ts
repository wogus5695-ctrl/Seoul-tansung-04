import {
  getAllDynamicKeywords,
  isDistrictKeyword,
  isDongKeyword,
  type DynamicKeyword,
} from '../data/keywordRegistry.ts';

/**
 * RSS 가이드 포스트의 키워드 배정 자격 검증 (구 단위 전용 게이트)
 * 
 * [원칙]
 * - RSS 발행은 오직 자치구(Gu) 단위 동적키워드만 허용됩니다.
 * - 동(Dong) 단위 키워드를 Guide에 배정하려는 시도는 [RSS POLICY VIOLATION] 예외를 발생시키며 즉시 차단됩니다.
 */
export function assertDistrictRssKeyword(keywordId: string): void {
  if (isDongKeyword(keywordId) || !isDistrictKeyword(keywordId)) {
    throw new Error(`[RSS POLICY VIOLATION] 동 단위 키워드("${keywordId}")는 RSS 가이드 포스트에 배정할 수 없습니다. RSS 발행은 구 단위 키워드만 허용됩니다.`);
  }
}

/**
 * 텍스트 정규화 유틸리티
 * 
 * 마크다운 및 HTML 태그를 제거하고, 순수 텍스트 본문만 추출한 후
 * 공백을 단일 스페이스로 정규화합니다.
 */
export function extractPlainText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. HTML 스크립트 및 스타일 태그 내용 제거
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 2. HTML 주석 제거
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 3. 마크다운 코드 블록 제거 (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // 4. 마크다운 인라인 코드 제거 (`...`)
  text = text.replace(/`([^`]+)`/g, '$1');

  // 5. 마크다운 이미지 태그 제거 (![alt](url))
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // 6. 마크다운 링크 태그에서 텍스트만 추출 ([text](url) -> text)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 7. 마크다운 헤더 기호 제거 (#, ##, ### 등)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 8. 마크다운 인용구 기호 제거 (> )
  text = text.replace(/^>\s+/gm, '');

  // 9. 마크다운 목록 기호 제거 (*, -, +, 1. 등)
  text = text.replace(/^[\*\-\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 10. 마크다운 굵게/기울임 기호 제거 (**, *, __, _)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // 11. HTML 태그 제거 (<...>)
  text = text.replace(/<[^>]+>/g, ' ');

  // 12. 공백 및 줄바꿈 정규화 (유니코드 공백, 줄바꿈 등을 단일 띄어쓰기로 통일)
  text = text.replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * 텍스트 내 특정 키워드의 출현 횟수 계산
 */
export function countKeywordOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;

  const normalizedText = extractPlainText(text);
  const normalizedKeyword = extractPlainText(keyword);

  if (!normalizedKeyword) return 0;

  let count = 0;
  let pos = 0;
  while ((pos = normalizedText.indexOf(normalizedKeyword, pos)) !== -1) {
    count++;
    pos += normalizedKeyword.length;
  }
  return count;
}

/**
 * 키워드 사용 횟수 검증 결과 인터페이스
 */
export interface KeywordUsageValidationResult {
  valid: boolean;
  keyword: string;
  titleCount: number;
  bodyCount: number;
  foreignKeywordCollisions: string[];
  errors: string[];
}

/**
 * 게시글 제목 및 본문의 키워드 사용 횟수 검증 함수
 * 
 * [검증 원칙]
 * 1. 배정된 키워드는 제목(title)에 정확히 1회 출현해야 합니다.
 * 2. 배정된 키워드는 본문(body)에 정확히 1회 출현해야 합니다.
 * 3. 0회 출현 또는 2회 이상 출현 시 승인이 차단됩니다.
 * 4. 다른 지역/서비스의 등록 동적키워드가 제목/본문에 무단 침범했는지 검사합니다.
 */
export function validatePostKeywordUsage(
  title: string,
  body: string,
  assignedKeyword: string,
  allKeywords: DynamicKeyword[] = getAllDynamicKeywords()
): KeywordUsageValidationResult {
  const errors: string[] = [];
  const foreignKeywordCollisions: string[] = [];

  const cleanTitle = extractPlainText(title);
  const cleanBody = extractPlainText(body);
  const cleanKeyword = extractPlainText(assignedKeyword);

  const titleCount = countKeywordOccurrences(cleanTitle, cleanKeyword);
  const bodyCount = countKeywordOccurrences(cleanBody, cleanKeyword);

  // 1. 제목 사용 횟수 검증
  if (titleCount === 0) {
    errors.push(`[제목 키워드 누락] 배정 키워드("${cleanKeyword}")가 제목에 사용되지 않았습니다. (요구: 정확히 1회, 실제: 0회)`);
  } else if (titleCount > 1) {
    errors.push(`[제목 키워드 초과] 배정 키워드("${cleanKeyword}")가 제목에 ${titleCount}회 중복 사용되었습니다. (요구: 정확히 1회)`);
  }

  // 2. 본문 사용 횟수 검증
  if (bodyCount === 0) {
    errors.push(`[본문 키워드 누락] 배정 키워드("${cleanKeyword}")가 본문에 사용되지 않았습니다. (요구: 정확히 1회, 실제: 0회)`);
  } else if (bodyCount > 1) {
    errors.push(`[본문 키워드 초과] 배정 키워드("${cleanKeyword}")가 본문에 ${bodyCount}회 과다 사용되었습니다. (요구: 정확히 1회)`);
  }

  // 3. 타 동적키워드 오용/침범 검사
  for (const kw of allKeywords) {
    const foreignKwText = extractPlainText(kw.keyword);
    if (foreignKwText !== cleanKeyword) {
      const inTitle = countKeywordOccurrences(cleanTitle, foreignKwText);
      const inBody = countKeywordOccurrences(cleanBody, foreignKwText);
      if (inTitle > 0 || inBody > 0) {
        foreignKeywordCollisions.push(
          `타 키워드("${foreignKwText}") 발견: 제목 ${inTitle}회, 본문 ${inBody}회`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    keyword: cleanKeyword,
    titleCount,
    bodyCount,
    foreignKeywordCollisions,
    errors,
  };
}
