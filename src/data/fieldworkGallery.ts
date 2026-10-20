/**
 * 시공 전·후 현장사진 갤러리 데이터 중앙 관리 모듈
 * 
 * - 향후 신규 시공 사진 그룹(07, 08 등) 추가 시 본 배열에 객체를 추가하면
 *   컴포넌트 및 페이지 마크업 수정 없이 갤러리에 자동 반영됩니다.
 * - 허위 후기, 미확인 자치구명, 가상 아파트명은 일절 기재하지 않으며
 *   실제 사진에 나타난 부위와 현장 상태를 정확히 반영합니다.
 */

export interface FieldworkGroup {
  groupId: string;
  beforeImage: string;
  afterImage: string;
  beforeImageWebp?: string;
  afterImageWebp?: string;
  beforeAlt: string;
  afterAlt: string;
  beforeObjectPosition?: string;
  afterObjectPosition?: string;
}

export const FIELDWORK_GALLERY_GROUPS: FieldworkGroup[] = [
  {
    groupId: '01',
    beforeImage: '/images/fieldwork/01.jpg',
    afterImage: '/images/fieldwork/01-2.jpg',
    beforeImageWebp: '/images/fieldwork/01.webp',
    afterImageWebp: '/images/fieldwork/01-2.webp',
    beforeAlt: '베란다 창가 하단 벽면의 곰팡이 및 도막 들뜸 상태',
    afterAlt: '베란다 창가 벽면 탄성코트 시공 완료 상태',
  },
  {
    groupId: '02',
    beforeImage: '/images/fieldwork/02.jpg',
    afterImage: '/images/fieldwork/02-2.jpg',
    beforeImageWebp: '/images/fieldwork/02.webp',
    afterImageWebp: '/images/fieldwork/02-2.webp',
    beforeAlt: '보일러실 배관 주변 및 벽면의 심한 곰팡이 오염 상태',
    afterAlt: '보일러실 벽면 및 배관 주변 탄성코트 시공 완료 상태',
  },
  {
    groupId: '03',
    beforeImage: '/images/fieldwork/03.jpg',
    afterImage: '/images/fieldwork/03-2.jpg',
    beforeImageWebp: '/images/fieldwork/03.webp',
    afterImageWebp: '/images/fieldwork/03-2.webp',
    beforeAlt: '천장 배관 및 연통 주변의 습기 얼룩과 곰팡이 흔적',
    afterAlt: '천장 배관 및 연통 주변 탄성코트 시공 마감 상태',
  },
  {
    groupId: '04',
    beforeImage: '/images/fieldwork/04.jpg',
    afterImage: '/images/fieldwork/04-2.jpg',
    beforeImageWebp: '/images/fieldwork/04.webp',
    afterImageWebp: '/images/fieldwork/04-2.webp',
    beforeAlt: '베란다 창호 하단 벽면의 도막 들뜸 및 박리 현상',
    afterAlt: '베란다 벽면 균일한 탄성코트 도막 마감 상태',
  },
  {
    groupId: '05',
    beforeImage: '/images/fieldwork/05.jpg',
    afterImage: '/images/fieldwork/05-2.jpg',
    beforeImageWebp: '/images/fieldwork/05.webp',
    afterImageWebp: '/images/fieldwork/05-2.webp',
    beforeAlt: '세탁실 세탁기 배면 벽체의 흑색 곰팡이 번식 상태',
    afterAlt: '세탁실 배면 벽체 탄성코트 시공 완료 상태',
  },
  {
    groupId: '06',
    beforeImage: '/images/fieldwork/06.jpg',
    afterImage: '/images/fieldwork/06-2.jpg',
    beforeImageWebp: '/images/fieldwork/06.webp',
    afterImageWebp: '/images/fieldwork/06-2.webp',
    beforeAlt: '세탁실 좁은 코너 벽면의 곰팡이 및 변색 상태',
    afterAlt: '세탁실 코너 벽면 탄성코트 시공 완료 상태',
    beforeObjectPosition: 'center',
    afterObjectPosition: 'center',
  },
];
