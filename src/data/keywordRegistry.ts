import { REGIONS, type Region } from './regions.ts';
import { SERVICES, type Service } from './services.ts';
import { DONGS, type Dong } from './dongs.ts';
import type { GuidePost } from './guides.ts';

/**
 * 키워드 배정 상태 정의
 * - AVAILABLE: 아직 어떤 게시글에도 배정되지 않은 사용 가능한 키워드
 * - RESERVED: 초안(draft) 또는 검토 중(in_review)인 게시글에 배정된 키워드
 * - PUBLISHED: 운영자 승인 및 정식 공개(approved + isPublished: true)된 게시글에 사용된 키워드
 */
export type KeywordStatus = 'AVAILABLE' | 'RESERVED' | 'PUBLISHED';

/**
 * 지역·서비스 동적키워드 데이터 인터페이스
 */
export interface DynamicKeyword {
  id: string; // e.g. 'elastic-coating_nowon', 'elastic-coating_nowon-sanggye'
  regionId: string;
  serviceId: string;
  regionName: string; // e.g. '노원구', '상계동'
  serviceName: string; // e.g. '탄성코트'
  keyword: string; // e.g. '노원구 탄성코트', '상계동 탄성코트'
  targetUrlPath: string; // e.g. '/seo/elastic-coating/seoul-nowon-gu.html'
  regionLevel: 'gu' | 'dong';
  parentRegionId?: string; // 동 단위일 경우 상위 구 ID (e.g. 'nowon')
}

/**
 * 키워드 영구 사용 이력 원장 항목 인터페이스
 */
export interface KeywordLedgerEntry {
  keywordId: string;
  postId: string;
  status: 'RESERVED' | 'PUBLISHED';
  assignedAt: string; // ISO 8601 문자열
  historicalNote?: string;
}

/**
 * 24개 기존 구 단위 지역·서비스 데이터 기반 동적키워드 자동 추출 함수
 * 
 * [확장성 원칙]
 * REGIONS 또는 SERVICES 배열에 신규 항목이 추가되더라도
 * 코드 수정 없이 전체 키워드 후보 목록을 자동으로 재계산합니다.
 * (기존 24개 구 단위 회귀 테스트 및 RSS 배정 기준 100% 보존)
 */
export function getAllDynamicKeywords(
  regions: Region[] = REGIONS,
  services: Service[] = SERVICES
): DynamicKeyword[] {
  const list: DynamicKeyword[] = [];
  for (const service of services) {
    for (const region of regions) {
      list.push({
        id: `${service.id}_${region.id}`,
        regionId: region.id,
        serviceId: service.id,
        regionName: region.name,
        serviceName: service.name,
        keyword: `${region.name} ${service.name}`,
        targetUrlPath: `/seo/${service.slug}/${region.slug}.html`,
        regionLevel: 'gu',
      });
    }
  }
  return list;
}

/**
 * 22개 신규 동 단위 법정동·서비스 데이터 기반 동적키워드 자동 추출 함수
 * 
 * [동 단위 키워드 정책]
 * 1. keywordId: ${service.id}_${parentRegionId}-${dongId} (예: elastic-coating_nowon-sanggye)
 * 2. keyword: 동명 + 작업명 (예: 상계동 탄성코트) - 구명 중복 배제
 * 3. targetUrlPath: /seo/${service.slug}/${dong.slug}.html
 */
export function getAllDongDynamicKeywords(
  dongs: Dong[] = DONGS,
  services: Service[] = SERVICES
): DynamicKeyword[] {
  const list: DynamicKeyword[] = [];
  for (const service of services) {
    for (const dong of dongs) {
      list.push({
        id: `${service.id}_${dong.parentRegionId}-${dong.id}`,
        regionId: dong.id,
        serviceId: service.id,
        regionName: dong.name,
        serviceName: service.name,
        keyword: `${dong.name} ${service.name}`,
        targetUrlPath: `/seo/${service.slug}/${dong.slug}.html`,
        regionLevel: 'dong',
        parentRegionId: dong.parentRegionId,
      });
    }
  }
  return list;
}

/**
 * 구 단위 24개 + 동 단위 22개 전체 46개 동적키워드 통합 조회 함수
 */
export function getAllCombinedDynamicKeywords(
  regions: Region[] = REGIONS,
  dongs: Dong[] = DONGS,
  services: Service[] = SERVICES
): DynamicKeyword[] {
  return [
    ...getAllDynamicKeywords(regions, services),
    ...getAllDongDynamicKeywords(dongs, services),
  ];
}

/**
 * 구 단위 키워드 여부 판정 함수 (RSS 발행 제한용)
 * 
 * RSS 게시글은 오직 구 단위 키워드만 허용되며, 동 단위 키워드는 RSS 발행이 원천 차단됩니다.
 */
export function isDistrictKeyword(keywordId: string): boolean {
  const districtKeywords = getAllDynamicKeywords();
  return districtKeywords.some((k) => k.id === keywordId);
}

