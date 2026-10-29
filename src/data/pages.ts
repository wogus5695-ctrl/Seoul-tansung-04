import { REGIONS, type Region } from './regions.ts';
import { SERVICES, type Service } from './services.ts';
import { DONGS, type Dong } from './dongs.ts';

/**
 * 콘텐츠 승인 단계 정의:
 * - 'draft': 초안 작성 중이거나 템플릿 기본값만 있는 미완성 상태
 * - 'in_review': 내용 작성이 완료되어 운영자 사실성/품질 검토를 대기 중인 상태
 * - 'approved': 운영자 사실성 확인 및 품질 검수를 최종 통과한 상태
 */
export type ContentStatus = 'draft' | 'in_review' | 'approved';

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
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  regionLevel?: 'gu' | 'dong';
  parentRegionId?: string;
}

// 1. 노원구 탄성코트 파일럿 전용 상세 콘텐츠
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
      detail: '도막이 들뜬 상태 위에 칠을 올리면 접착이 약해질 수 있으므로, 현장 상태에 맞춰 들뜬 부위를 정리하고 바탕면을 정돈하는 작업이 선행됩니다.',
    },
    {
      num: '02',
      title: '벽면 균열 (크랙)',
      description: '창호 모서리나 벽체 이음매에 실금이 발생한 상태',
      detail: '균열 틈새로 습기가 스며들지 않도록 균열 폭과 상태를 확인하여 적절한 메꿈재로 면을 정돈하는 보수 여부를 판단합니다.',
    },
    {
      num: '03',
      title: '곰팡이 및 오염 흔적',
      description: '구석 모서리와 외벽 접합부에 거뭇한 얼룩이 번진 상태',
      detail: '단순 표면 닦아내기를 넘어 오염부를 정돈하고 벽면 상태에 맞는 전처리 과정을 진행합니다.',
    },
    {
      num: '04',
      title: '습기 및 결로 자국',
      description: '창가 주변 벽체에 물방울 맺힘이나 축축한 흔적이 남은 상태',
      detail: '벽면의 습윤도를 살펴보고, 도포 작업에 무리가 없도록 벽면 건조 상태를 확인한 뒤 작업 일정을 협의합니다.',
    },
  ],
  scopeFactors: [
    {
      title: '기존 도막 상태 (들뜸·노후도)',
      condition: '기존 페인트의 벗겨짐 면적이 넓거나 들뜸이 많은 경우',
      impact: '도포 전 들뜬 도막을 정리하고 면을 고르는 밑작업 시간이 추가되어 준비 범위가 달라집니다.',
    },
    {
      title: '균열 및 실리콘 상태',
      condition: '창호 주변 실리콘 노후화 및 벽체 틈새 균열이 있는 경우',
      impact: '도장면 접착력 유지와 마감을 위해 바탕면 균열 메꿈 및 정리 작업이 사전에 병행되어야 합니다.',
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
      description: '페인트가 부풀었거나 오염 얼룩, 벽면 균열이 있는 부위를 가까이에서 찍어주시면 필요한 보수 범위를 가늠하는 데 도움이 됩니다.',
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
      description: '창호, 샷시, 계량기, 바닥 타일 등 비도장 구역을 보양재로 감싸 도료가 묻지 않도록 보호합니다.',
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
      title: '보양재 제거 및 마감 안내',
      description: '보양 테이프를 조심스럽게 제거한 뒤 도막 상태를 육안으로 확인하고 일상 환기 및 관리 요령을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '노원구 지역은 방문 상담이나 시공 상담이 가능한가요?',
      answer: '노원구를 포함한 서울 지역 시공 상담이 가능합니다. 현장 일정 조율 및 작업 조건 확인을 위해 전화 상담 시 필요한 사진과 전달 방법을 안내받으실 수 있습니다.',
    },
    {
      question: '거주 중인 살림집인데 시공이 가능한가요?',
      answer: '거주 중 시공 가능 여부는 작업 공간의 상태와 짐·시설물 배치 등을 확인한 후 안내받으실 수 있습니다. 도포 작업 특성상 작업 공간 내 물품 이동 및 보양 협의가 사전에 필요합니다.',
    },
    {
      question: '시공 후 냄새와 건조 시간은 어느 정도 걸리나요?',
      answer: '수성 도료 특성상 자극적인 냄새는 적으나 건조 과정에서 특유의 도료취가 남을 수 있습니다. 건조 시간과 관리 방법은 사용 도료 및 온도·습도·환기 여건 등에 따라 달라지므로 구체적인 내용은 상담 시 확인이 필요합니다.',
    },
    {
      question: '탄성코트를 시공하면 결로와 누수를 완전히 해결할 수 있나요?',
      answer: '탄성코트는 벽면 마감을 위한 기능성 도장 작업입니다. 기존 누수나 외벽 크랙, 환기 부족 등 결로 발생의 근본적인 원인을 완전히 차단하는 것은 아니므로, 방수 점검과 주기적인 환기 관리가 병행되어야 합니다.',
    },
    {
      question: '기존 페인트가 많이 들떠 있으면 작업 범위나 견적이 달라지나요?',
      answer: '현장 상태를 확인하고 필요한 작업 범위를 안내합니다. 기존 도막의 들뜸이나 박리 면적이 넓거나 균열 보수가 광범위한 경우, 긁어내기와 메꿈 등 바탕면 밑작업에 필요한 시간과 공정에 따라 작업 범위가 달라질 수 있습니다.',
    },
  ],
};

