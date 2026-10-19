/**
 * SEO 유틸리티 모듈 - 올케어탄성
 * 
 * 확정 운영 원칙 준수:
 * - 신규 독립 도메인 환경변수(SITE_URL 또는 Astro.site) 단일 소스 참조
 * - 기존 사이트(allcaretan.co.kr) 또는 가짜 도메인(example.com) 하드코딩 금지
 * - 도메인 미설정 시 가짜 URL / canonical / JSON-LD 생성 금지 (null 반환)
 * - query string 및 hash fragment 배제
 */

/**
 * 정규화된 SITE_URL 조회
 * - 우선순위: 1) Astro.site 2) process.env.SITE_URL 3) import.meta.env.SITE_URL
 * - 후행 슬래시(/) 제거
 */
export function getSiteUrl(astroSite?: URL): string {
  if (astroSite && astroSite.origin && astroSite.origin !== 'null') {
    return astroSite.origin.replace(/\/$/, '');
  }
  const envUrl = process.env.SITE_URL || import.meta.env.SITE_URL || '';
  return envUrl ? envUrl.trim().replace(/\/$/, '') : '';
}

/**
 * 정규 Canonical URL 생성
 * - 도메인이 설정되지 않은 경우 null 반환 (가짜 URL 생성 방지)
 * - query string, hash fragment 제거
 * - 루트 경로는 항상 후행 슬래시 유지 (https://domain/)
 * - 파일 경로는 .html 유지 (https://domain/seo/.../....html)
 */
export function getCanonicalUrl(path: string, siteUrl: string): string | null {
  if (!siteUrl) return null;
  
  // query string 및 fragment 제거
  const cleanPath = path ? path.split('?')[0].split('#')[0] : '';
  
  if (!cleanPath || cleanPath === '/') {
    return `${siteUrl}/`;
  }
  
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${siteUrl}${normalizedPath}`;
}

/**
 * WebSite 구조화 데이터 (메인페이지 전용)
 * - 도메인 설정 시에만 유효한 절대 URL로 생성
 */
export function buildWebSiteJsonLd(siteUrl: string) {
  if (!siteUrl) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '올케어탄성',
    alternateName: 'ALLCARE',
    url: `${siteUrl}/`,
  };
}

/**
 * WebPage 구조화 데이터
 * - 확인되지 않은 가상 주소, 리뷰, 영업시간 절대 삽입 금지
 */
export function buildWebPageJsonLd(title: string, description: string, url: string | null) {
  if (!url) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url,
  };
}

/**
 * BreadcrumbList 구조화 데이터 (지역 상세페이지 전용)
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
