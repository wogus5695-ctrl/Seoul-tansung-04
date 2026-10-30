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
 * 2026년 기준 서울 북부권 법정동 38개 데이터
 * - 노원구 5개, 중랑구 6개, 성북구 9개, 동대문구 10개, 강북구 4개, 도봉구 4개
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

  // --- 3. 성북구 (9개 법정동) ---
  {
    id: 'gireum',
    name: '길음동',
    slug: 'seoul-gireum-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 길음동',
    order: 12,
  },
  {
    id: 'jeongneung',
    name: '정릉동',
    slug: 'seoul-jeongneung-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 정릉동',
    order: 13,
  },
  {
    id: 'donam',
    name: '돈암동',
    slug: 'seoul-donam-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 돈암동',
    order: 14,
  },
  {
    id: 'jangwi',
    name: '장위동',
    slug: 'seoul-jangwi-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 장위동',
    order: 15,
  },
  {
    id: 'jongam',
    name: '종암동',
    slug: 'seoul-jongam-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 종암동',
    order: 16,
  },
  {
    id: 'hawolgok',
    name: '하월곡동',
    slug: 'seoul-hawolgok-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 하월곡동',
    order: 17,
  },
  {
    id: 'seokgwan',
    name: '석관동',
    slug: 'seoul-seokgwan-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 석관동',
    order: 18,
  },
  {
    id: 'sangwolgok',
    name: '상월곡동',
    slug: 'seoul-sangwolgok-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 상월곡동',
    order: 19,
  },
  {
    id: 'seongbuk',
    name: '성북동',
    slug: 'seoul-seongbuk-dong',
    parentRegionId: 'seongbuk',
    regionLevel: 'dong',
    displayName: '서울 성북구 성북동',
    order: 20,
  },

  // --- 4. 동대문구 (10개 법정동) ---
  {
    id: 'dapsimni',
    name: '답십리동',
    slug: 'seoul-dapsimni-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 답십리동',
    order: 21,
  },
  {
    id: 'jangan',
    name: '장안동',
    slug: 'seoul-jangan-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 장안동',
    order: 22,
  },
  {
    id: 'jeonnong',
    name: '전농동',
    slug: 'seoul-jeonnong-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 전농동',
    order: 23,
  },
  {
    id: 'hwigyeong',
    name: '휘경동',
    slug: 'seoul-hwigyeong-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 휘경동',
    order: 24,
  },
  {
    id: 'imun',
    name: '이문동',
    slug: 'seoul-imun-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 이문동',
    order: 25,
  },
  {
    id: 'cheongnyangni',
    name: '청량리동',
    slug: 'seoul-cheongnyangni-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 청량리동',
    order: 26,
  },
  {
    id: 'yongdu',
    name: '용두동',
    slug: 'seoul-yongdu-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 용두동',
    order: 27,
  },
  {
    id: 'jegi',
    name: '제기동',
    slug: 'seoul-jegi-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 제기동',
    order: 28,
  },
  {
    id: 'hoegi',
    name: '회기동',
    slug: 'seoul-hoegi-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 회기동',
    order: 29,
  },
  {
    id: 'sinseol',
    name: '신설동',
    slug: 'seoul-sinseol-dong',
    parentRegionId: 'dongdaemun',
    regionLevel: 'dong',
    displayName: '서울 동대문구 신설동',
    order: 30,
  },

  // --- 5. 강북구 (4개 법정동) ---
  {
    id: 'mia',
    name: '미아동',
    slug: 'seoul-mia-dong',
    parentRegionId: 'gangbuk',
    regionLevel: 'dong',
    displayName: '서울 강북구 미아동',
    order: 31,
  },
  {
    id: 'suyu',
    name: '수유동',
    slug: 'seoul-suyu-dong',
    parentRegionId: 'gangbuk',
    regionLevel: 'dong',
    displayName: '서울 강북구 수유동',
    order: 32,
  },
  {
    id: 'beon',
    name: '번동',
    slug: 'seoul-beon-dong',
    parentRegionId: 'gangbuk',
    regionLevel: 'dong',
    displayName: '서울 강북구 번동',
    order: 33,
  },
  {
    id: 'ui',
    name: '우이동',
    slug: 'seoul-ui-dong',
    parentRegionId: 'gangbuk',
    regionLevel: 'dong',
    displayName: '서울 강북구 우이동',
    order: 34,
  },

  // --- 6. 도봉구 (4개 법정동) ---
  {
    id: 'ssangmun',
    name: '쌍문동',
    slug: 'seoul-ssangmun-dong',
    parentRegionId: 'dobong',
    regionLevel: 'dong',
    displayName: '서울 도봉구 쌍문동',
    order: 35,
  },
  {
    id: 'banghak',
    name: '방학동',
    slug: 'seoul-banghak-dong',
    parentRegionId: 'dobong',
    regionLevel: 'dong',
    displayName: '서울 도봉구 방학동',
    order: 36,
  },
  {
    id: 'chang',
    name: '창동',
    slug: 'seoul-chang-dong',
    parentRegionId: 'dobong',
    regionLevel: 'dong',
    displayName: '서울 도봉구 창동',
    order: 37,
  },
  {
    id: 'dobong',
    name: '도봉동',
    slug: 'seoul-dobong-dong',
    parentRegionId: 'dobong',
    regionLevel: 'dong',
    displayName: '서울 도봉구 도봉동',
    order: 38,
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