// 2. 노원구 베란다탄성코트 파일럿 전용 상세 콘텐츠
const NOWON_BALCONY_ELASTIC_CONTENT: SeoPageContent = {
  targetSpaces: [
    {
      title: '전면 베란다 (거실·안방 창가)',
      subtitle: '창호 주변 도막 들뜸과 햇빛 노출 점검',
      description: '직사광선과 외부 기온 변화를 가장 크게 받는 공간으로, 창가 실리콘 접합부와 하부 벽면의 페인트 부스러짐을 중점 확인합니다.',
    },
    {
      title: '후면 베란다 (주방 인접 공간)',
      subtitle: '외벽 환기구 주변 및 그늘진 벽체 습기 점검',
      description: '환기 여건이 상대적으로 취약하고 그늘진 외벽 벽체에 결로 흔적이나 모서리 오염 얼룩이 머물기 쉬운 공간입니다.',
    },
    {
      title: '베란다 창고 · 수납장 내부',
      subtitle: '밀폐 구역 공기 정체 및 벽면 통기 환경 확인',
      description: '수납 선반 철거 자국이나 닫힌 문 안쪽의 통기 부족으로 인한 벽면 얼룩 상태를 파악하고 보양 범위를 결정합니다.',
    },
  ],
  wallConditions: [
    {
      num: '01',
      title: '창호 주변 실리콘 및 도막 들뜸',
      description: '샤시 프레임과 콘크리트 경계면의 페인트가 들떠 있는 상태',
      detail: '창가 실리콘 노후화와 온도 차이로 인해 들뜬 페인트는 도포 전 면을 긁어내고 바탕면을 정돈하는 보수 여부를 먼저 확인합니다.',
    },
    {
      num: '02',
      title: '베란다 외벽 실금 및 균열',
      description: '외기에 맞닿은 벽체나 천장 모서리에 미세한 실금이 생긴 상태',
      detail: '미세 크랙 틈새를 적절한 메꿈재로 평탄화하여 도포 후 마감이 고르게 유지되도록 사전 밑작업 범위를 조율합니다.',
    },
    {
      num: '03',
      title: '그늘진 모서리 얼룩 및 오염',
      description: '가구 뒷면이나 베란다 구석 벽면에 거뭇한 흔적이 남은 상태',
      detail: '표면 얼룩을 깨끗이 정돈하고, 벽면 내부 상태를 살펴본 뒤 도장면 손상을 방지하는 밑작업 과정을 확인합니다.',
    },
    {
      num: '04',
      title: '창가 결로수 흘러내림 흔적',
      description: '겨울철 창문 결로수가 벽체를 타고 흘러내려 얼룩진 상태',
      detail: '벽체가 충분히 건조되었는지 확인하는 것이 필수적이며, 계절과 날씨에 맞춰 도포 작업이 가능한 시점을 협의합니다.',
    },
  ],
  scopeFactors: [
    {
      title: '베란다 창호 주변 코킹 및 균열 상태',
      condition: '창틀 코킹이 노후되었거나 외벽 접합부 균열이 보이는 경우',
      impact: '도료의 접착력 유지와 고른 마감을 위해 바탕면 메꿈 보강 작업이 필요하여 준비 공정에 영향을 줍니다.',
    },
    {
      title: '베란다 화단 철거 흔적 및 벽면 요철',
      condition: '화단 턱 철거 부위나 선반 거치 자국의 단차가 심한 경우',
      impact: '단차를 고르게 맞추는 바탕면 평탄화 밑작업 범위가 넓어져 작업 소요 시간에 영향을 미칩니다.',
    },
    {
      title: '베란다 내 시설물 및 보양 난이도',
      condition: '빨래건조대, 창고장, 실외기 설비 등이 베란다에 밀집된 경우',
      impact: '도료 오염을 방지하기 위한 정밀 비닐 보양 테이핑 작업과 시공자 작업 동선 확보 여건이 중요해집니다.',
    },
  ],
  consultationPreps: [
    {
      num: '01',
      title: '베란다 창가 전체 전경 사진',
      description: '창호와 벽면, 바닥 타일이 한눈에 보이는 베란다 전체 구조 사진을 준비해 주시면 현장 구조를 파악하는 데 도움이 됩니다.',
    },
    {
      num: '02',
      title: '창호 주변 및 균열 근접 사진',
      description: '창틀 하부의 페인트 들뜸이나 모서리 실금, 얼룩 부위를 가까이에서 촬영해 주시면 필요한 보수 여부를 상담받으실 수 있습니다.',
    },
    {
      num: '03',
      title: '수납장 및 시설물 배치 상태',
      description: '선반, 건조대, 실외기 등 베란다 벽면에 붙어 있는 시설물이 보이도록 사진을 남겨주시면 보양 작업 안내에 참고가 됩니다.',
    },
    {
      num: '04',
      title: '상담 희망 지역 및 시공 일정',
      description: '노원구 내 대략적인 위치와 입주 전 공실 또는 거주 중 여부, 희망하시는 시공 일정을 말씀해 주세요.',
    },
  ],
  processSteps: [
    {
      step: 'STEP 01',
      title: '베란다 현장 확인 및 보양',
      description: '창호 유리, 샷시 프레임, 바닥 타일 등 비도장 구역을 커버링 테이프로 꼼꼼히 보양하여 도료 오염을 방지합니다.',
    },
    {
      step: 'STEP 02',
      title: '창호 주변 바탕면 정리',
      description: '창가 들뜬 페인트를 긁어내고, 미세 균열 부위를 메우며 표면 오염을 정리하는 기초 밑작업을 진행합니다.',
    },
    {
      step: 'STEP 03',
      title: '베란다 탄성코트 고른 도포',
      description: '전용 도장 장비를 활용하여 베란다 벽면과 천장에 적절한 두께와 질감으로 도료를 균일하게 도포합니다.',
    },
    {
      step: 'STEP 04',
      title: '보양재 철거 및 환기 안내',
      description: '보양 테이프를 조심스럽게 제거한 뒤 마감 상태를 육안으로 확인하고 베란다 창호 환기 및 관리 요령을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '베란다 벽면의 기존 페인트가 들뜬 경우 바로 시공할 수 있나요?',
      answer: '기존 페인트가 들뜬 상태 위에 그대로 도포하면 접착이 약해져 하자가 발생할 수 있습니다. 현장 상태를 확인하여 들뜬 도막을 긁어내고 바탕면을 정돈한 후 도포를 진행해야 하므로, 상담 시 벽면 상태 사진을 확인하는 것이 좋습니다.',
    },
    {
      question: '창호 주변에 습기나 얼룩이 있으면 무엇을 먼저 확인해야 하나요?',
      answer: '창가 실리콘 코킹의 노후화로 인한 빗물 유입인지, 단순 실내외 온도차에 따른 결로수 흔적인지 구분이 필요합니다. 누수가 의심되는 경우 방수 점검이 선행되어야 하며, 건조된 상태에서 도장 작업이 가능합니다.',
    },
    {
      question: '베란다에 짐이나 시설물이 있어도 작업할 수 있나요?',
      answer: '베란다 내 짐과 물품은 원활한 도포 작업을 위해 작업 구역 밖으로 이동해 주셔야 합니다. 이동이 어려운 붙박이 시설물이나 실외기 등은 현장 상태와 배치를 확인한 후 보양 작업 가능 여부를 상담해 드립니다.',
    },
    {
      question: '베란다 탄성코트 시공으로 결로나 누수를 완전히 해결할 수 있나요?',
      answer: '탄성코트는 베란다 벽면 마감을 위한 기능성 도장재입니다. 외벽 균열로 인한 누수나 환기 부재로 인한 심한 결로를 완전히 차단하는 것은 아니므로, 결로를 줄이기 위한 일상적인 창호 환기 관리가 반드시 필요합니다.',
    },
    {
      question: '베란다 탄성코트 상담 전에 어떤 정보를 준비하면 좋은가요?',
      answer: '베란다 창호 전경 사진과 창틀 하부 등 문제 부위의 근접 사진, 그리고 작업 공간 내 시설물 상태를 준비하시면 전화 상담 시 필요한 작업 범위와 절차를 더욱 명확히 안내받으실 수 있습니다.',
    },
  ],
};

