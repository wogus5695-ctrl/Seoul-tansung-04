import fs from 'node:fs';
import path from 'node:path';
import { REGIONS } from '../src/data/regions.ts';
import { SERVICES } from '../src/data/services.ts';
import { SEO_PAGES, isPagePublished } from '../src/data/pages.ts';
import { getAllDynamicKeywords, KEYWORD_LEDGER, getKeywordStatus } from '../src/data/keywordRegistry.ts';
import { GUIDES } from '../src/data/guides.ts';

/**
 * 동적키워드 레지스트리 무결성 및 확장 정합성 검증 함수
 * 
 * [확장성 원칙]
 * - 고정된 숫자(12구, 2서비스)에 의존하지 않고
 * - 임의의 N개 지역, M개 서비스 등록 시에도 N × M 조합의 완전성을 동적으로 검증합니다.
 */
export function validateKeywordRegistryIntegrity(
  regions = REGIONS,
  services = SERVICES,
  keywords = null
) {
  if (!regions || regions.length === 0) {
    throw new Error('[AUDIT ERROR] 최소 1개 이상의 지역이 등록되어 있어야 합니다.');
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

  // 3. 키워드 조합 전수 수집 및 수량 동적 검증
  const allKws = keywords || getAllDynamicKeywords(regions, services);
  const expectedCount = regions.length * services.length;
  if (allKws.length !== expectedCount) {
    throw new Error(
      `[AUDIT ERROR] 지역(${regions.length}) × 서비스(${services.length}) 조합 수 불일치: 기대 ${expectedCount}개, 실제 ${allKws.length}개`
    );
  }

  // 4. keywordId 중복 및 URL 매핑 검증 (0건 보장)
  const keywordIds = new Set();
  for (const kw of allKws) {
    if (keywordIds.has(kw.id)) {
      throw new Error(`[AUDIT ERROR] keywordId 중복 발견: ${kw.id}`);
    }
    keywordIds.add(kw.id);

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

// 1. 동적키워드 전수 데이터 수집 및 동적 무결성 검증
const allKeywords = getAllDynamicKeywords(REGIONS, SERVICES);
validateKeywordRegistryIntegrity(REGIONS, SERVICES, allKeywords);

const rows = allKeywords.map((kw, index) => {
  const page = SEO_PAGES.find((p) => p.id === kw.id);
  const isPagePub = page ? isPagePublished(page) : false;
  const guide = GUIDES.find((g) => g.keywordId === kw.id);
  const kwStatus = getKeywordStatus(kw.id, GUIDES, KEYWORD_LEDGER);

  return {
    no: index + 1,
    keywordId: kw.id,
    keyword: kw.keyword,
    regionName: kw.regionName,
    serviceName: kw.serviceName,
    urlPath: kw.targetUrlPath,
    isPublished: page?.isPublished ?? false,
    contentStatus: page?.contentStatus ?? 'draft',
    htmlGenerated: isPagePub ? '생성 (O)' : '미생성 (X)',
    guideAssigned: guide ? `${guide.postId}` : '미배정 (-)',
    guideStatus: kwStatus,
    sitemapIncluded: isPagePub ? '포함 (O)' : '미포함 (X)',
  };
});

// 2. 통계 계산
const totalCount = rows.length;
const publishedPagesCount = rows.filter((r) => r.htmlGenerated === '생성 (O)').length;
const unapprovedPagesCount = totalCount - publishedPagesCount;
const publishedGuidesCount = rows.filter((r) => r.guideStatus === 'PUBLISHED').length;

// 3. 콘솔 출력
console.log('========================================================================================');
console.log('               올케어탄성 전체 동적키워드 24개 관리 현황표 (Local Audit)               ');
console.log('========================================================================================');
console.table(
  rows.map((r) => ({
    No: r.no,
    'Keyword ID': r.keywordId,
    동적키워드: r.keyword,
    작업명: r.serviceName,
    지역명: r.regionName,
    'SEO 상태': `${r.isPublished} / ${r.contentStatus}`,
    'HTML 생성': r.htmlGenerated,
    '가이드 배정': r.guideAssigned,
    '가이드 상태': r.guideStatus,
    'Sitemap 포함': r.sitemapIncluded,
  }))
);

console.log('----------------------------------------------------------------------------------------');
console.log(`[요약 통계] 총 키워드: ${totalCount}개 | 공개 승인 페이지: ${publishedPagesCount}개 | 비공개 격리: ${unapprovedPagesCount}개 | 정식 가이드: ${publishedGuidesCount}개`);
console.log('========================================================================================\n');

// 4. 로컬 전용 보고서 저장 (artifacts/ 폴더는 .gitignore 대상)
const artifactsDir = path.resolve('artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// 4-A. Markdown 현황표 생성
const mdHeader = `# 올케어탄성 동적키워드 24개 관리 현황표

- **검수 일시**: ${new Date().toISOString()}
- **기준 도메인**: https://www.seoulallcaretan.com/
- **총 키워드 수**: ${totalCount}개 (공개 ${publishedPagesCount}개 / 비공개 ${unapprovedPagesCount}개)
- **정보성 가이드 발행**: ${publishedGuidesCount}개

| No | Keyword ID | 동적키워드 | 작업명 | 지역명 | 지역 SEO URL | isPublished | contentStatus | HTML 생성 | Guide 배정 | Guide 상태 | Sitemap 포함 |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: | :---: |
`;

const mdBody = rows
  .map(
    (r) =>
      `| ${r.no} | \`${r.keywordId}\` | **${r.keyword}** | ${r.serviceName} | ${r.regionName} | \`${r.urlPath}\` | ${r.isPublished} | ${r.contentStatus} | ${r.htmlGenerated} | ${r.guideAssigned} | **${r.guideStatus}** | ${r.sitemapIncluded} |`
  )
  .join('\n');

const mdFooter = `\n\n> **[격리 안전 원칙]**\n> 본 문서는 로컬 관리자용 현황표이며, public/ 및 dist/ 디렉토리에 포함되지 않아 외부로 노출되지 않습니다.\n`;

fs.writeFileSync(path.join(artifactsDir, 'KEYWORD_STATUS.md'), mdHeader + mdBody + mdFooter, 'utf8');
console.log(`[로컬 보고서 생성 완료] -> ${path.join('artifacts', 'KEYWORD_STATUS.md')}`);

// 4-B. CSV 현황표 생성
const csvHeader = 'No,Keyword ID,동적키워드,작업명,지역명,지역 SEO URL,isPublished,contentStatus,실제 HTML 생성 여부,Guide 배정 여부,Guide 발행 상태,Sitemap 포함 여부\n';
const csvBody = rows
  .map(
    (r) =>
      `${r.no},"${r.keywordId}","${r.keyword}","${r.serviceName}","${r.regionName}","${r.urlPath}",${r.isPublished},${r.contentStatus},"${r.htmlGenerated}","${r.guideAssigned}","${r.guideStatus}","${r.sitemapIncluded}"`
  )
  .join('\n');

fs.writeFileSync(path.join(artifactsDir, 'KEYWORD_STATUS.csv'), '\uFEFF' + csvHeader + csvBody, 'utf8');
console.log(`[로컬 CSV 생성 완료]      -> ${path.join('artifacts', 'KEYWORD_STATUS.csv')}\n`);
