/**
 * 회사 마스터 데이터
 *
 * 모든 회사 정보를 중앙에서 관리합니다.
 * 크롤러, UI 컴포넌트, API에서 공통으로 사용됩니다.
 */

export interface Company {
  id: string
  name: string
  nameEn: string
  logo?: string | null
  website?: string
  color: string
  crawlerConfig?: {
    enabled: boolean
    url?: string
    schedule?: string
  }
}

export const COMPANIES: Company[] = [
  {
    id: 'naver',
    name: '네이버',
    nameEn: 'NAVER',
    logo: null,
    website: 'https://recruit.navercorp.com',
    color: 'bg-green-900/30 text-green-300 hover:bg-green-800/40 border-green-700',
    crawlerConfig: {
      enabled: true,
      url: 'https://recruit.navercorp.com/rcrt/list.do',
      schedule: '0 */12 * * *'
    }
  },
  {
    id: 'kakao',
    name: '카카오',
    nameEn: 'Kakao',
    logo: null,
    website: 'https://careers.kakao.com',
    color: 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-800/40 border-yellow-700',
    crawlerConfig: {
      enabled: true,
      url: 'https://careers.kakao.com/jobs',
      schedule: '0 */12 * * *'
    }
  },
  {
    id: 'line',
    name: '라인',
    nameEn: 'LINE',
    logo: null,
    website: 'https://careers.linecorp.com',
    color: 'bg-green-900/30 text-green-300 hover:bg-green-800/40 border-green-700',
    crawlerConfig: {
      enabled: true,
      url: 'https://careers.linecorp.com/ko/jobs',
      schedule: '0 */12 * * *'
    }
  },
  {
    id: 'coupang',
    name: '쿠팡',
    nameEn: 'Coupang',
    logo: null,
    website: 'https://www.coupang.jobs',
    color: 'bg-orange-900/30 text-orange-300 hover:bg-orange-800/40 border-orange-700',
    crawlerConfig: {
      enabled: false // 현재 크롤러 미구현
    }
  },
  {
    id: 'baemin',
    name: '배달의민족',
    nameEn: 'Woowa Brothers',
    logo: null,
    website: 'https://career.woowahan.com',
    color: 'bg-teal-900/30 text-teal-300 hover:bg-teal-800/40 border-teal-700',
    crawlerConfig: {
      enabled: true,
      url: 'https://career.woowahan.com/recruit',
      schedule: '0 */12 * * *'
    }
  },
  {
    id: 'toss',
    name: '토스',
    nameEn: 'Toss',
    logo: null,
    website: 'https://toss.im/career',
    color: 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/40 border-blue-700',
    crawlerConfig: {
      enabled: true,
      url: 'https://toss.im/career/jobs',
      schedule: '0 */12 * * *'
    }
  },
  {
    id: 'carrot',
    name: '당근마켓',
    nameEn: 'Karrot',
    logo: null,
    website: 'https://about.daangn.com/jobs',
    color: 'bg-orange-900/30 text-orange-300 hover:bg-orange-800/40 border-orange-700',
    crawlerConfig: {
      enabled: false // 현재 크롤러 미구현
    }
  },
  {
    id: 'krafton',
    name: '크래프톤',
    nameEn: 'KRAFTON',
    logo: null,
    website: 'https://www.krafton.com/careers',
    color: 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 border-purple-700',
    crawlerConfig: {
      enabled: false // 현재 크롤러 미구현
    }
  },
  {
    id: 'nexon',
    name: '넥슨',
    nameEn: 'NEXON',
    logo: null,
    website: 'https://careers.nexon.com',
    color: 'bg-red-900/30 text-red-300 hover:bg-red-800/40 border-red-700',
    crawlerConfig: {
      enabled: true,
      url: 'https://careers.nexon.com/common/job/list',
      schedule: '0 */12 * * *'
    }
  },
  {
    id: 'zigbang',
    name: '직방',
    nameEn: 'Zigbang',
    logo: null,
    website: 'https://www.zigbang.com/careers',
    color: 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/40 border-indigo-700',
    crawlerConfig: {
      enabled: false // 현재 크롤러 미구현
    }
  },
  {
    id: 'bucketplace',
    name: '오늘의집',
    nameEn: 'Bucketplace',
    logo: null,
    website: 'https://www.bucketplace.com/careers',
    color: 'bg-pink-900/30 text-pink-300 hover:bg-pink-800/40 border-pink-700',
    crawlerConfig: {
      enabled: false // 현재 크롤러 미구현
    }
  }
]

// 유틸리티 함수들

/**
 * 회사 ID로 회사 정보 조회
 */
export function getCompanyById(id: string): Company | undefined {
  return COMPANIES.find(c => c.id === id)
}

/**
 * 회사 이름으로 회사 정보 조회
 */
export function getCompanyByName(name: string): Company | undefined {
  return COMPANIES.find(c => c.name === name || c.nameEn === name)
}

/**
 * 회사 표시 이름 가져오기 (한글 이름 우선)
 */
export function getCompanyDisplayName(id: string): string {
  const company = getCompanyById(id)
  return company?.name || id
}

/**
 * 회사 색상 가져오기
 */
export function getCompanyColor(id: string): string {
  const company = getCompanyById(id)
  return company?.color || 'bg-gray-900/30 text-gray-300 hover:bg-gray-800/40 border-gray-700'
}

/**
 * 크롤링이 활성화된 회사 목록
 */
export function getEnabledCrawlers(): Company[] {
  return COMPANIES.filter(c => c.crawlerConfig?.enabled === true)
}

/**
 * 회사 ID 목록
 */
export function getAllCompanyIds(): string[] {
  return COMPANIES.map(c => c.id)
}

/**
 * 회사 이름 매핑 (DB 이름 -> 표시 이름)
 */
export const COMPANY_NAME_MAP: Record<string, string> = COMPANIES.reduce((acc, company) => {
  acc[company.id] = company.name
  acc[company.name] = company.name
  acc[company.nameEn] = company.name
  return acc
}, {} as Record<string, string>)

/**
 * 크롤러용 회사 정보 (DB 저장용)
 */
export function getCrawlerCompanyInfo(companyId: string): { nameEn: string; logo: string | null } | null {
  const company = getCompanyById(companyId)
  if (!company) return null

  return {
    nameEn: company.nameEn,
    logo: company.logo || null
  }
}