// 3. 도봉구 탄성코트 파일럿 전용 상세 콘텐츠 (STEP 3-E 신규 설계 — 사실 기반)
const DOBONG_ELASTIC_CONTENT: SeoPageContent = {
  targetSpaces: [
    {
      title: '베란다 (발코니 창가 벽면)',
      subtitle: '외벽 창호 주변 기존 도막 및 결로 흔적 점검',
      description: '사계절 외부 기온 변화를 직접 마주하는 발코니 창가 구역으로, 샤시 하부 페인트 부스러짐과 벽체 접합부 실금을 우선 확인합니다.',
    },
    {
      title: '세탁실 및 다용도실',
      subtitle: '배수 설비 주변 벽체와 습기 정체 환경 확인',
      description: '세탁기와 배수 배관이 설치되어 상시 습도가 높은 공간입니다. 벽면 모서리 오염 얼룩과 환기 창호 위치를 미리 점검합니다.',
    },
    {
      title: '보일러실 및 실외기 공간',
      subtitle: '배관 관통부 단차 및 설비 주변 보양 여건',
      description: '보일러 배관과 가스 계량기 주변 요철을 살펴보고, 도료 비산을 방지하기 위한 정밀 보양 작업 범위를 판단합니다.',
    },
  ],
  wallConditions: [
    {
      num: '01',
      title: '기존 페인트 들뜸 및 가루 날림',
      description: '벽면 페인트가 부풀어 오르거나 손으로 문질렀을 때 묻어나는 상태',
      detail: '들뜬 도막을 깨끗이 긁어내지 않고 도포하면 하자가 발생하므로, 현장 상태에 맞춘 스크래핑 및 바탕면 정돈 여부를 우선 확인합니다.',
    },
    {
      num: '02',
      title: '벽체 이음매 및 창틀 주변 균열',
      description: '콘크리트 이음새나 창호 모서리를 따라 실금이 길게 이어진 상태',
      detail: '균열의 진행 상태를 파악하여 도포 전 적절한 바탕면 메꿈재로 평탄하게 보수할 수 있는지 범위를 조율합니다.',
    },
    {
      num: '03',
      title: '벽체 모서리 거뭇한 오염 얼룩',
      description: '외벽과 맞닿은 구석 벽면에 거뭇한 습기 자국이 번진 상태',
      detail: '표면을 청결하게 닦아내고 벽면 건조 상태를 살펴본 후 적절한 밑작업 과정을 통해 도장면 안정성을 높입니다.',
    },
    {
      num: '04',
      title: '창문 하부 결로수 맺힘 자국',
      description: '창가 주변 벽체에 물기가 번지거나 축축한 얼룩 흔적이 남은 상태',
      detail: '도료가 벽면에 온전히 접착될 수 있도록 벽체의 수분 상태를 점검하고 충분히 건조된 시점에 작업을 진행합니다.',
    },
  ],
  scopeFactors: [
    {
      title: '기존 수성페인트 노후도 및 박리 상태',
      condition: '기존 페인트의 박리 범위가 넓고 벽면 부식이 복합된 경우',
      impact: '도포 전 들뜬 도막을 정리하고 바탕면을 고르는 밑작업에 필요한 시간과 준비 범위가 늘어납니다.',
    },
    {
      title: '창호 주변 실리콘 코킹 상태',
      condition: '창틀 코킹이 노후되어 들떠 있거나 벽체 실금이 다수 분포한 경우',
      impact: '도장면 접착력 유지와 평탄한 마감을 위해 틈새 메꿈 및 보수 작업이 사전에 병행되어야 합니다.',
    },
    {
      title: '작업 공간 내 대형 가전 및 짐 배치',
      condition: '세탁기, 건조기, 보일러 등 설비가 벽면에 밀착 배치된 환경',
      impact: '도료 비산 방지를 위한 비닐 커버링 보양 작업과 작업자의 시공 동선 확보 여부를 사전에 협의해야 합니다.',
    },
  ],
  consultationPreps: [
    {
      num: '01',
      title: '도봉구 현장 작업 공간 전경',
      description: '베란다나 세탁실의 바닥부터 천장, 창호 구조가 한눈에 보이도록 전체 전경 사진을 촬영해 주시면 도움이 됩니다.',
    },
    {
      num: '02',
      title: '벽면 하자 부위 근접 사진',
      description: '도막이 들뜬 곳이나 창틀 주변 균열, 모서리 얼룩 부위를 가까이에서 촬영해 주시면 필요한 보수 범위를 가늠할 수 있습니다.',
    },
    {
      num: '03',
      title: '설비 및 배관 위치 확인',
      description: '세탁기, 선반, 보일러 배관 등 벽면에 밀착된 시설물이 사진에 포함되면 보양 작업 계획을 세우는 데 참고가 됩니다.',
    },
    {
      num: '04',
      title: '상담 희망 지역 및 일정',
      description: '도봉구 내 대략적인 위치(쌍문동, 방학동, 창동, 도봉동 등)와 공실 여부(이사 전후 또는 거주 중), 희망 일정을 말씀해 주세요.',
    },
  ],
  processSteps: [
    {
      step: 'STEP 01',
      title: '현장 확인 및 정밀 보양',
      description: '창호, 유리, 바닥 타일, 배관 등 비도장 부위를 커버링 테이프로 감싸 도료가 묻지 않도록 보호합니다.',
    },
    {
      step: 'STEP 02',
      title: '바탕면 긁어내기 및 균열 정리',
      description: '들뜬 페인트를 긁어내고, 미세 균열 부위를 메우며 표면 오염을 닦아내는 기초 바탕면 정리 작업을 진행합니다.',
    },
    {
      step: 'STEP 03',
      title: '탄성코트 균일 도포',
      description: '전용 도장 장비를 활용하여 벽면과 천장에 적절한 두께와 질감으로 도료를 고르게 도포합니다.',
    },
    {
      step: 'STEP 04',
      title: '보양재 제거 및 마감 검수',
      description: '보양 테이프를 조심스럽게 제거한 뒤 도막 상태를 육안으로 확인하고 일상 환기 및 관리 요령을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '도봉구 지역은 방문 견적이나 시공 상담이 가능한가요?',
      answer: '도봉구를 포함한 서울 전역 시공 상담이 가능합니다. 현장 일정 조율 및 작업 조건 확인을 위해 전화 상담 시 필요한 사진과 전달 방법을 안내받으실 수 있습니다.',
    },
    {
      question: '거주 중인 세대인데 세탁실이나 베란다 시공이 가능한가요?',
      answer: '거주 중 시공 가능 여부는 작업 공간의 상태와 짐·시설물 배치 등을 확인한 후 안내받으실 수 있습니다. 도포 작업 특성상 작업 공간 내 물품 이동 및 보양 협의가 사전에 필요합니다.',
    },
    {
      question: '시공 후 도료 냄새는 어느 정도이며 건조에 얼마나 걸리나요?',
      answer: '수성 도료 특성상 자극적인 냄새는 적으나 건조 과정에서 특유의 도료취가 남을 수 있습니다. 건조 시간과 관리 방법은 사용 도료 및 온도·습도·환기 여건 등에 따라 달라지므로 구체적인 내용은 상담 시 확인이 필요합니다.',
    },
    {
      question: '탄성코트를 시공하면 결로와 누수를 완전히 해결할 수 있나요?',
      answer: '탄성코트는 벽면 마감을 위한 기능성 도장 작업입니다. 기존 누수나 외벽 크랙, 환기 부족 등 결로 발생의 근본적인 원인을 완전히 차단하는 것은 아니므로, 방수 점검과 주기적인 환기 관리가 병행되어야 합니다.',
    },
    {
      question: '도봉구 탄성코트 시공 상담 전에 무엇을 준비해야 하나요?',
      answer: '시공을 희망하는 베란다나 세탁실의 전체 전경 사진과 페인트 들뜸 등 문제 부위의 근접 사진을 준비해 주시면 전화 상담 시 필요한 작업 범위와 절차를 더욱 명확히 안내받으실 수 있습니다.',
    },
  ],
};

