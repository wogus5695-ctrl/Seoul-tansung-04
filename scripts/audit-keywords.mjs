import fs from 'node:fs';
import path from 'node:path';
import { REGIONS } from '../src/data/regions.ts';
import { DONGS } from '../src/data/dongs.ts';
import { SERVICES } from '../src/data/services.ts';
import { SEO_PAGES, isPagePublished } from '../src/data/pages.ts';
import {
  getAllDynamicKeywords,
  getAllDongDynamicKeywords,
  getAllCombinedDynamicKeywords,
  isDistrictKeyword,
  KEYWORD_LEDGER,
  getKeywordStatus,
} from '../src/data/keywordRegistry.ts';
import { GUIDES } from '../src/data/guides.ts';

/**
 * 동적키워드 레지스트리 무결성 및 확장 정합성 검증 함수
 * 
 * [확장성 원칙]
 * - 고정된 숫자(12구, 11동, 2서비스)에 의존하지 않고
 * - 임의의 N개 자치구, K개 법정동, M개 서비스 등록 시에도 (N + K) × M 조합의 완전성을 동적으로 검증합니다.
 */
export function validateKeywordRegistryIntegrity(
  arg1 = REGIONS,
  arg2 = DONGS,
  arg3 = undefined,
  arg4 = undefined
) {
  let regions = arg1 || REGIONS;
  let dongs = null;
  let services = null;
  let combinedKeywords = null;

  // Distinguish between (regions, services, keywords) vs (regions, dongs, services, combinedKeywords)
  if (Array.isArray(arg2) && arg2.length > 0 && !('parentRegionId' in arg2[0])) {
    // Legacy Gu-only signature: validateKeywordRegistryIntegrity(regions, services, keywords)
    services = arg2;
    combinedKeywords = arg3 || null;
    dongs = null;
  } else {
    // Unified Gu + Dong signature: validateKeywordRegistryIntegrity(regions, dongs, services, combinedKeywords)
    dongs = arg2 || DONGS;
    services = arg3 || SERVICES;
    combinedKeywords = arg4 || null;
  }

  if (!regions || regions.length === 0) {
    throw new Error('[AUDIT ERROR] 최소 1개 이상의 자치구가 등록되어 있어야 합니다.');
  }
  if (!services || services.length === 0) {
    throw new Error('[AUDIT ERROR] 최소 1개 이상의 서비스가 등록되어 있어야 합니다.');
  }

  // 1. Region ID 및 Slug 중복 검사 (0건 보장)
  const regionIds = new Set();
  const regionSlugs = new Set();
  for (const r of regions) {
    if (regionIds.has(r.id)) throw new Error(`[AUDIT ERROR] Region ID 중복 발견: ${r.id}`);
    if (regionSlugs.has(r.slug)) throw new Error(`[AUDIT ERROR] Region Slug 중복 발견: ${r.slug}`);
    regionIds.add(r.id);
    regionSlugs.add(r.slug);
  }

  // 2. Service ID 및 Slug 중복 검사 (0건 보장)
  const serviceIds = new Set();
  const serviceSlugs = new Set();
  for (const s of services) {
    if (serviceIds.has(s.id)) throw new Error(`[AUDIT ERROR] Service ID 중복 발견: ${s.id}`);
    if (serviceSlugs.has(s.slug)) throw new Error(`[AUDIT ERROR] Service Slug 중복 발견: ${s.slug}`);
    serviceIds.add(s.id);
    serviceSlugs.add(s.slug);
  }

  // --- 분기 A: 레거시 구 단위 전용 검증 (dongs === null) ---
  if (!dongs) {
    const allKws = combinedKeywords || getAllDynamicKeywords(regions, services);
    const expectedCount = regions.length * services.length;
    if (allKws.length !== expectedCount) {
      throw new Error(
        `[AUDIT ERROR] 지역(${regions.length}) × 서비스(${services.length}) 조합 수 불일치: 기대 ${expectedCount}개, 실제 ${allKws.length}개`
      );
    }

    const keywordIds = new Set();
    const urlPaths = new Set();
    for (const kw of allKws) {
      if (keywordIds.has(kw.id)) throw new Error(`[AUDIT ERROR] keywordId 중복 발견: ${kw.id}`);
      keywordIds.add(kw.id);

      if (urlPaths.has(kw.targetUrlPath)) throw new Error(`[AUDIT ERROR] URL 충돌 발견: ${kw.targetUrlPath}`);
      urlPaths.add(kw.targetUrlPath);

      const targetService = services.find((s) => s.id === kw.serviceId);
      const targetRegion = regions.find((r) => r.id === kw.regionId);
      if (!targetService || !targetRegion) {
        throw new Error(`[AUDIT ERROR] 키워드 ${kw.id}에 매핑된 지역 또는 서비스 데이터가 누락되었습니다.`);
      }

      const expectedUrl = `/seo/${targetService.slug}/${targetRegion.slug}.html`;
      if (kw.targetUrlPath !== expectedUrl) {
        throw new Error(`[AUDIT ERROR] URL 매핑 오류: ${kw.id} -> 실제 ${kw.targetUrlPath}, 기대 ${expectedUrl}`);
      }
    }

    return {
      regionsCount: regions.length,
      servicesCount: services.length,
      totalCombinations: allKws.length,
      valid: true,
    };
  }

  // --- 분기 B: 구 + 동 통합 검증 (dongs !== null) ---
  if (dongs.length === 0) {
    throw new Error('[AUDIT ERROR] 최소 1개 이상의 법정동이 등록되어 있어야 합니다.');
  }

  const dongIds = new Set();
  const dongSlugs = new Set();
  for (const d of dongs) {
    if (dongIds.has(d.id)) throw new Error(`[AUDIT ERROR] Dong ID 중복 발견: ${d.id}`);
    if (dongSlugs.has(d.slug)) throw new Error(`[AUDIT ERROR] Dong Slug 중복 발견: ${d.slug}`);
    if (!regionIds.has(d.parentRegionId)) {
      throw new Error(`[AUDIT ERROR] 법정동(${d.name})의 부모 자치구 ID(${d.parentRegionId})가 REGIONS에 존재하지 않습니다.`);
    }
    dongIds.add(d.id);
    dongSlugs.add(d.slug);
  }

  const guKws = getAllDynamicKeywords(regions, services);
  const expectedGuCount = regions.length * services.length;
  if (guKws.length !== expectedGuCount) {
    throw new Error(
      `[AUDIT ERROR] 구 단위 조합 수 불일치: 기대 ${expectedGuCount}개, 실제 ${guKws.length}개`
    );
  }

  const dongKws = getAllDongDynamicKeywords(dongs, services);
  const expectedDongCount = dongs.length * services.length;
  if (dongKws.length !== expectedDongCount) {
    throw new Error(
      `[AUDIT ERROR] 동 단위 조합 수 불일치: 기대 ${expectedDongCount}개, 실제 ${dongKws.length}개`
    );
  }

  const allKws = combinedKeywords || getAllCombinedDynamicKeywords(regions, dongs, services);
  const expectedTotalCount = expectedGuCount + expectedDongCount;
  if (allKws.length !== expectedTotalCount) {
    throw new Error(
      `[AUDIT ERROR] 전체 조합 수 불일치: 기대 ${expectedTotalCount}개, 실제 ${allKws.length}개`
    );
  }

  const keywordIds = new Set();
  const urlPaths = new Set();
  for (const kw of allKws) {
    if (keywordIds.has(kw.id)) throw new Error(`[AUDIT ERROR] keywordId 중복 발견: ${kw.id}`);
    keywordIds.add(kw.id);

    if (urlPaths.has(kw.targetUrlPath)) {
      throw new Error(`[AUDIT ERROR] URL 충돌 발견: ${kw.targetUrlPath} (키워드 ID: ${kw.id})`);
    }
    urlPaths.add(kw.targetUrlPath);

    const targetService = services.find((s) => s.id === kw.serviceId);
    if (!targetService) {
      throw new Error(`[AUDIT ERROR] 키워드 ${kw.id}에 매핑된 서비스(${kw.serviceId})가 누락되었습니다.`);
    }

    if (kw.regionLevel === 'dong') {
      const targetDong = dongs.find((d) => d.id === kw.regionId);
      if (!targetDong) {
        throw new Error(`[AUDIT ERROR] 동 단위 키워드 ${kw.id}에 매핑된 동(${kw.regionId})이 누락되었습니다.`);
      }
      const expectedUrl = `/seo/${targetService.slug}/${targetDong.slug}.html`;
      if (kw.targetUrlPath !== expectedUrl) {
        throw new Error(`[AUDIT ERROR] 동 단위 URL 매핑 오류: ${kw.id} -> 실제 ${kw.targetUrlPath}, 기대 ${expectedUrl}`);
      }
    } else {
      const targetRegion = regions.find((r) => r.id === kw.regionId);
      if (!targetRegion) {
        throw new Error(`[AUDIT ERROR] 구 단위 키워드 ${kw.id}에 매핑된 지역(${kw.regionId})이 누락되었습니다.`);
      }
      const expectedUrl = `/seo/${targetService.slug}/${targetRegion.slug}.html`;
      if (kw.targetUrlPath !== expectedUrl) {
        throw new Error(`[AUDIT ERROR] 구 단위 URL 매핑 오류: ${kw.id} -> 실제 ${kw.targetUrlPath}, 기대 ${expectedUrl}`);
      }
    }
  }

  return {
    regionsCount: regions.length,
    dongsCount: dongs.length,
    servicesCount: services.length,
    guCombinations: guKws.length,
    dongCombinations: dongKws.length,
    totalCombinations: allKws.length,
    valid: true,
  };
}

