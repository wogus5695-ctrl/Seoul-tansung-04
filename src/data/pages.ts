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
// 노원구 탄성코트 파일럿 전용 상세 콘텐츠 데이터 (STEP 3-C 사실성 교정 완료)
const NOWON_ELASTIC_CONTENT: SeoPageContent = {
  targetSpaces: [
    {
      title: '베란다 (앞·뒤 발코니)',
      subtitle: '외벽 창호 결로 및 기존 도막 상태 점검',
      description: '외부 기온과 일조 영향을 직접 받는 공간으로, 창호 프레임 주변 실금과 기존 페인트의 들뜸·벗겨짐 여부를 우선 확인합니다.',
    },
    {
      title: '세탁실 (다용도실)',
      subtitle: '배관 주변 습기 및 환기 여건 확인',
      description: '세탁기와 배수 배관으로 습기 정체가 잦은 공간입니다. 배관 관통 부위와 모서리 오염 범위를 사전에 파악합니다.',
    },
    {
      title: '다용도 공간 · 실외기실',
      subtitle: '벽면 요철 및 보양 환경 점검',
      description: '선반 거치대 흔적이나 보일러 배관 주변의 단차를 점검하고, 시설물 보호를 위한 보양 범위를 판단합니다.',
    },
  ],
  wallConditions: [
    {
      num: '01',
      title: '도막 들뜸 및 박리',
      description: '기존 페인트가 부풀어 오르거나 가루처럼 떨어지는 상태',
      detail: '도막이 들뜬 상태 위에 칠을 올리면 접착이 약해질 수 있으므로, 들뜬 부위를 긁어내고 바탕면을 정돈하는 작업이 선행됩니다.',
    },
    {
      num: '02',
      title: '벽면 균열 (크랙)',
      description: '창호 모서리나 벽체 이음매에 실금이 발생한 상태',
      detail: '균열 틈새로 습기가 스며들지 않도록 균열 폭과 깊이에 맞춰 퍼티 등으로 면을 고르게 메우는 보강을 진행합니다.',
    },
    {
      num: '03',
      title: '곰팡이 및 오염 흔적',
      description: '구석 모서리와 외벽 접합부에 거뭇한 얼룩이 번진 상태',
      detail: '단순 표면 닦아내기를 넘어 오염부를 깨끗이 닦아내고 바탕면 처리 작업을 거쳐 도막 손상을 줄입니다.',
    },
    {
      num: '04',
      title: '습기 및 결로 자국',
      description: '창가 주변 벽체에 물방울 맺힘이나 축축한 흔적이 남은 상태',
      detail: '현재 벽면의 습기 상태를 점검하여 벽면이 충분히 건조된 상태에서 도포 작업이 이루어지도록 시점을 조율합니다.',
    },
  ],
  scopeFactors: [
    {
      title: '기존 도막 상태 (들뜸·노후도)',
      condition: '기존 페인트의 벗겨짐 면적이 넓거나 들뜸이 많은 경우',
      impact: '도포 전 들뜬 도막을 긁어내고 면을 정리하는 밑작업 시간이 추가되어 기초 준비 범위가 넓어집니다.',
    },
    {
      title: '균열 및 실리콘 상태',
      condition: '창호 주변 실리콘 노후화 및 벽체 틈새 균열이 있는 경우',
      impact: '도장면 접착력 유지와 평탄한 마감을 위해 균열 메꿈 및 보수 작업이 사전에 병행되어야 합니다.',
    },
    {
      title: '작업 공간 시설물 및 보양 난이도',
      condition: '세탁기·건조기, 보일러 배관, 수납 선반 등이 밀집된 환경',
      impact: '도료 비산을 방지하기 위한 비닐 커버링 보양 작업 범위가 넓어지며, 장비 진입 및 작업 동선 확인이 필요합니다.',
    },
  ],
  consultationPreps: [
    {
      num: '01',
      title: '작업 희망 공간 전체 전경',
      description: '베란다, 세탁실 등 작업하고자 하는 공간의 바닥부터 천장까지 전체 구조가 보이도록 촬영해 주시면 도움이 됩니다.',
    },
    {
      num: '02',
      title: '문제 부위 근접 사진',
      description: '페인트가 부풀었거나 곰팡이 얼룩, 벽면 균열이 있는 부위를 가까이에서 찍어주시면 필요한 보수 범위를 가늠하는 데 도움이 됩니다.',
    },
    {
      num: '03',
      title: '설비 및 가전 배치 상태',
      description: '세탁기, 선반, 보일러 등 벽면에 인접한 시설물의 위치가 보이도록 사진을 남겨주시면 보양 작업 준비에 참고가 됩니다.',
    },
    {
      num: '04',
      title: '상담 희망 지역 및 일정',
      description: '노원구 내 대략적인 동 위치와 공실 여부(이사 전·입주 전 또는 거주 중), 희망하시는 시공 일정을 말씀해 주세요.',
    },
  ],
  processSteps: [
    {
      step: 'STEP 01',
      title: '현장 확인 및 보양 작업',
      description: '창호, 샷시, 계량기, 바닥 타일 등 비도장 구역을 보양 테이프로 감싸 도료가 묻지 않도록 보호합니다.',
    },
    {
      step: 'STEP 02',
      title: '바탕면 정리 및 부분 보수',
      description: '들뜬 도막을 긁어내고, 미세 균열 부위를 메우며 오염부를 닦아내는 기초 바탕면 정리 작업을 진행합니다.',
    },
    {
      step: 'STEP 03',
      title: '탄성코트 도포 작업',
      description: '전용 도장 장비를 활용하여 벽면과 천장에 적절한 두께와 질감으로 도료를 고르게 도포합니다.',
    },
    {
      step: 'STEP 04',
      title: '보양재 제거 및 마감 확인',
      description: '보양 테이프를 조심스럽게 제거한 뒤 도막 상태를 육안으로 확인하고 일상 환기 및 양생 요령을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '노원구 지역은 방문 상담이나 시공 상담이 가능한가요?',
      answer: '노원구를 포함한 서울 전역 시공 상담이 가능합니다. 현장 일정 조율 및 작업 조건 확인을 위해 베란다와 세탁실 벽면 사진을 문자로 먼저 보내주시면 더욱 수월하게 상담받으실 수 있습니다.',
    },
    {
      question: '거주 중인 살림집인데 시공이 가능한가요?',
      answer: '거주 중인 세대도 시공이 가능하지만, 도포 시공 특성상 발코니 및 세탁실 내부의 짐은 작업 공간 밖으로 미리 이동해 주셔야 합니다. 이동이 어려운 대형 가전의 경우 현장 사진을 통해 보양 및 작업 가능 여부를 협의합니다.',
    },
    {
      question: '시공 후 냄새와 건조 시간은 어느 정도 걸리나요?',
      answer: '수성 도료 특성상 자극적인 시너 냄새는 거의 없으나 건조 과정에서 특유의 도료취가 남을 수 있습니다. 표면 건조는 보통 1~2일 내외, 속건조까지는 계절과 습도, 환기 여건에 따라 수일이 소요되므로 시공 후 충분한 자연 환기를 권장합니다.',
    },
    {
      question: '탄성코트를 시공하면 결로와 곰팡이를 완전히 방지할 수 있나요?',
      answer: '탄성코트는 벽면의 쾌적한 마감과 통기성 관리를 돕는 기능성 도료입니다. 다만 건물 외부 균열로 인한 누수나 환기 부재로 인한 심한 결로를 완전히 차단하는 것은 아니므로, 시공 후에도 규칙적인 환기 관리가 필요합니다.',
    },
    {
      question: '기존 페인트가 많이 들떠 있으면 작업 범위나 견적이 달라지나요?',
      answer: '기존 도막의 들뜸이나 박리 면적이 넓거나 균열 보수가 광범위한 경우, 긁어내기와 메꿈 등 바탕면 밑작업에 필요한 시간과 작업 범위가 늘어날 수 있습니다. 현장 사진을 미리 확인하면 필요한 밑작업 범위를 사전에 안내받으실 수 있습니다.',
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
      isPublished: false, // STEP 3-C 최종 검증 완료 후 전 조합 비공개(false) 원복
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
      serviceScopeNotice: '올케어탄성은 서울 노원구를 포함하여 서울 전역 주거 공간을 대상으로 방문 시공 상담을 제공합니다.',
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
