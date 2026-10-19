export interface Region {
  id: string;
  name: string;
  slug: string;
  administrativeType: 'autonomous_district' | 'gu';
  displayName: string;
  order: number;
}

export const REGIONS: Region[] = [
  {
    id: 'nowon',
    name: '노원구',
    slug: 'seoul-nowon-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 노원구',
    order: 1,
  },
  {
    id: 'dobong',
    name: '도봉구',
    slug: 'seoul-dobong-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 도봉구',
    order: 2,
  },
  {
    id: 'gangbuk',
    name: '강북구',
    slug: 'seoul-gangbuk-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 강북구',
    order: 3,
  },
  {
    id: 'seongbuk',
    name: '성북구',
    slug: 'seoul-seongbuk-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 성북구',
    order: 4,
  },
  {
    id: 'dongdaemun',
    name: '동대문구',
    slug: 'seoul-dongdaemun-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 동대문구',
    order: 5,
  },
  {
    id: 'jungnang',
    name: '중랑구',
    slug: 'seoul-jungnang-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 중랑구',
    order: 6,
  },
  {
    id: 'eunpyeong',
    name: '은평구',
    slug: 'seoul-eunpyeong-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 은평구',
    order: 7,
  },
  {
    id: 'seodaemun',
    name: '서대문구',
    slug: 'seoul-seodaemun-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 서대문구',
    order: 8,
  },
  {
    id: 'mapo',
    name: '마포구',
    slug: 'seoul-mapo-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 마포구',
    order: 9,
  },
  {
    id: 'jongno',
    name: '종로구',
    slug: 'seoul-jongno-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 종로구',
    order: 10,
  },
  {
    id: 'jung',
    name: '중구',
    slug: 'seoul-jung-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 중구',
    order: 11,
  },
  {
    id: 'yongsan',
    name: '용산구',
    slug: 'seoul-yongsan-gu',
    administrativeType: 'autonomous_district',
    displayName: '서울 용산구',
    order: 12,
  },
];