// 4. 중랑구 탄성코트 상세 콘텐츠 (STEP REGION-2 — 사실 기반, 미완성 더미 없는 정식 콘텐츠)
const JUNGNANG_ELASTIC_CONTENT: SeoPageContent = {
  targetSpaces: [
    {
      title: '베란다 및 발코니 공간',
      subtitle: '외부 온도 변화에 따른 창가 벽체 점검',
      description: '외부 기온 영향을 직접 받는 창호 하부와 외벽 접합부의 페인트 들뜸, 표면 분진 발생 여부를 확인합니다.',
    },
    {
      title: '세탁실 및 배수 다용도실',
      subtitle: '세탁기·배수관 주변 습기 정체 및 환기 상태 확인',
      description: '세탁 설비와 배수 배관이 위치하여 상시 습도가 머무는 구역입니다. 배관 관통 벽면과 구석 모서리의 오염 상태를 점검합니다.',
    },
    {
      title: '보일러실 및 설비 밀집 구역',
      subtitle: '배관 단차 및 시설물 주변 비산 방지 보양 점검',
      description: '보일러 연통, 가스 배관, 선반 거치대 주변의 벽면 상태를 확인하고 작업 시 도료 비산을 막기 위한 보양 여건을 파악합니다.',
    },
  ],
  wallConditions: [
    {
      num: '01',
      title: '도막 부풀림 및 박리 현상',
      description: '기존 벽면 페인트 도막이 들뜨거나 벗겨지는 상태',
      detail: '들뜬 도막을 방치하고 칠을 덧바르면 접착이 불량해지므로, 스크래퍼로 들뜬 부위를 깨끗이 긁어내고 면을 고르는 바탕면 정리가 우선됩니다.',
    },
    {
      num: '02',
      title: '벽체 및 창호 주변 미세 실금',
      description: '콘크리트 이음새나 창틀 모서리를 따라 균열이 생긴 상태',
      detail: '균열 틈새로 습기가 침투하지 않도록 균열 폭을 확인하고 적절한 메꿈재를 사용하여 평탄하게 다듬는 밑작업 범위를 조율합니다.',
    },
    {
      num: '03',
      title: '모서리 습기 흔적 및 곰팡이 오염',
      description: '외벽과 맞닿은 구석 벽체에 거뭇한 자국이 번진 상태',
      detail: '단순히 표면을 덮는 방식이 아닌, 오염 물질을 정돈하고 벽체 수분도를 점검한 뒤 도장면 안정성을 높이는 전처리를 거칩니다.',
    },
    {
      num: '04',
      title: '창가 결로수 축적 흔적',
      description: '창틀 하단 벽면이나 샤시 주변에 물방울 흘러내림 자국이 남은 상태',
      detail: '도료가 벽면에 온전히 안착될 수 있도록 작업 전 벽면이 충분히 건조되었는지 확인하고 작업 일정을 상의합니다.',
    },
  ],
  scopeFactors: [
    {
      title: '기존 도막의 노후도 및 들뜸 면적',
      condition: '기존 칠의 박리 면적이 넓거나 긁어내야 할 부위가 많은 경우',
      impact: '바탕면 정리와 스크래핑에 소요되는 시간과 작업 범위가 늘어나 공정 계획이 달라집니다.',
    },
    {
      title: '벽체 균열 보수 및 퍼티 메꿈 범위',
      condition: '창호 모서리 크랙이나 배관 주변 단차가 광범위한 경우',
      impact: '도장면의 균일한 질감과 접착력 유지를 위한 사전 평탄화 작업이 충분히 이루어져야 합니다.',
    },
    {
      title: '작업 공간 내 가전·설비 및 보양 난이도',
      condition: '세탁기, 건조기, 보일러 배관 등 설비가 벽면에 인접한 환경',
      impact: '도료 비산을 차단하기 위한 비닐 커버링 보양 작업과 작업자의 동선 확보 여부를 사전에 확인합니다.',
    },
  ],
  consultationPreps: [
    {
      num: '01',
      title: '중랑구 시공 희망 공간 전체 전경',
      description: '베란다, 세탁실 등 작업하고자 하는 공간의 바닥부터 천장까지 전체 구조가 한눈에 보이도록 촬영해 주시면 도움이 됩니다.',
    },
    {
      num: '02',
      title: '벽면 문제 부위 근접 사진',
      description: '페인트가 부풀었거나 창틀 주변 균열, 모서리 오염 얼룩이 있는 부위를 가까이에서 촬영해 주시면 필요한 보수 범위를 가늠할 수 있습니다.',
    },
    {
      num: '03',
      title: '설비 및 대형 가전 배치 상태',
      description: '세탁기, 건조기, 보일러, 선반 등 벽면에 밀착된 시설물의 위치가 보이도록 사진을 남겨주시면 보양 계획에 참고가 됩니다.',
    },
    {
      num: '04',
      title: '상담 희망 일정 및 거주 상태',
      description: '중랑구 내 대략적인 동 위치(면목동, 상봉동, 신내동 등)와 공실 여부(이사 전·인테리어 중 또는 거주 중), 희망하시는 시공 일정을 말씀해 주세요.',
    },
  ],
  processSteps: [
    {
      step: 'STEP 01',
      title: '현장 점검 및 정밀 보양',
      description: '창호, 바닥 타일, 배관, 계량기 등 비도장 구역을 전용 비닐 보양재로 감싸 도료 비산을 방지합니다.',
    },
    {
      step: 'STEP 02',
      title: '바탕면 정리 및 틈새 메꿈',
      description: '들뜬 기존 도막을 긁어내고, 미세 균열 부위를 메우며 표면 오염을 정돈하는 밑작업을 꼼꼼히 진행합니다.',
    },
    {
      step: 'STEP 03',
      title: '탄성코트 균일 도포',
      description: '전용 도장 장비를 활용하여 벽면과 천장에 적정한 두께와 질감으로 도료를 고르게 분사 도포합니다.',
    },
    {
      step: 'STEP 04',
      title: '보양재 제거 및 관리 요령 안내',
      description: '보양 라인을 깔끔하게 정리한 후 도막 형성 상태를 점검하고, 일상 환기 및 건조 주의사항을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '중랑구 지역은 방문 상담이나 시공 상담이 가능한가요?',
      answer: '중랑구를 포함한 서울 전 지역 방문 및 유선 시공 상담이 가능합니다. 현장 일정 조율과 작업 조건 확인을 위해 사진을 통한 1차 상담을 안내해 드립니다.',
    },
    {
      question: '거주 중인 상태에서도 탄성코트 시공이 가능한가요?',
      answer: '거주 중 시공은 현장의 짐 이동 여건과 작업 공간의 분리 가능 여부에 따라 결정됩니다. 세탁기나 선반 등 벽면에 인접한 물품 이동 및 보양 협의가 사전에 필요합니다.',
    },
    {
      question: '시공 후 건조 시간과 냄새는 어느 정도 지속되나요?',
      answer: '친환경 수성 계열 도료를 사용하여 유성 페인트 대비 냄새는 적으나 건조 중 고유의 도료취가 날 수 있습니다. 계절, 실내 온습도, 맞바람 환기 여건에 따라 표면 건조와 완전 경화에 수일이 소요될 수 있습니다.',
    },
    {
      question: '탄성코트를 시공하면 결로와 누수를 완전히 막을 수 있나요?',
      answer: '탄성코트는 베란다 내벽 마감을 위한 기능성 도장재로 결로 저감과 곰팡이 방지에 도움을 주지만, 외부 샷시 누수나 외벽 균열 등 근본적인 방수 문제를 대체하지는 못합니다. 원인 부위 점검과 주기적인 일상 환기가 함께 이루어져야 합니다.',
    },
    {
      question: '기존 벽면 페인트의 들뜸이 심하면 작업 범위가 달라지나요?',
      answer: '현장 점검을 통해 기존 도막의 들뜸 및 박리 범위를 확인하고 작업 범위를 산정합니다. 부풀어 오른 칠을 긁어내고 면을 고르는 바탕면 밑작업 공정에 따라 소요 시간과 준비 범위가 달라집니다.',
    },
  ],
};