/**
 * 동 단위 키워드 여부 판정 함수
 */
export function isDongKeyword(keywordId: string): boolean {
  const dongKeywords = getAllDongDynamicKeywords();
  return dongKeywords.some((k) => k.id === keywordId);
}

/**
 * 키워드 영구 사용 이력 원장 (Keyword Allocation Ledger)
 * 
 * [설계 원칙]
 * 1. 단일 게시글 배열(GUIDES)에만 의존하지 않고, 과거 발행(PUBLISHED)되거나 예약(RESERVED)된
 *    모든 키워드의 영구적 재사용을 방지합니다.
 * 2. 게시글 데이터가 삭제되거나 이동하더라도 이 원장의 기록은 유지되어 키워드 중복 배정을 영구 차단합니다.
 * 3. 별도의 외부 DB 없이 Git 버전 관리와 빌드 타임 검증으로 엄격하게 통제됩니다.
 * 
 * [동시성 및 충돌 해결 절차]
 * - 개발자 또는 작성자가 PR/커밋 전에 npm test 또는 astro check를 실행합니다.
 * - 동일 keywordId가 서로 다른 브랜치에서 예약된 경우 Git 머지 충돌 또는 빌드 검증 오류가 발생합니다.
 * - 해결 절차: 원장에 먼저 등록된(또는 먼저 머지된) 게시글이 해당 키워드의 우선권을 가지며,
 *   후순위 작업자는 getAllDynamicKeywords()에서 'AVAILABLE' 상태인 다른 키워드를 선택해야 합니다.
 */
export const KEYWORD_LEDGER: KeywordLedgerEntry[] = [
  {
    keywordId: 'elastic-coating_nowon',
    postId: 'guide-nowon-wall-peeling-check',
    status: 'PUBLISHED',
    assignedAt: '2026-10-20T09:12:00.000Z',
    historicalNote: 'RSS-3A: 첫 정보성 가이드 초안(들뜸 점검) 키워드 예약 (2026-10-20 18:12:00 KST) -> RSS-4: 정식 발행 (2026-10-20 23:15:00 KST)',
  },
  {
    keywordId: 'elastic-coating_dobong',
    postId: 'guide-dobong-laundry-pipe-check',
    status: 'PUBLISHED',
    assignedAt: '2026-10-21T01:26:00.000Z',
    historicalNote: 'STEP 4-H-6A: 도봉구 탄성코트 정보성 가이드 2호 초안 키워드 예약 (2026-10-21 10:26:00 KST) -> STEP 4-H-6B: 정식 발행 (2026-10-21 10:51:00 KST)',
  },
  {
    keywordId: 'balcony-elastic-coating_nowon',
    postId: 'guide-nowon-balcony-masking-checklist',
    status: 'PUBLISHED',
    assignedAt: '2026-10-21T01:26:00.000Z',
    historicalNote: 'STEP 4-H-6A: 노원구 베란다탄성코트 정보성 가이드 3호 초안 키워드 예약 (2026-10-21 10:26:00 KST) -> STEP 4-H-6B: 정식 발행 (2026-10-21 10:51:00 KST)',
  },
  {
    keywordId: 'elastic-coating_jungnang',
    postId: 'guide-jungnang-wall-drying-check',
    status: 'PUBLISHED',
    assignedAt: '2026-10-29T06:58:00.000Z',
    historicalNote: 'STEP RSS-NORTH-2: 중랑구 탄성코트 정보성 가이드 1호 정식 발행 (2026-10-29 15:58:00 KST)',
  },
];

/**
 * 특정 keywordId로 동적키워드 메타데이터 조회
 */
export function getKeywordById(
  keywordId: string,
  allKeywords: DynamicKeyword[] = getAllDynamicKeywords()
): DynamicKeyword | undefined {
  return allKeywords.find((k) => k.id === keywordId);
}

/**
 * 특정 키워드의 현재 상태 조회
 * 1. 활성 게시글 중 승인+공개된 글에 배정되었거나 원장에 PUBLISHED로 기록된 경우 -> 'PUBLISHED'
 * 2. 활성 게시글 중 초안/검토 중인 글에 배정되었거나 원장에 RESERVED로 기록된 경우 -> 'RESERVED'
 * 3. 어디에도 배정되지 않은 경우 -> 'AVAILABLE'
 */
export function getKeywordStatus(
  keywordId: string,
  activeGuides: GuidePost[],
  ledger: KeywordLedgerEntry[] = KEYWORD_LEDGER
): KeywordStatus {
  // 1. 활성 게시글 배열 확인
  const activePost = activeGuides.find((g) => g.keywordId === keywordId);
  if (activePost) {
    if (activePost.isPublished && activePost.contentStatus === 'approved') {
      return 'PUBLISHED';
    }
    return 'RESERVED';
  }

  // 2. 이력 원장(Ledger) 확인 (게시글이 삭제/비활성화되었더라도 이력 보존)
  const ledgerEntry = ledger.find((l) => l.keywordId === keywordId);
  if (ledgerEntry) {
    return ledgerEntry.status;
  }

  return 'AVAILABLE';
}