// 1. 동적키워드 전수 46개 데이터 수집 및 동적 무결성 검증
const allKeywords = getAllCombinedDynamicKeywords(REGIONS, DONGS, SERVICES);
validateKeywordRegistryIntegrity(REGIONS, DONGS, SERVICES, allKeywords);

const rows = allKeywords.map((kw, index) => {
  const page = SEO_PAGES.find((p) => p.id === kw.id);
  const isPagePub = page ? isPagePublished(page) : false;
  const guide = GUIDES.find((g) => g.keywordId === kw.id);
  const isDistrict = isDistrictKeyword(kw.id);
  
  // RSS Guide 정책: 구 단위만 가능, 동 단위는 엄격 차단
  const guideEligible = isDistrict ? '가능 (O)' : '불가 (X)';
  const guideStatus = isDistrict
    ? getKeywordStatus(kw.id, GUIDES, KEYWORD_LEDGER)
    : 'BLOCKED_DONG';

  // 상위 자치구 표시: 동 단위는 부모 구 이름, 구 단위는 해당 구 이름
  let parentRegionName = '-';
  if (kw.regionLevel === 'dong' && kw.parentRegionId) {
    const parentRegion = REGIONS.find((r) => r.id === kw.parentRegionId);
    parentRegionName = parentRegion ? parentRegion.name : kw.parentRegionId;
  } else {
    parentRegionName = kw.regionName;
  }

  return {
    no: index + 1,
    keywordId: kw.id,
    regionLevel: kw.regionLevel === 'dong' ? '동' : '구',
    keyword: kw.keyword,
    parentRegion: parentRegionName,
    serviceName: kw.serviceName,
    urlPath: kw.targetUrlPath,
    isPublished: page?.isPublished ?? false,
    contentStatus: page?.contentStatus ?? 'draft',
    htmlGenerated: isPagePub ? '생성 (O)' : '미생성 (X)',
    guideEligible,
    guideAssigned: guide ? `${guide.postId}` : '미배정 (-)',
    guideStatus,
    sitemapIncluded: isPagePub ? '포함 (O)' : '미포함 (X)',
  };
});