// 5. 중랑구 베란다탄성코트 상세 콘텐츠 (STEP REGION-2 — 베란다 창호·보양·외부누수 구별 특화)
const JUNGNANG_BALCONY_ELASTIC_CONTENT: SeoPageContent = {
  targetSpaces: [
    {
      title: '거실 및 안방 전면 베란다',
      subtitle: '창호 프레임 주변 도막 및 직사광선 노출 구역 점검',
      description: '사계절 외부 기온 변화와 일조 영향을 직접 받는 발코니 구역으로, 샤시 접합부 실리콘 주변 도막의 부스러짐과 들뜸을 중점 점검합니다.',
    },
    {
      title: '주방 후면 베란다 및 보조 공간',
      subtitle: '외벽 모서리 환기 여건 및 습기 정체 확인',
      description: '환기창이 작거나 그늘진 외벽 벽체로, 외부 냉기와 내부 온기 차이로 인해 모서리에 습기 자국이나 얼룩이 생기기 쉬운 공간입니다.',
    },
    {
      title: '베란다 붙박이 창고 내부',
      subtitle: '밀폐형 수납공간의 벽면 통기성 및 상태 점검',
      description: '선반이 설치되어 있거나 문이 닫혀 공기 순환이 부족한 창고 내부 벽체의 도막 상태와 보양 필요 범위를 파악합니다.',
    },
  ],
  wallConditions: [
    {
      num: '01',
      title: '창호 샤시 하부 실리콘 및 도막 들뜸',
      description: '샤시 창틀과 콘크리트 경계부 페인트가 부풀거나 갈라진 상태',
      detail: '창틀 주변의 온도 차이와 실리콘 노후로 인해 들뜬 페인트를 긁어내고 깨끗하게 면을 정돈하는 밑작업 범위를 우선 확인합니다.',
    },
    {
      num: '02',
      title: '베란다 외벽 모서리 실금 및 균열',
      description: '외기에 맞닿은 벽체나 천장 코너부에 얇은 실금이 이어진 상태',
      detail: '벽체 미세 크랙 부위를 전용 보수재로 평탄하게 메워, 도포 후 도막이 갈라지거나 들뜨지 않도록 바탕면을 보강합니다.',
    },
    {
      num: '03',
      title: '외벽 결로 자국과 외부 누수 흔적 구분',
      description: '창가 벽면에 물방울이 맺힌 흔적이나 변색 얼룩이 나타난 상태',
      detail: '단순 실내 습기 결로인지, 아니면 외부 샤시 코킹 불량으로 인한 빗물 누수인지 현장 사진과 육안을 통해 점검합니다.',
    },
    {
      num: '04',
      title: '베란다 그늘진 구석 곰팡이 오염',
      description: '수납장 뒤편이나 바닥 모서리 부근에 거뭇한 얼룩이 생긴 상태',
      detail: '표면 오염물을 깨끗이 정돈하고, 벽면 내부 건조 상태를 확인한 후 기능성 도료의 부착력을 확보하기 위한 전처리를 거칩니다.',
    },
  ],
  scopeFactors: [
    {
      title: '베란다 창호 주변 실리콘 코킹 노후도',
      condition: '창틀 코킹이 갈라져 있거나 들뜬 부위가 넓은 경우',
      impact: '도막 접착력 유지와 깔끔한 라인 마감을 위해 창틀 주변 틈새 메꿈 및 보수 작업이 사전에 병행되어야 합니다.',
    },
    {
      title: '기존 발코니 도막의 박리 및 스크래핑 범위',
      condition: '외벽 쪽 기존 페인트가 부풀어 넓은 면적을 긁어내야 하는 경우',
      impact: '벽체 바탕면을 평탄화하고 면을 고르는 밑작업 공정이 늘어나 작업 준비 범위가 달라집니다.',
    },
    {
      title: '베란다 선반, 창호, 블라인드 보양 난이도',
      condition: '붙박이 선반, 빨래 건조대, 샤시 유리창 등 보호 시설물이 많은 환경',
      impact: '도료 입자가 튀지 않도록 꼼꼼한 마스킹 및 커버링 보양 작업이 필요하며, 작업자 이동 공간 확보를 협의합니다.',
    },
  ],
  consultationPreps: [
    {
      num: '01',
      title: '중랑구 베란다 공간 전체 구조 사진',
      description: '창호 위치와 천장, 바닥 구조가 한눈에 보이도록 베란다 양 끝에서 넓게 촬영해 주시면 큰 도움이 됩니다.',
    },
    {
      num: '02',
      title: '창호 실리콘 및 하부 도막 근접 사진',
      description: '샤시 틀 주변의 페인트 들뜸이나 실리콘 갈라짐, 모서리 얼룩 부위를 가까이에서 촬영해 주시면 보수 범위를 가늠할 수 있습니다.',
    },
    {
      num: '03',
      title: '선반 및 고정 시설물 배치 상태',
      description: '벽면에 고정된 수납 선반, 건조대, 창고 문짝 등의 위치가 보이도록 사진을 남겨주시면 보양 작업 준비에 유용합니다.',
    },
    {
      num: '04',
      title: '상담 희망 일정 및 거주 상태 안내',
      description: '중랑구 관내 대략적인 위치와 공실 여부(입주 전 또는 거주 중), 희망하시는 시공 일정을 말씀해 주세요.',
    },
  ],
  processSteps: [
    {
      step: 'STEP 01',
      title: '베란다 창호 및 시설물 비산 방지 보양',
      description: '샤시 유리, 손잡이, 타일 바닥, 선반 등 도장 구역 외 시설물을 커버링 테이프로 꼼꼼히 감싸 보호합니다.',
    },
    {
      step: 'STEP 02',
      title: '창틀 주변 바탕면 정리 및 크랙 보수',
      description: '들뜬 페인트를 긁어내고, 창호 주변 및 외벽 모서리의 미세 균열을 탄성 메꿈재로 평탄화합니다.',
    },
    {
      step: 'STEP 03',
      title: '베란다 전용 탄성 도료 정밀 분사',
      description: '벽면과 천장에 일정한 두께와 질감으로 도료를 균일하게 분사하여 고급스러운 엠보 질감 도막을 형성합니다.',
    },
    {
      step: 'STEP 04',
      title: '보양재 안전 제거 및 건조 환기 안내',
      description: '테이프 라인을 깔끔하게 떼어낸 뒤 도막 마감 상태를 최종 점검하고, 베란다 환기 요령과 양생 기간 주의사항을 안내합니다.',
    },
  ],
  faqs: [
    {
      question: '중랑구 아파트나 빌라 베란다 시공 상담이 가능한가요?',
      answer: '중랑구 전역의 아파트, 빌라, 다세대 주택 베란다 시공 상담이 가능합니다. 현장 구조와 창호 상태 확인을 위해 전화 상담 시 사진 전송 방법을 상세히 안내해 드립니다.',
    },
    {
      question: '창문 주변에 빗물이 스며드는 것 같은데 베란다탄성코트로 해결되나요?',
      answer: '외벽 균열이나 외부 창틀 실리콘 코킹 불량으로 인한 빗물 누수는 외부 방수 코킹 보수가 우선되어야 합니다. 탄성코트는 실내 벽면 마감재이므로 누수 원인을 해결한 뒤 충분히 건조된 상태에서 시공해야 합니다.',
    },
    {
      question: '베란다에 곰팡이가 피어 있는데 닦아내지 않고 바로 시공하나요?',
      answer: '오염된 벽면 위에 칠을 바로 올리지 않습니다. 바탕면의 들뜬 도막을 긁어내고 표면 오염부를 정돈한 뒤 벽체 건조 상태를 확인하고 도포 공정에 들어갑니다.',
    },
    {
      question: '베란다탄성코트 시공 후 건조와 일상 환기 관리는 어떻게 하나요?',
      answer: '시공 직후에는 창문을 살짝 열어 맞바람을 통한 통풍 건조가 필수적입니다. 날씨와 계절에 따라 표면 건조에 1~2일, 속 건조에 수일이 소요될 수 있으며 구체적인 관리 요령을 현장에서 안내합니다.',
    },
    {
      question: '베란다 선반이나 블라인드가 설치되어 있는데 철거해야 하나요?',
      answer: '벽면에 밀착된 시설물은 도포 마감 품질을 위해 탈거 후 시공하는 것이 이상적입니다. 탈거가 어려운 고정 시설물은 정밀 마스킹 보양으로 감싸 보호한 뒤 작업을 진행하므로 상담 시 시설물 사진을 확인합니다.',
    },
  ],
};

