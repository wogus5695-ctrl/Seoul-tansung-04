import type { GuidePost } from './guides.ts';

/**
 * STEP RSS-NORTH-1: 중랑구 구 단위 정보성 Guide 1호 로컬 초안 (비공개 보관)
 * 
 * [보관 원칙]
 * 1. 본 초안은 운영자 검수 전까지 src/data/guides.ts의 GUIDES 공개 배열에 편입되지 않습니다.
 * 2. KEYWORD_LEDGER의 PUBLISHED 변경 및 RSS/Sitemap 수량 증가를 원천 방지합니다.
 * 3. 향후 운영자 검수 및 정식 승인 단계(STEP RSS-NORTH-2)에서 GUIDES 배열로 승격됩니다.
 */
export const JUNGNANG_GUIDE_DRAFT: GuidePost = {
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
  contentStatus: 'draft',
  isPublished: false,
  publishedAt: null,
  updatedAt: null,
  relatedServiceId: 'elastic-coating',
  relatedRegionId: 'jungnang',
};