// 2. 통계 계산 (동적 산출)
const totalCount = rows.length;
const guCount = rows.filter((r) => r.regionLevel === '구').length;
const dongCount = rows.filter((r) => r.regionLevel === '동').length;
const publishedPagesCount = rows.filter((r) => r.htmlGenerated === '생성 (O)').length;
const unapprovedPagesCount = totalCount - publishedPagesCount;
const publishedGuidesCount = rows.filter((r) => r.guideStatus === 'PUBLISHED').length;
const dongGuideEligibleCount = rows.filter((r) => r.regionLevel === '동' && r.guideEligible === '가능 (O)').length;

// 3. 콘솔 출력
console.log('========================================================================================================');
console.log('               올케어탄성 전체 동적키워드 46개 관리 현황표 (Gu 24 + Dong 22 Local Audit)               ');
console.log('========================================================================================================');
console.table(
  rows.map((r) => ({
    No: r.no,
    'Keyword ID': r.keywordId,
    구분: r.regionLevel,
    동적키워드: r.keyword,
    '상위 자치구': r.parentRegion,
    작업명: r.serviceName,
    'SEO 상태': `${r.isPublished} / ${r.contentStatus}`,
    'HTML 생성': r.htmlGenerated,
    'Guide 가능': r.guideEligible,
    'Guide 배정': r.guideAssigned,
    'Guide 상태': r.guideStatus,
    'Sitemap': r.sitemapIncluded,
  }))
);