export const SEO_PAGES: SeoPageConfig[] = [];

for (const service of SERVICES) {
  for (const region of REGIONS) {
    const isNowonElastic = service.id === 'elastic-coating' && region.id === 'nowon';
    const isNowonBalconyElastic = service.id === 'balcony-elastic-coating' && region.id === 'nowon';
    const isDobongElastic = service.id === 'elastic-coating' && region.id === 'dobong';
    const isJungnangElastic = service.id === 'elastic-coating' && region.id === 'jungnang';
    const isJungnangBalconyElastic = service.id === 'balcony-elastic-coating' && region.id === 'jungnang';
    
    let content: SeoPageContent | undefined = undefined;
    let metaTitle = `${region.name} ${service.name} | 베란다·세탁실 - 올케어탄성`;
    let metaDescription = `${region.name} ${service.name} 시공 안내. 베란다 및 세탁실 벽면 상태를 먼저 확인하고 작업 범위를 안내합니다.`;
    let h1 = `${region.name} ${service.name} 시공 안내`;
    let heroCopy = `${region.name} 지역의 베란다와 세탁실 벽면 상태를 확인하고 필요한 작업 범위를 안내합니다.`;
    let contentStatus: ContentStatus = 'draft';

    if (isNowonElastic) {
      content = NOWON_ELASTIC_CONTENT;
      metaTitle = '노원구 탄성코트 시공 | AS보장 | 올케어탄성';
      metaDescription = '노원구 탄성코트 시공, 벽면 상태와 밑작업 과정이 궁금하신가요? 베란다·세탁실의 도막 들뜸과 균열을 살펴보고 보양, 바탕면 정리, 도포 및 마감 과정을 안내합니다.';
      h1 = '노원구 탄성코트 시공 안내';
      heroCopy = '노원구 아파트·주거 공간 베란다와 세탁실의 도막 들뜸, 균열, 습기 흔적을 확인하고 필요한 작업 범위를 정직하게 안내합니다.';
      contentStatus = 'approved'; // STEP 4-G-3C 운영자 최종 공개 승인
    } else if (isNowonBalconyElastic) {
      content = NOWON_BALCONY_ELASTIC_CONTENT;
      metaTitle = '노원구 베란다탄성코트 시공 | AS보장 | 올케어탄성';
      metaDescription = '노원구 베란다탄성코트 시공, 창호 주변 밑작업이 궁금하신가요? 들뜬 도막과 균열, 시설물 보양 상태를 확인하고 바탕면 정리부터 도포·마감까지 작업 순서를 안내합니다.';
      h1 = '노원구 베란다탄성코트 시공 안내';
      heroCopy = '노원구 베란다 공간의 창호 주변 도막 들뜸, 균열, 얼룩 흔적을 확인하고 필요한 시공 준비 사항을 정직하게 안내합니다.';
      contentStatus = 'approved'; // STEP 4-G-3C 운영자 최종 공개 승인
    } else if (isDobongElastic) {
      content = DOBONG_ELASTIC_CONTENT;
      metaTitle = '도봉구 탄성코트 시공 | AS보장 | 올케어탄성';
      metaDescription = '도봉구 탄성코트 시공 전, 어떤 부분을 확인해야 할까요? 베란다·세탁실의 기존 도막과 창호·배관 주변 상태를 살펴보고 시설물 보양부터 바탕면 정리, 시공 과정을 안내합니다.';
      h1 = '도봉구 탄성코트 시공 안내';
      heroCopy = '도봉구 주거 공간 베란다와 세탁실의 도막 들뜸, 균열, 습기 흔적을 확인하고 필요한 작업 범위와 준비 사항을 정직하게 안내합니다.';
      contentStatus = 'approved'; // STEP 4-G-3C 운영자 최종 공개 승인
    } else if (isJungnangElastic) {
      // STEP REGION-3: 중랑구 탄성코트 정식 승인 및 공개
      content = JUNGNANG_ELASTIC_CONTENT;
      metaTitle = '중랑구 탄성코트 시공 | AS보장 | 올케어탄성';
      metaDescription = '중랑구 탄성코트 시공 전, 어떤 부분을 확인해야 할까요? 베란다·세탁실의 기존 도막 들뜸과 벽체 균열을 점검하고 꼼꼼한 시설물 보양부터 바탕면 정리, 시공 과정을 안내합니다.';
      h1 = '중랑구 탄성코트 시공 안내';
      heroCopy = '중랑구 주거 공간 베란다와 세탁실의 도막 들뜸, 균열, 습기 흔적을 확인하고 필요한 작업 범위와 준비 사항을 정직하게 안내합니다.';
      contentStatus = 'approved'; // STEP REGION-3: 운영자 정식 승인 완료
    } else if (isJungnangBalconyElastic) {
      // STEP REGION-3: 중랑구 베란다탄성코트 정식 승인 및 공개
      content = JUNGNANG_BALCONY_ELASTIC_CONTENT;
      metaTitle = '중랑구 베란다탄성코트 시공 | AS보장 | 올케어탄성';
      metaDescription = '중랑구 베란다탄성코트 시공, 창호 주변 밑작업이 궁금하신가요? 베란다 외벽 창틀의 실리콘 들뜸과 벽체 균열을 점검하고 시설물 보양부터 도포·마감까지 시공 순서를 안내합니다.';
      h1 = '중랑구 베란다탄성코트 시공 안내';
      heroCopy = '중랑구 베란다 공간의 창호 주변 도막 들뜸, 균열, 외부 노출 흔적을 확인하고 필요한 시공 준비 사항을 정직하게 안내합니다.';
      contentStatus = 'approved'; // STEP REGION-3: 운영자 정식 승인 완료
    }

    const isApprovedPublished = isNowonElastic || isNowonBalconyElastic || isDobongElastic || isJungnangElastic || isJungnangBalconyElastic;

    SEO_PAGES.push({
      id: `${service.id}_${region.id}`,
      regionId: region.id,
      serviceId: service.id,
      serviceSlug: service.slug,
      districtSlug: region.slug,
      urlPath: `/seo/${service.slug}/${region.slug}.html`,
      isPublished: isApprovedPublished, // STEP REGION-3: 파일럿 3개 + 중랑구 2개 총 5개 정식 공개 (나머지 19개 false 유지)
      contentStatus,
      metaTitle,
      metaDescription,
      h1,
      heroCopy,
      serviceScopeNotice: `올케어탄성은 서울 ${region.name}를 포함하여 서울 전역 주거 공간을 대상으로 방문 시공 상담을 제공합니다.`,
      content,
      regionLevel: 'gu',
      ogImage: '/images/hero/hero-bg-default.jpg',
      ogImageAlt: '올케어탄성 실제 시공 현장 베란다 벽면 및 천장 마감',
      ogImageWidth: 1024,
      ogImageHeight: 768,
    });
  }
}

