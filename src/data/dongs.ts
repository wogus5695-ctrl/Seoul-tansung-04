import { REGIONS, type Region } from './regions.ts';

export interface Dong {
  id: string; // e.g. 'sanggye', 'myeonmok'
  name: string; // e.g. '상계동', '면목동'
  slug: string; // e.g. 'seoul-sanggye-dong', 'seoul-myeonmok-dong'
  parentRegionId: string; // e.g. 'nowon', 'jungnang'
  regionLevel: 'dong';
  displayName: string; // e.g. '서울 노원구 상계동', '서울 중랑구 면목동'
  order: number;
}

/**
 * 2026년 기준 서울 북부권 1차 확장 법정동 11개 데이터
 * 
 * [원칙]
 * 1. 행정동(상계1~10동 등)이 아닌 대표 법정동 기준으로 통합하여 도어웨이 페이지 방지
 * 2. parentRegionId는 REGIONS에 존재하는 자치구 ID를 반드시 참조해야 함
 */
export const DONGS: Dong[] = [
  // --- 1. 노원구 (5개 법정동) ---
  {
    id: 'sanggye',
    name: '상계동',
    slug: 'seoul-sanggye-dong',
    parentRegionId: 'nowon',
    regionLevel: 'dong',
    displayName: '서울 노원구 상계동',
    order: 1,
  },
  {
    id: 'junggye',
    name: '중계동',
    slug: 'seoul-junggye-dong',
    parentRegionId: 'nowon',
    regionLevel: 'dong',
    displayName: '서울 노원구 중계동',
    order: 2,
  },
  {
    id: 'hagye',
    name: '하계동',
    slug: 'seoul-hagye-dong',
    parentRegionId: 'nowon',
    regionLevel: 'dong',
    displayName: '서울 노원구 하계동',
    order: 3,
  },
  {
    id: 'gongneung',
    name: '공릉동',
    slug: 'seoul-gongneung-dong',
    parentRegionId: 'nowon',
    regionLevel: 'dong',
    displayName: '서울 노원구 공릉동',
    order: 4,
  },
  {
    id: 'wolgye',
    name: '월계동',
    slug: 'seoul-wolgye-dong',
    parentRegionId: 'nowon',
    regionLevel: 'dong',
    displayName: '서울 노원구 월계동',
    order: 5,
  },

  // --- 2. 중랑구 (6개 법정동) ---
  {
    id: 'myeonmok',
    name: '면목동',
    slug: 'seoul-myeonmok-dong',
    parentRegionId: 'jungnang',
    regionLevel: 'dong',
    displayName: '서울 중랑구 면목동',
    order: 6,
  },
  {
    id: 'sangbong',
    name: '상봉동',
    slug: 'seoul-sangbong-dong',
    parentRegionId: 'jungnang',
    regionLevel: 'dong',
    displayName: '서울 중랑구 상봉동',
    order: 7,
  },
  {
    id: 'junghwa',
    name: '중화동',
    slug: 'seoul-junghwa-dong',
    parentRegionId: 'jungnang',
    regionLevel: 'dong',
    displayName: '서울 중랑구 중화동',
    order: 8,
  },
  {
    id: 'muk',
    name: '묵동',
    slug: 'seoul-muk-dong',
    parentRegionId: 'jungnang',
    regionLevel: 'dong',
    displayName: '서울 중랑구 묵동',
    order: 9,
  },
  {
    id: 'mangu',
    name: '망우동',
    slug: 'seoul-mangu-dong',
    parentRegionId: 'jungnang',
    regionLevel: 'dong',
    displayName: '서울 중랑구 망우동',
    order: 10,
  },
  {
    id: 'sinnae',
    name: '신내동',
    slug: 'seoul-sinnae-dong',
    parentRegionId: 'jungnang',
    regionLevel: 'dong',
    displayName: '서울 중랑구 신내동',
    order: 11,
  },
];

/**
 * 법정동 데이터 무결성 검증 함수
 */
export function validateDongsIntegrity(dongs: Dong[] = DONGS, regions: Region[] = REGIONS): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validParentIds = new Set(regions.map((r) => r.id));
  const seenDongIds = new Set<string>();
  const seenDongSlugs = new Set<string>();

  for (const dong of dongs) {
    if (!validParentIds.has(dong.parentRegionId)) {
      errors.push(`[부모 지역 참조 오류] 법정동 "${dong.name}(${dong.id})"의 부모 자치구 ID("${dong.parentRegionId}")가 REGIONS에 존재하지 않습니다.`);
    }
    if (seenDongIds.has(dong.id)) {
      errors.push(`[동 ID 중복 오류] 동 ID "${dong.id}"가 중복 등록되었습니다.`);
    } else {
      seenDongIds.add(dong.id);
    }
    if (seenDongSlugs.has(dong.slug)) {
      errors.push(`[동 Slug 중복 오류] 동 Slug "${dong.slug}"가 중복 등록되었습니다.`);
    } else {
      seenDongSlugs.add(dong.slug);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 초기 로드 시 자체 무결성 검증
const initialValidation = validateDongsIntegrity(DONGS, REGIONS);
if (!initialValidation.valid) {
  throw new Error(`[DONGS REGISTRY ERROR] ${initialValidation.errors.join('; ')}`);
}

export function getDongById(id: string): Dong | undefined {
  return DONGS.find((d) => d.id === id);
}

export function getDongsByParentRegion(parentRegionId: string): Dong[] {
  return DONGS.filter((d) => d.parentRegionId === parentRegionId);
}