console.log('--------------------------------------------------------------------------------------------------------');
console.log(`[요약 통계] 총 키워드: ${totalCount}개 (구: ${guCount}개, 동: ${dongCount}개) | 공개 승인 페이지: ${publishedPagesCount}개 | 비공개 격리: ${unapprovedPagesCount}개`);
console.log(`[RSS 게이트] 정식 가이드 발행: ${publishedGuidesCount}개 | 동 단위 RSS 발행 가능: ${dongGuideEligibleCount}개 (동 단위 완전 차단)`);
console.log('========================================================================================================\n');

// 4. 로컬 전용 보고서 저장 (artifacts/ 폴더는 .gitignore 대상)
const artifactsDir = path.resolve('artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// 4-A. Markdown 현황표 생성
const mdHeader = `# 올케어탄성 동적키워드 46개 관리 현황표 (Gu 24 + Dong 22)

- **검수 일시**: ${new Date().toISOString()}
- **기준 도메인**: https://www.seoulallcaretan.com/
- **총 키워드 수**: ${totalCount}개 (구 단위 ${guCount}개 / 동 단위 ${dongCount}개)
- **공개 승인 페이지**: ${publishedPagesCount}개 (노원 탄성, 노원 베란다, 도봉 탄성)
- **비공개 격리 페이지**: ${unapprovedPagesCount}개 (구 단위 비공개 ${guCount - publishedPagesCount}개 + 동 단위 Draft ${dongCount}개)
- **정보성 가이드 발행**: ${publishedGuidesCount}개
- **동 단위 RSS 가이드 허용 수**: ${dongGuideEligibleCount}개 (동 단위 원천 차단)

| No | Keyword ID | 지역 구분 | 동적키워드 | 상위 자치구 | 작업명 | SEO URL 후보 | isPublished | contentStatus | 실제 HTML 생성 | Guide 발행 가능 | Guide 배정 | Guide 발행 상태 | Sitemap 포함 |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

const mdBody = rows
  .map(
    (r) =>
      `| ${r.no} | \`${r.keywordId}\` | ${r.regionLevel} | **${r.keyword}** | ${r.parentRegion} | ${r.serviceName} | \`${r.urlPath}\` | ${r.isPublished} | ${r.contentStatus} | ${r.htmlGenerated} | ${r.guideEligible} | ${r.guideAssigned} | **${r.guideStatus}** | ${r.sitemapIncluded} |`
  )
  .join('\n');

const mdFooter = `\n\n> **[격리 안전 원칙]**\n> 본 문서는 로컬 관리자용 현황표이며, public/ 및 dist/ 디렉토리에 포함되지 않아 외부로 노출되지 않습니다.\n> 동 단위 키워드 22개는 전원 Draft 상태이며, RSS 가이드 발행이 기술적으로 원천 차단됩니다.\n`;

fs.writeFileSync(path.join(artifactsDir, 'KEYWORD_STATUS.md'), mdHeader + mdBody + mdFooter, 'utf8');
console.log(`[로컬 보고서 생성 완료] -> ${path.join('artifacts', 'KEYWORD_STATUS.md')}`);

// 4-B. CSV 현황표 생성
const csvHeader = 'No,Keyword ID,지역 구분,동적키워드,상위 자치구,작업명,SEO URL 후보,isPublished,contentStatus,실제 HTML 생성 여부,Guide 발행 가능 여부,Guide 배정 여부,Guide 발행 상태,Sitemap 포함 여부\n';
const csvBody = rows
  .map(
    (r) =>
      `${r.no},"${r.keywordId}","${r.regionLevel}","${r.keyword}","${r.parentRegion}","${r.serviceName}","${r.urlPath}",${r.isPublished},${r.contentStatus},"${r.htmlGenerated}","${r.guideEligible}","${r.guideAssigned}","${r.guideStatus}","${r.sitemapIncluded}"`
  )
  .join('\n');

fs.writeFileSync(path.join(artifactsDir, 'KEYWORD_STATUS.csv'), '\uFEFF' + csvHeader + csvBody, 'utf8');
console.log(`[로컬 CSV 생성 완료]      -> ${path.join('artifacts', 'KEYWORD_STATUS.csv')}\n`);
