/**
 * 사이트 공통 운영 정보 및 연락처 설정
 */
export const SITE_CONTACT = {
  brandName: '올케어탄성',
  brandEn: 'ALLCARE',
  phone: '010-8492-6900',
  telHref: 'tel:01084926900',
  serviceScope: '서울특별시 전역 (서울권)',
} as const;

/**
 * 사이트 공통 이미지 및 Hero 배경 설정
 * 운영자가 향후 Hero 배경 이미지를 교체할 때 이 곳의 경로만 수정하면 전체 사이트에 자동 반영됩니다.
 */
export const SITE_IMAGES = {
  defaultHeroBg: '/images/hero/hero-bg-default.jpg',
  defaultHeroAlt: '올케어탄성 실제 시공 현장 베란다 벽면 및 천장 마감',
  officialLogo: '/images/allcare/official-allcare-logo.png',
  signatureLogo: '/images/allcare/allcare-signature.png',
} as const;