/**
 * 키워드 배정 검증 결과 인터페이스
 */
export interface KeywordAllocationValidationResult {
  valid: boolean;
  errors: string[];
  stats: {
    totalKeywords: number;
    availableCount: number;
    reservedCount: number;
    publishedCount: number;
  };
}

/**
 * 키워드 배정 무결성 및 중복 차단 종합 검증 함수
 */
export function validateAllKeywordAllocations(
  guides: GuidePost[],
  ledger: KeywordLedgerEntry[] = KEYWORD_LEDGER,
  dynamicKeywords: DynamicKeyword[] = getAllDynamicKeywords(),
  throwOnError: boolean = false
): KeywordAllocationValidationResult {
  const errors: string[] = [];
  const validKeywordIds = new Set(dynamicKeywords.map((k) => k.id));

  // 1. 원장(LEDGER) 내 keywordId 무결성 검사
  const seenLedgerKeywords = new Map<string, string>(); // keywordId -> postId
  for (const entry of ledger) {
    // RSS 구 단위 정책 검증 (동 단위 키워드 배정 금지)
    if (isDongKeyword(entry.keywordId)) {
      errors.push(`[RSS POLICY VIOLATION] 동 단위 키워드("${entry.keywordId}")는 RSS 발행 원장에 등록할 수 없습니다. RSS 발행은 구 단위 키워드만 허용됩니다.`);
    } else if (!validKeywordIds.has(entry.keywordId)) {
      errors.push(`[원장 무결성 오류] 등록되지 않은 유효하지 않은 keywordId("${entry.keywordId}")가 원장에 존재합니다.`);
    }
    if (seenLedgerKeywords.has(entry.keywordId)) {
      errors.push(`[원장 중복 오류] keywordId("${entry.keywordId}")가 원장 내에 중복 등록되어 있습니다.`);
    } else {
      seenLedgerKeywords.set(entry.keywordId, entry.postId);
    }
  }

  // 2. 활성 게시글(guides) 배정 검사
  const seenGuideKeywords = new Map<string, string>(); // keywordId -> postId
  for (const post of guides) {
    // 2-0. RSS 구 단위 전용 정책 검증 (동 단위 키워드 배정 원천 차단)
    if (isDongKeyword(post.keywordId)) {
      errors.push(`[RSS POLICY VIOLATION] 동 단위 키워드("${post.keywordId}")는 RSS 가이드 포스트에 배정할 수 없습니다. RSS 발행은 구 단위 키워드만 허용됩니다.`);
      continue;
    }

    // 2-1. 키워드 존재 여부
    if (!validKeywordIds.has(post.keywordId)) {
      errors.push(`[게시글 무결성 오류] 게시글 "${post.postId}"에 등록되지 않은 keywordId("${post.keywordId}")가 지정되었습니다.`);
      continue;
    }

    // 2-2. 활성 게시글 간 동일 keywordId 배정 차단
    if (seenGuideKeywords.has(post.keywordId)) {
      const prevPostId = seenGuideKeywords.get(post.keywordId);
      errors.push(`[키워드 중복 배정 차단] keywordId("${post.keywordId}")가 "${prevPostId}"와 "${post.postId}"에 중복 배정되었습니다.`);
    } else {
      seenGuideKeywords.set(post.keywordId, post.postId);
    }

    // 2-3. 원장(Ledger)과의 일치성 검사
    const ledgerEntry = ledger.find((e) => e.keywordId === post.keywordId);
    if (ledgerEntry && ledgerEntry.postId !== post.postId) {
      errors.push(`[원장 충돌] keywordId("${post.keywordId}")는 이미 원장에 게시글 "${ledgerEntry.postId}"(${ledgerEntry.status})로 귀속되어 있어 게시글 "${post.postId}"에 배정할 수 없습니다.`);
    }

    // 2-4. 지역/서비스 속성 일치 여부 검사
    const kw = getKeywordById(post.keywordId, dynamicKeywords);
    if (kw) {
      if (post.relatedRegionId !== kw.regionId || post.relatedServiceId !== kw.serviceId) {
        errors.push(`[키워드 불일치 오류] 게시글 "${post.postId}"의 관련 지역/서비스(${post.relatedRegionId}/${post.relatedServiceId})가 배정된 키워드 정보(${kw.regionId}/${kw.serviceId})와 불일치합니다.`);
      }
    }
  }

  // 3. 통계 계산
  let availableCount = 0;
  let reservedCount = 0;
  let publishedCount = 0;

  for (const kw of dynamicKeywords) {
    const status = getKeywordStatus(kw.id, guides, ledger);
    if (status === 'AVAILABLE') availableCount++;
    else if (status === 'RESERVED') reservedCount++;
    else if (status === 'PUBLISHED') publishedCount++;
  }

  if (throwOnError && errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      totalKeywords: dynamicKeywords.length,
      availableCount,
      reservedCount,
      publishedCount,
    },
  };
}
