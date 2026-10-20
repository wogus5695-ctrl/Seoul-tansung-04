/**
 * SEO 유틸리티 모듈 - 올케어탄성
 * 
 * 확정 운영 원칙 준수:
 * - 신규 독립 도메인 환경변수(SITE_URL 또는 Astro.site) 단일 소스 참조
 * - 기존 사이트(allcaretan.co.kr) 또는 가짜 도메인(example.com) 하드코딩 금지
 * - 도메인 미설정 시 가짜 URL / canonical / JSON-LD 생성 금지 (null 반환)
 * - query string 및 hash fragment 배제
 * - Production 배포 게이트: 운영 도메인 엄격 유효성 검증
 * - Preview 격리: 프리뷰 환경에서 Production 신호 차단
 */

/**
 * 미리보기(Preview) 환경 여부 판정
 */
export function isPreviewEnvironment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV || import.meta.env.VERCEL_ENV;
  const env = process.env.ENVIRONMENT || import.meta.env.ENVIRONMENT;
  return vercelEnv === 'preview' || env === 'preview';
}

/**
 * 정식 운영(Production) 배포 모드 여부 판정
 */
export function isProductionDeployment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV || import.meta.env.VERCEL_ENV;
  const target = process.env.DEPLOY_TARGET || import.meta.env.DEPLOY_TARGET;
  const prodBuild = process.env.PRODUCTION_BUILD || import.meta.env.PRODUCTION_BUILD;
  return vercelEnv === 'production' || target === 'production' || prodBuild === 'true';
}

/**
 * 운영 배포(Production)용 SITE_URL 유효성 검증 게이트
 * 
 * 요구조건:
 * - https:// 프로토콜 필수
 * - 유효한 hostname 존재 (도메인 형식)
 * - localhost 및 루프백 IP 불가
 * - 기존 사이트 allcaretan.co.kr 불가
 * - 테스트/더미 도메인 (example.com, test 등) 불가
 * - 서브디렉토리 경로, 쿼리 스트링, 해시 프래그먼트 불가
 */
export function validateProductionSiteUrl(siteUrl: string | undefined): { valid: boolean; error?: string } {
  if (!siteUrl || !siteUrl.trim()) {
    return { valid: false, error: 'SITE_URL 환경변수가 누락되었습니다. 정식 운영 배포 시 필수 입력 항목입니다.' };
  }

  const trimmed = siteUrl.trim();
  if (!trimmed.startsWith('https://')) {
    return { valid: false, error: 'SITE_URL은 반드시 보안 프로토콜 https:// 로 시작해야 합니다.' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'SITE_URL의 프로토콜은 https: 이어야 합니다.' };
    }

    const host = parsed.hostname.toLowerCase();
    if (!host || host === 'localhost' || host === '127.0.0.1') {
      return { valid: false, error: 'SITE_URL에 localhost 또는 로컬 IP를 사용할 수 없습니다.' };
    }

    if (host.includes('allcaretan.co.kr')) {
      return { valid: false, error: '기존 운영 사이트(allcaretan.co.kr)는 신규 독립 사이트의 SITE_URL로 사용할 수 없습니다.' };
    }

    if (
      host === 'example.com' ||
      host === 'example.org' ||
      host.endsWith('.test') ||
      host.endsWith('.example') ||
      host === 'test.com'
    ) {
      return { valid: false, error: '테스트용 더미 도메인(example.com 등)은 운영 배포에 사용할 수 없습니다.' };
    }

    if (!host.includes('.')) {
      return { valid: false, error: '유효한 최상위 도메인(TLD)을 포함한 도메인명이어야 합니다.' };
    }

    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      return { valid: false, error: 'SITE_URL에는 서브 경로를 포함할 수 없습니다 (예: https://domain.com/path 금지).' };
    }

    if (parsed.search || parsed.hash) {
      return { valid: false, error: 'SITE_URL에는 쿼리 파라미터나 해시(#)를 포함할 수 없습니다.' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: `유효하지 않은 URL 형식입니다: ${err instanceof Error ? err.message : String(err)}` };
  }
}

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
export function buildWebSiteJsonLd(siteUrl: string, imageUrl?: string) {
  if (!siteUrl) return null;
  const image = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`) : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '올케어탄성',
    alternateName: 'ALLCARE',
    url: `${siteUrl}/`,
    ...(image ? { image } : {}),
  };
}

/**
 * WebPage 구조화 데이터
 * - 확인되지 않은 가상 주소, 리뷰, 영업시간 절대 삽입 금지
 */
export function buildWebPageJsonLd(title: string, description: string, url: string | null, imageUrl?: string) {
  if (!url) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url,
    ...(imageUrl ? {
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: imageUrl,
      },
      image: imageUrl,
    } : {}),
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
