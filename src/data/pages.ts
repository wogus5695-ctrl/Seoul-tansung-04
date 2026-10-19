import { REGIONS, type Region } from './regions';
import { SERVICES, type Service } from './services';

export type ContentStatus = 'draft' | 'ready' | 'published';

export interface PageFaqItem {
  question: string;
  answer: string;
}

export interface TargetSpaceItem {
  title: string;
  subtitle: string;
  description: string;
}

export interface WallConditionCheckItem {
  num: string;
  title: string;
  description: string;
  detail: string;
}

export interface ScopeFactorItem {
  title: string;
  condition: string;
  impact: string;
}

export interface ConsultationPrepItem {
  num: string;
  title: string;
  description: string;
}

export interface ProcessStepItem {
  step: string;
  title: string;
  description: string;
}

export interface SeoPageContent {
  targetSpaces: TargetSpaceItem[];
  wallConditions: WallConditionCheckItem[];
  scopeFactors: ScopeFactorItem[];
  consultationPreps: ConsultationPrepItem[];
  processSteps: ProcessStepItem[];
  faqs: PageFaqItem[];
}

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
  h1: string;
  heroCopy: string;
  serviceScopeNotice: string;
  content?: SeoPageContent;
}

// 12개 자치구 x 2개 작업명 = 총 24개 조합 관리
// 노원구 탄성코트 파일럿 전용 상세 콘텐츠 데이터 (STEP 3-B)
const NOWON_ELASTIC_CONTENT: SeoPageContent = {
  targetSpaces: [
    {
      title: '베란다 (앞·뒤 발코니)',
      subtitle: '외벽 창호 결로 및 기존 도막 상태 점검',
      description: '외부 기온과 직사광선에 직접 노출되는 공간으로, 창호 프레임 주변 실금과 기존 페인트의 들뜸·박리 여부를 중점 확인합니다.',
    },
    {
      title: '세탁실 (다용도실)',
      subtitle: '배관 주변 습기 및 환기 여건 확인',
      description: '세탁기와 배수 배관으로 습기 정체가 잦은 공간입니다. 배관 통과부 실링 상태와 곰팡이 오염 범위를 사전에 파악합니다.',
    },
    {
      title: '다용도 공간 · 실외기실',
      subtitle: '벽면 요철 및 보양 환경 점검',
      description: '선반 거치대 흔적이나 보일러 배관 주변의 단차를 점검하고, 설비 손상 방지를 위한 정밀 보양 범위를 판단합니다.',
    },
  ],
  wallConditions: [
    {
      num: '01',
      title: '도막 들뜸 및 박리',
      description: '기존 페인트가 부풀어 오르거나 가루처럼 떨어지는 상태',
      detail: '도막이 들뜬 상태 위에 덧칠하면 탄성코트가 함께 탈락하므로, 스크래퍼로 들뜬 부위를 깨끗이 긁어내는 하지 정리가 선행됩니다.',
    },
    {
      num: '02',
      title: '벽면 균열 (크랙)',
      description: '창호 모서리나 벽체 이음매에 실금이 발생한 상태',
      detail: '균열 틈새로 습기가 침투하지 않도록 탄성 퍼티 및 실링재로 표면 단차를 평탄하게 보강한 후 도포를 진행합니다.',
    },
    {
      num: '03',
      title: '곰팡이 및 오염 흔적',
      description: '구석 모서리와 외벽 접합부에 거뭇한 얼룩이 번진 상태',
      detail: '단순 표면 닦아내기를 넘어 오염부를 세척하고 곰팡이 하도 항균 처리를 거쳐 도막 내부 번짐을 억제합니다.',
    },
    {
      num: '04',
      title: '습기 및 결로 자국',
      description: '창가 주변 벽체에 물방울 맺힘이나 축축한 흔적이 남은 상태',
      detail: '현재 벽면의 습윤도를 점검하여 충분한 자연 건조 상태가 확보되었는지 확인한 뒤 최적의 작업 시점을 조율합니다.',
    },
  ],
  scopeFactors: [
    {
      title: '기존 도막 상태 (들뜸·노후도)',
      condition: '기존 수성페인트의 박리 면적이 넓거나 들뜸이 심한 경우',
      impact: '단순 뿜칠 전 도막 긁어내기 및 퍼티 면잡기 작업 시간이 추가되어 기초 전처리 범위가 넓어집니다.',
    },
    {
      title: '균열 및 코킹 노후도',
      condition: '창호 주변 실리콘 노후화 및 벽체 깊은 크랙이 존재하는 경우',
      impact: '도장면 탈락 방지를 위해 하도 보강재와 변성 실링 퍼티 처리가 필수적으로 선행되어야 합니다.',
    },
    {
      title: '작업 공간 시설물 및 보양 난이도',
      condition: '세탁기·건조기, 보일러 배관, 수납 선반 등이 밀집된 환경',
      impact: '오염 방지를 위한 커버링 테이핑 및 보양 작업 범위가 넓어지며, 장비 접근 여건에 따른 시공 동선 확보가 필요합니다.',
    },
  ],
  consultationPreps: [
    {
      num: '01',
      title: '시공 희망 공간 전체 전경',
      description: '베란다, 세탁실 등 작업하고자 하는 공간의 바닥부터 천장까지 전체 구조가 보이도록 찍어주세요.',
    },
    {
      num: '02',
      title: '문제 부위 근접 사진',
      description: '도막이 부풀었거나 곰팡이 얼룩, 벽면 실금이 있는 부위를 가까이에서 촬영해 주시면 전처리 범위를 정확히 판단할 수 있습니다.',
    },
    {
      num: '03',
      title: '설비 및 가전 배치 상태',
      description: '세탁기, 선반, 보일러 등 벽면에 밀착된 시설물의 위치가 보이도록 사진을 남겨주시면 보양 계획에 도움이 됩니다.',
    },
    {
      num: '04',
      title: '상담 희망 지역 및 시공 일정',
      description: '노원구 내 대략적인 동 위치(상계동, 중계동, 하계동 등)와 입주 전 공실 또는 거주 중 여부, 희망 일정을 알려주세요.',
    },
  ],
  processSteps: [
    {
      step: 'STEP 01',
      title: '현장 상태 확인 & 보양',
      description: '창호, 샷시, 계량기, 바닥 타일 등 비도장 구역을 커버링 테이프로 밀착 보양하여 도료 오염을 원천 차단합니다.',
    },
    {
      step: 'STEP 02',
      title: '바탕면 정리 & 하자 보수',
      description: '들뜬 도막을 스크래퍼로 긁어내고, 균열 부위 퍼티 메꿈과 곰팡이 오염 부위 하도 차단 처리를 정석으로 진행합니다.',
    },
    {
      step: 'STEP 03',
      title: '친환경 세라믹 균일 도포',
      description: '고압 콤프레셔 장비를 사용하여 일정한 두께와 질감으로 벽면과 천장에 도료를 꼼꼼하게 뿜칠합니다.',
    },
    {
      step: 'STEP 04',
      title: '보양재 철거 & 마감 확인',
      description: '보양 테이프를 도막 손상 없이 정밀하게 제거하고, 고객님과 함께 작업 면을 육안 검수한 뒤 환기 및 양생 요령을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '노원구 지역은 당일 방문 상담이나 견적 확인이 가능한가요?',
      answer: '노원구 전 지역(상계·중계·하계·공릉·월계동 등) 방문 상담 및 시공이 가능합니다. 다만 일정 조율 및 신속한 판단을 위해 베란다와 세탁실 벽면 사진을 문자로 먼저 전송해 주시면 보다 정확하고 빠른 사전 견적 상담이 진행됩니다.',
    },
    {
      question: '거주 중인 살림집인데 시공이 가능한가요?',
      answer: '거주 중인 세대도 시공이 가능합니다. 다만 뿜칠 시공 특성상 발코니 및 세탁실 내부의 짐은 작업 공간 밖으로 이동되어야 합니다. 이동이 어려운 대형 가전의 경우 사전에 사진으로 상담하여 보양 가능 여부를 판단합니다.',
    },
    {
      question: '시공 후 냄새는 심하지 않은가요? 건조에는 얼마나 걸리나요?',
      answer: '수성 세라믹 도료를 사용하여 유기용제(시너 등) 냄새가 거의 없으며 은은한 건조취 수준입니다. 표면 건조는 계절과 환기 여건에 따라 약 1~2일 소요되며, 완전 양생(속건조)까지는 약 3~5일간 자연 환기를 유지해 주시는 것이 좋습니다.',
    },
    {
      question: '탄성코트를 시공하면 결로와 곰팡이가 완전히 영구 차단되나요?',
      answer: '탄성코트는 다공성 세라믹 성분으로 도막의 통기성을 높이고 조습 및 곰팡이 억제에 도움을 주는 기능성 마감재입니다. 그러나 외벽 크랙 누수나 환기 부재로 인한 결로를 100% 영구적으로 막는 것은 아니므로, 정기적인 환기 관리가 병행되어야 합니다.',
    },
    {
      question: '기존 페인트가 많이 들떠 있는데 추가 비용이 발생하나요?',
      answer: '기존 도막의 박리 면적이 넓거나 균열 보수가 광범위한 경우, 밑작업(스크래핑 및 퍼티)에 소요되는 시간과 자재에 따라 작업 범위가 조정될 수 있습니다. 사진을 미리 보내주시면 밑작업 범위를 사전에 안내해 드립니다.',
    },
  ],
};

