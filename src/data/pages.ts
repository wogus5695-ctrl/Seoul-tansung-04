import { REGIONS, type Region } from './regions';
import { SERVICES, type Service } from './services';

export type ContentStatus = 'draft' | 'ready' | 'published';

export interface SeoPageConfig {
  id: string;
  regionId: string;
  serviceId: string;
  serviceSlug: string;
  districtSlug: string;
  urlPath: string;
  isPublished: boolean;
  contentStatus: ContentStatus;
  metaTitle: string;
  metaDescription: string;
}

// 12개 자치구 x 2개 작업명 = 총 24개 조합 등록
// 초기 isPublished 기본값은 모두 false로 설정
export const SEO_PAGES: SeoPageConfig[] = [];

for (const service of SERVICES) {
  for (const region of REGIONS) {
    const isPublished = false;
    SEO_PAGES.push({
      id: `${service.id}_${region.id}`,
      regionId: region.id,
      serviceId: service.id,
      serviceSlug: service.slug,
      districtSlug: region.slug,
      urlPath: `/seo/${service.slug}/${region.slug}.html`,
      isPublished,
      contentStatus: 'draft',
      metaTitle: `${region.name} ${service.name} | 서울 대표 전문업체`,
      metaDescription: `서울 ${region.name} ${service.name} 시공 안내. 베란다 및 세탁실 벽면 상태를 먼저 확인하고 작업 범위를 안내합니다.`,
    });
  }
}

export function getPublishedSeoPages(): SeoPageConfig[] {
  return SEO_PAGES.filter((page) => page.isPublished);
}

export function getSeoPage(serviceSlug: string, districtSlug: string): SeoPageConfig | undefined {
  return SEO_PAGES.find(
    (page) => page.serviceSlug === serviceSlug && page.districtSlug === districtSlug
  );
}

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
