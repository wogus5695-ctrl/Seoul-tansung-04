import type { ContentStatus } from './pages.ts';
import { getSeoPage, isPagePublished } from './pages.ts';
import { SERVICES } from './services.ts';
import { REGIONS } from './regions.ts';

/**
 * RSS 정보성 가이드 게시글 인터페이스
 */
export interface GuidePost {
  postId: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  keywordId: string;
  contentType: 'guide';
  contentStatus: ContentStatus; // 'draft' | 'in_review' | 'approved'
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  relatedServiceId: string;
  relatedRegionId: string;
}

/**
 * 정보성 가이드(RSS) 게시글 레지스트리
 * 
 * [운영 정책]
 * - RSS-1 단계에서는 실제 게시글을 작성하거나 공개하지 않습니다.
 * - 본 배열은 빈 배열로 시작하며, 단위 테스트는 전용 Fixture 데이터를 사용합니다.
 */
export const GUIDES: GuidePost[] = [
  {
    postId: 'guide-nowon-wall-peeling-check',
    slug: 'nowon-balcony-wall-peeling-check',
    title: '노원구 탄성코트 시공 전, 베란다 벽면 들뜸을 확인하는 방법',
    description: '베란다 벽면에 기존 페인트가 들뜨거나 가루가 발생한다면 시공 전 확인할 사항이 있습니다. 도막 상태와 작업 범위, 사진 촬영 및 상담 준비 방법을 안내합니다.',
    body: `베란다 벽면을 손으로 쓸어내렸을 때 하얀 가루가 묻어나거나, 페인트 표면이 껍질처럼 부풀어 오른 모습을 보신 적이 있으실 겁니다. 노원구 탄성코트 시공을 고민하고 계신다면, 칠을 새로 올리기 전에 베란다 벽면의 기존 페인트가 들떠 있는지부터 점검해 보시는 것이 좋습니다. 기존 페인트가 벽체 바탕면과 분리되어 들뜬 상태에서는 마감재를 덧발라도 부착력을 유지하기 어렵기 때문입니다.

## 베란다 벽면 들뜸은 어떤 상태인가요?

벽면 들뜸은 콘크리트나 석고보드 등 벽체 바탕면과 기존 도막 사이의 접착력이 약해져 틈이 벌어진 현상을 말합니다. 겉으로 보기에는 온전해 보여도 손가락 끝이나 단단한 도구로 가볍게 두드렸을 때 둔탁하거나 통통거리는 빈 소리가 난다면 도막 또는 바탕면의 들뜸 가능성이 있어 세밀한 추가 확인이 필요합니다.

이러한 현상은 주로 겨울철 차가운 외벽면과 실내 온습도 차이로 인해 발생하는 결로, 창호 틈새나 벽체의 미세한 습기 유입이 반복되면서 나타납니다. 수분을 머금은 페인트가 수축과 팽창을 거듭하면서 바탕면을 잡고 있던 접착력을 점차 잃게 되는 것입니다.

## 기존 페인트가 벗겨지거나 가루가 발생할 때 확인할 사항

벽면의 도막 이상은 현장 환경에 따라 여러 형태로 관찰되며, 상태에 따라 필요한 전처리 방법이 달라집니다.

- 초킹 현상(도막 분화): 자외선 노출이나 도막 노후로 인해 페인트 표면의 수지가 분해되면서 분필 가루처럼 묻어나는 현상입니다. 표면 청소와 적절한 하도 도포 여부를 현장 상태에 맞춰 판단해야 합니다.
- 백화 현상: 벽체 내부의 수분이 증발하는 과정에서 시멘트 바탕면의 염류가 표면으로 이동해 하얗게 침착되는 현상입니다. 단순 도막 노후와 달리 내부 수분 공급 경로를 먼저 점검할 필요가 있습니다.
- 미세 균열(크랙): 창문 모서리나 벽체 접합부 주변으로 실금이 발생하는 현상으로, 균열의 깊이와 진행성 여부에 따라 보수재 선택이 달라집니다.
- 박리 및 탈락(들뜸): 도막이 조각나거나 껍질처럼 떨어져 나가는 상태로, 접착력이 이미 상실되었으므로 들뜬 구간을 긁어내는 바탕면 정돈(게링) 작업이 필요합니다.

이러한 현상들은 반드시 순서대로 진행되는 것은 아니며, 현장의 습도와 환기 조건에 따라 복합적으로 나타날 수 있습니다.

## 시공 상담에 도움이 되는 벽면 사진 촬영 방법

전문가에게 시공 범위를 문의하기 전, 휴대전화로 벽면 상태를 미리 촬영해 두시면 비대면 상담 시 대략적인 현장 조건을 파악하는 데 큰 도움이 됩니다.

- 전체 전경 사진: 베란다의 구조와 작업 환경을 파악할 수 있도록 출입문 근처에서 벽면 전체가 보이게 넓게 촬영합니다.
- 문제 부위 근접 사진: 도막이 부풀어 오르거나 벗겨진 경계 부위를 선명하게 촬영하여 손상 깊이와 범위를 가늠할 수 있게 합니다.
- 창호 및 배관 주변 사진: 실리콘 상태나 우수관 주변처럼 습기 영향이 큰 취약부를 함께 담아주시면 전처리 소요 범위를 조율하는 데 유리합니다.

다만 사진만으로는 벽체 내부의 잔류 습기나 두드렸을 때 느껴지는 빈 공간까지 전부 파악하기는 어려우므로, 최종적인 작업 범위는 현장 방문 시의 정밀 확인을 통해 확정됩니다.

## 부분 보수와 전체 시공을 구분할 때 살펴볼 조건

들뜬 부위의 보수 범위를 결정할 때는 단순히 손상된 면적의 크기만으로 판단할 수 없습니다.

손상 부위 주변 도막의 부착 상태, 기존 마감재의 종류, 벽체의 건조 상태, 그리고 향후 도막 탈락 가능성을 종합적으로 고려해야 합니다.

- 국소 정리 가능 조건: 들뜬 부위가 특정 위치에 제한되어 있고 주변 도막을 긁어보아도 추가 탈락이 없으며 바탕면이 건조한 상태라면, 손상부를 긁어내고 단차를 정돈하는 부분 밑작업이 고려될 수 있습니다.
- 광범위 점검 필요 조건: 들뜬 면적을 긁어낼 때 주변 도막까지 연쇄적으로 벗겨지거나, 벽면 곳곳에서 반복적인 들뜸이 확인되는 경우, 또는 모래 가루가 지속적으로 떨어지는 경우에는 벽면 전반의 바탕면 강화와 전처리 계획을 다시 세워야 합니다.

약해진 도막 위에 새로운 칠을 올리면 건조 과정의 인장력으로 인해 기존 페인트가 함께 떨어져 나올 수 있으므로, 현장 조건에 맞는 정확한 밑작업 판단이 필수적입니다.

## 습기·결로·균열이 있다면 먼저 확인해야 하는 문제

탄성코트는 베란다 벽면의 도막을 정돈하고 일상적인 환경 관리를 돕는 마감재이지만, 모든 누수나 결로를 원천적으로 차단해 주는 방수 도료는 아닙니다. 실제 사용하는 도료의 제품별 특성과 시공 조건, 그리고 거주 중의 실내 환기 여건에 따라 체감 성능과 결과는 달라질 수 있습니다.

따라서 도포 작업을 고려하기 전에 다음 문제를 먼저 점검해야 합니다.

- 외벽 크랙 누수 여부: 비가 올 때 창호 프레임 주변이나 상부 벽면에서 물방울이 스며드는 흔적이 있다면 실제 누수 원인을 먼저 확인한 뒤 필요한 보수 방안을 결정해야 합니다. 누수 원인을 방치한 채 마감재만 칠하는 것은 근본적인 해결이 되지 않습니다.
- 벽체 건조 여건: 벽면이 젖어 있거나 결로수가 흐르는 상태에서는 도료의 정상적인 부착과 건조가 어려워 시공 하자 위험이 높아질 수 있으므로, 충분한 환기와 건조를 거친 뒤 작업 일정을 조율해야 합니다.
- 배관 주변 누수: 세탁 배수관이나 보일러 배관 연결부의 누수로 물이 튀는 상태라면 배관 수리가 먼저 이루어져야 합니다.

## 상담 전에 준비하면 좋은 정보

유선이나 사진 상담을 진행할 때 다음 사항을 미리 확인해 두시면 상담이 원활해집니다.

- 거주 상태(공실 여부): 가구와 짐이 있는 거주 상태인지, 비어 있는 공실인지에 따라 보양 범위와 작업 동선이 달라집니다.
- 공간 조건: 베란다 확장 여부나 샷시 연식, 과거 누수 이력 등을 파악해 두시면 작업 난이도를 가늠하는 데 도움이 됩니다.
- 기존 벽면 마감재: 기존 벽체가 일반 수성 페인트인지, 유성 페인트나 탄성코트 재시공인지, 타일 부착면인지에 따라 적합한 하도 프라이머와 작업 공정이 결정됩니다.

벽면의 도막 상태와 현장 환경을 사전에 꼼꼼히 점검할수록, 현장에 적합한 시공 범위를 정확하게 결정하고 안정적인 마감을 기대할 수 있습니다.`,
    keywordId: 'elastic-coating_nowon',
    contentType: 'guide',
    contentStatus: 'approved',
    isPublished: true,
    publishedAt: '2026-10-20T14:15:00.000Z',
    updatedAt: '2026-10-20T14:15:00.000Z',
    relatedServiceId: 'elastic-coating',
    relatedRegionId: 'nowon',
  },
  {
    postId: 'guide-dobong-laundry-pipe-check',
    slug: 'dobong-laundry-room-pipe-wall-check',
    title: '도봉구 탄성코트 시공 전, 세탁실 배관 주변과 벽면 상태 점검법',
    description: '도봉구 세탁실 탄성코트 시공 전 확인할 배관 결로와 누수 구분 요령, 기존 도막 상태 점검, 세탁기·건조기 배치에 따른 보양 및 사진 준비 방법을 안내합니다.',
    body: `세탁실은 환기 여건이나 외벽 단열 상태, 그리고 세탁기 사용 환경에 따라 벽면에 습기가 머물거나 도막 손상이 나타날 수 있는 공간입니다. 도봉구 탄성코트 시공을 계획 중이시라면, 칠을 진행하기 전에 배관 관통 부위와 벽면 하부의 기존 페인트가 들떠 있거나 오염 자국이 생겨 있지 않은지 먼저 살펴보는 것이 좋습니다.

배관 주변에 물방울이 맺혀 있다면 실내외 온도 차이에 의한 결로 현상인지, 혹은 배관 연결부의 누수 흔적인지 구분하여 원인을 점검할 필요가 있습니다. 또한 기존 페인트 표면이 부풀어 있거나 가루가 묻어나는 상태라면, 현장 도막 부착력에 맞춰 들뜬 부분을 긁어내고 바탕면을 정돈하는 밑작업 범위를 사전에 판단해야 합니다.

세탁기나 건조기 등 가전이 벽체와 가깝게 배치된 환경에서는 작업자의 시공 동선 확보와 도료 비산 방지를 위한 보양 준비가 달라질 수 있습니다. 다만 사진만으로는 벽체 건조도나 미세 단차까지 전부 파악하기 어려우므로, 대략적인 가전 배치와 배관 주변 사진을 준비해 주시면 현장 여건에 맞춘 작업 절차를 보다 수월하게 조율하실 수 있습니다.`,
    keywordId: 'elastic-coating_dobong',
    contentType: 'guide',
    contentStatus: 'approved',
    isPublished: true,
    publishedAt: '2026-10-21T01:51:00.000Z',
    updatedAt: '2026-10-21T01:51:00.000Z',
    relatedServiceId: 'elastic-coating',
    relatedRegionId: 'dobong',
  },
  {
    postId: 'guide-nowon-balcony-masking-checklist',
    slug: 'nowon-balcony-storage-masking-checklist',
    title: '노원구 베란다탄성코트 시공 전, 창고장과 시설물 보양 체크리스트',
    description: '노원구 베란다 탄성코트 시공 전 창고장 내부 시공 여부 확인, 빨래건조대 및 실외기 설비 안전 보호 조치, 창호 주변 보양 점검 사항을 안내합니다.',
    body: `베란다 공간은 세대 구조에 따라 창고장, 천장형 빨래건조대, 실외기실 등 다양한 설비나 시설물이 벽체 인접부에 설치되어 있을 수 있습니다. 노원구 베란다탄성코트 시공을 알아보고 계신다면, 도료 분무 작업 중 시설물 오염을 방지하고 작업자의 시공 동선이 충분히 확보될 수 있는지 현장 환경을 미리 확인하는 것이 좋습니다.

베란다 붙박이 창고장 내부까지 시공 범위에 포함하는 세대라면, 벽체 전체에 도료를 고르게 도포할 수 있도록 선반 적재물 정리나 내부 작업 공간 확보 여부를 사전에 협의해야 합니다. 아울러 에어컨 실외기나 환기 설비가 설치되어 있다면 작업 중 가동 여부와 안전한 보호 조치 방안을 시공자와 미리 조율하여 설비 환기구나 기능에 무리가 가지 않도록 주의해야 합니다.

창호 샷시 프레임과 타일 바닥 경계면은 실리콘 코킹의 노후 상태와 틈새 여건에 따라 테이핑 보양 및 밑작업 범위가 달라질 수 있습니다. 시설물이 벽면과 맞닿은 형태와 창호 주변 상태를 사진으로 남겨두시면 유선 상담 시 대략적인 보양 소요 범위와 작업 일정을 조율하는 데 유용한 참고 자료가 됩니다.`,
    keywordId: 'balcony-elastic-coating_nowon',
    contentType: 'guide',
    contentStatus: 'approved',
    isPublished: true,
    publishedAt: '2026-10-21T01:51:00.000Z',
    updatedAt: '2026-10-21T01:51:00.000Z',
    relatedServiceId: 'balcony-elastic-coating',
    relatedRegionId: 'nowon',
  },
  {
    postId: 'guide-jungnang-wall-drying-check',
    slug: 'jungnang-wall-drying-check',
    title: '중랑구 탄성코트 시공 전, 벽면 건조 상태를 확인해야 하는 이유',
    description: '중랑구 탄성코트 시공 전 벽면 습기와 결로 흔적, 외벽 창호 누수 가능성을 점검하는 이유와 표면 건조 및 바탕면 정리, 상담 전 사진 준비 방법을 안내합니다.',
    body: `베란다나 세탁실 벽면에 습기 자국이나 물방울 맺힘 흔적이 있다면, 중랑구 탄성코트 시공 전 벽체가 충분히 건조되었는지 먼저 확인해야 합니다. 수분을 머금은 벽면에 도료를 바로 분사하면 도막이 표면에 단단히 밀착되지 못하고 들뜸이나 부풀림 하자로 이어질 수 있기 때문입니다.

특히 벽면의 수분이 실내외 온도 차에 의한 일시적 결로인지, 창호 실리콘 노후나 외벽 균열로 인한 빗물 누수인지 구분하는 과정이 중요합니다. 탄성코트는 방수 도료가 아니므로 외부 누수가 원인이라면 누수 보수가 선행되어야 하며, 원인을 해결하지 않고 칠만 덧바르는 것은 적절하지 않습니다.

기존 페인트가 껍질처럼 일어나 있거나 부스러진 상태라면 들뜬 도막을 깨끗이 긁어내고 바탕면이 건조된 뒤 보수재로 면을 고르는 밑작업이 우선됩니다. 잔류 습기가 남은 상태에서 작업을 서두르기보다 충분한 환기와 건조 여건을 확보하는 것이 안전합니다.

상담 전 습기 자국이 있는 벽면 전경과 창호 주변 근접 사진을 준비하시면 필요한 작업 범위와 건조 상태를 더욱 명확히 안내받으실 수 있습니다. 중랑구 지역의 구체적인 작업 공정은 [중랑구 탄성코트 시공 안내](https://www.seoulallcaretan.com/seo/elastic-coating/seoul-jungnang-gu.html)에서 확인하실 수 있습니다.`,
    keywordId: 'elastic-coating_jungnang',
    contentType: 'guide',
    contentStatus: 'approved',
    isPublished: true,
    publishedAt: '2026-10-29T06:58:00.000Z',
    updatedAt: '2026-10-29T06:58:00.000Z',
    relatedServiceId: 'elastic-coating',
    relatedRegionId: 'jungnang',
  },
];