// 2. 신규 동 단위 22개 페이지 조합 등록 (초기 전원 Draft / 비공개 격리 보존)
for (const service of SERVICES) {
  for (const dong of DONGS) {
    SEO_PAGES.push({
      id: `${service.id}_${dong.parentRegionId}-${dong.id}`,
      regionId: dong.id,
      serviceId: service.id,
      serviceSlug: service.slug,
      districtSlug: dong.slug,
      urlPath: `/seo/${service.slug}/${dong.slug}.html`,
      isPublished: false, // STEP REGION-1: 전원 비공개
      contentStatus: 'draft', // STEP REGION-1: 전원 초안 상태
      metaTitle: `${dong.name} ${service.name} 시공 | AS보장 | 올케어탄성`,
      metaDescription: `${dong.name} ${service.name} 시공 안내. 베란다 및 세탁실 벽면 상태를 먼저 확인하고 필요한 작업 범위를 안내합니다.`,
      h1: `${dong.name} ${service.name} 시공 안내`,
      heroCopy: `${dong.displayName} 지역의 베란다와 세탁실 벽면 상태를 확인하고 필요한 작업 범위를 정직하게 안내합니다.`,
      serviceScopeNotice: `올케어탄성은 서울 ${dong.displayName}를 포함하여 서울 전역 주거 공간을 대상으로 방문 시공 상담을 제공합니다.`,
      content: undefined,
      regionLevel: 'dong',
      parentRegionId: dong.parentRegionId,
    });
  }
}

