export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    id: 'elastic-coating',
    name: '탄성코트',
    slug: 'elastic-coating',
    description: '베란다와 세탁실 벽면의 곰팡이 방지 및 도막 결로 보수를 위한 탄성코트 시공',
  },
  {
    id: 'balcony-elastic-coating',
    name: '베란다탄성코트',
    slug: 'balcony-elastic-coating',
    description: '노후된 베란다·발코니 공간 도막 정돈 및 내구성 강화를 위한 베란다 탄성코트 시공',
  },
];