export const SEO_PAGES: SeoPageConfig[] = [];

for (const service of SERVICES) {
  for (const region of REGIONS) {
    const isNowonElastic = service.id === 'elastic-coating' && region.id === 'nowon';
    
    SEO_PAGES.push({
      id: `${service.id}_${region.id}`,
      regionId: region.id,
      serviceId: service.id,
      serviceSlug: service.slug,
      districtSlug: region.slug,
      urlPath: `/seo/${service.slug}/${region.slug}.html`,
      isPublished: false, // STEP 3-B 파일럿 검증 완료 후 전 조합 비공개(false) 원복
      contentStatus: isNowonElastic ? 'ready' : 'draft',
      metaTitle: isNowonElastic
        ? '노원구 탄성코트 시공 안내 | 베란다·세탁실 - 올케어탄성'
        : `${region.name} ${service.name} | 베란다·세탁실 - 올케어탄성`,
      metaDescription: isNowonElastic
        ? '노원구 탄성코트 시공을 고려하고 계신가요? 베란다·세탁실의 도막 들뜸, 균열, 습기 흔적을 확인하고 필요한 작업 범위와 상담 준비 사항을 안내합니다.'
        : `${region.name} ${service.name} 시공 안내. 베란다 및 세탁실 벽면 상태를 먼저 확인하고 작업 범위를 안내합니다.`,
      h1: isNowonElastic
        ? '노원구 탄성코트 시공 안내'
        : `${region.name} ${service.name} 시공 안내`,
      heroCopy: isNowonElastic
        ? '노원구 아파트·주거 공간 베란다와 세탁실의 도막 들뜸, 균열, 습기 흔적을 확인하고 필요한 작업 범위를 정직하게 안내합니다.'
        : `${region.name} 지역의 베란다와 세탁실 벽면 상태를 확인하고 필요한 작업 범위를 안내합니다.`,
      serviceScopeNotice: '올케어탄성은 서울 노원구 전 지역(상계·중계·하계·공릉·월계)을 포함하여 서울 전역을 대상으로 표준화된 정석 시공을 제공합니다.',
      content: isNowonElastic ? NOWON_ELASTIC_CONTENT : undefined,
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