/**
 * P0 콘텐츠 완성도 및 필수 데이터 구조 검증 함수
 * 
 * [원칙]
 * 1. isPublished 또는 contentStatus만 조작하여 빈 페이지나 미완성 페이지가 공개되는 것을 원천 차단합니다.
 * 2. H1, Meta Title/Description, 5대 필수 본문 섹션, 그리고 FAQ 정확히 5개가 모두 충족되어야만 검증을 통과합니다.
 */
export function validateSeoPageContentCompleteness(page: SeoPageConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!page.id) errors.push('Page ID missing');
  if (!page.regionId) errors.push('Region ID missing');
  if (!page.serviceId) errors.push('Service ID missing');
  if (!page.h1 || page.h1.trim().length === 0) errors.push('H1 tag content missing');
  if (!page.metaTitle || page.metaTitle.trim().length === 0) errors.push('Meta title missing');
  if (!page.metaDescription || page.metaDescription.trim().length === 0) errors.push('Meta description missing');

  if (!page.content) {
    errors.push('Content object missing');
    return { valid: false, errors };
  }

  const { targetSpaces, wallConditions, scopeFactors, consultationPreps, processSteps, faqs } = page.content;

  if (!Array.isArray(targetSpaces) || targetSpaces.length === 0) errors.push('targetSpaces missing or empty');
  if (!Array.isArray(wallConditions) || wallConditions.length === 0) errors.push('wallConditions missing or empty');
  if (!Array.isArray(scopeFactors) || scopeFactors.length === 0) errors.push('scopeFactors missing or empty');
  if (!Array.isArray(consultationPreps) || consultationPreps.length === 0) errors.push('consultationPreps missing or empty');
  if (!Array.isArray(processSteps) || processSteps.length === 0) errors.push('processSteps missing or empty');
  if (!Array.isArray(faqs) || faqs.length !== 5) {
    errors.push(`faqs must contain exactly 5 items, got ${faqs ? faqs.length : 0}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 공개 상태 안전 판정 함수:
 * - 반드시 isPublished === true 이며,
 * - contentStatus === 'approved' (운영자 최종 검수 및 승인 완료)
 * - validateSeoPageContentCompleteness(page).valid === true (필수 콘텐츠 완전성 검증 완료)
 * 세 조건이 동시에 충족된 페이지만 정적 HTML 빌드 및 내부 링크 공개 대상으로 판정합니다.
 * 'draft' 및 검토 중인 'in_review' 페이지는 isPublished가 켜져 있어도 절대 공개되지 않습니다.
 * 또한 콘텐츠가 비어 있거나 FAQ가 누락된 불완전한 페이지는 승인 플래그가 켜져 있어도 공개가 원천 차단됩니다.
 */
export function isPagePublished(page: SeoPageConfig): boolean {
  if (page.isPublished !== true || page.contentStatus !== 'approved') {
    return false;
  }
  return validateSeoPageContentCompleteness(page).valid;
}

export function getPublishedSeoPages(): SeoPageConfig[] {
  return SEO_PAGES.filter(isPagePublished);
}

export function getSeoPage(serviceSlug: string, districtSlug: string): SeoPageConfig | undefined {
  return SEO_PAGES.find(
    (page) => page.serviceSlug === serviceSlug && page.districtSlug === districtSlug
  );
}

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getDongById(id: string): Dong | undefined {
  return DONGS.find((d) => d.id === id);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