/**
 * 게시글 2중 공개 승인 게이트
 * 
 * 조건:
 * 1. contentStatus === 'approved' (운영자 최종 사실성 및 품질 검수 통과)
 * 2. isPublished === true (공개 플래그 활성화)
 * 3. 관련 지역 SEO 페이지가 실제로 정식 공개 승인된 상태(isPagePublished)여야 함
 * 
 * 세 조건을 동시에 만족해야만 향후 정적 HTML 빌드 및 RSS 피드 등록 대상이 됩니다.
 */
export function isGuidePublished(guide: GuidePost): boolean {
  if (guide.isPublished !== true || guide.contentStatus !== 'approved') {
    return false;
  }
  const relatedPageUrl = getRelatedSeoPageUrl(guide.relatedServiceId, guide.relatedRegionId);
  return relatedPageUrl !== null;
}

/**
 * 현재 공개 승인된 게시글 목록 반환
 */
export function getPublishedGuides(guides: GuidePost[] = GUIDES): GuidePost[] {
  return guides.filter(isGuidePublished);
}

/**
 * 관련 지역 SEO 페이지의 공개 상태 확인 및 안전한 내부 링크 URL 반환
 * 
 * [안전 원칙]
 * 관련 지역 SEO 페이지가 비공개(draft 등)인 경우 null을 반환하여
 * 비공개 페이지로의 내부 링크 노출을 원천 차단합니다.
 */
export function getRelatedSeoPageUrl(serviceId: string, regionId: string): string | null {
  const service = SERVICES.find((s) => s.id === serviceId);
  const region = REGIONS.find((r) => r.id === regionId);
  if (!service || !region) return null;

  const page = getSeoPage(service.slug, region.slug);
  if (!page || !isPagePublished(page)) {
    return null;
  }

  return page.urlPath;
}
