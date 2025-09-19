// 간단한 테스트용 크롤러
const companies = {
  naver: {
    name: 'naver',
    nameEn: 'NAVER Corporation',
    website: 'https://www.navercorp.com',
    careerUrl: 'https://recruit.navercorp.com'
  },
  kakao: {
    name: 'kakao',
    nameEn: 'Kakao Corporation',
    website: 'https://www.kakaocorp.com',
    careerUrl: 'https://careers.kakao.com/jobs'
  },
  line: {
    name: 'line',
    nameEn: 'LINE Corporation',
    website: 'https://linecorp.com',
    careerUrl: 'https://careers.linecorp.com/ko'
  },
  coupang: {
    name: 'coupang',
    nameEn: 'Coupang Corporation',
    website: 'https://www.coupang.com',
    careerUrl: 'https://www.coupang.jobs/kr'
  },
  baemin: {
    name: 'baemin',
    nameEn: 'Woowa Brothers',
    website: 'https://www.woowahan.com',
    careerUrl: 'https://career.woowahan.com'
  },
  nexon: {
    name: 'nexon',
    nameEn: 'NEXON Korea Corporation',
    website: 'https://www.nexon.com',
    careerUrl: 'https://careers.nexon.com'
  }
}

const jobTypes = [
  '프론트엔드 개발자',
  '백엔드 개발자',
  '풀스택 개발자',
  '안드로이드 개발자',
  'iOS 개발자',
  'DevOps 엔지니어',
  'AI/ML 엔지니어',
  'Data Engineer'
]

const locations = ['서울 강남구', '서울 서초구', '경기 성남시 분당구', '서울 송파구']
const experiences = ['신입', '경력 1-3년', '경력 3-5년', '경력 5년 이상']

class SimpleCrawler {
  async crawlAll() {
    console.log('간단한 크롤러로 샘플 채용공고 생성 중...')
    const results = []

    for (const [key, company] of Object.entries(companies)) {
      const jobs = this.generateJobsForCompany(company)
      results.push({ company: key, jobs, count: jobs.length })
    }

    return results
  }

  generateJobsForCompany(company) {
    const jobs = []
    const numJobs = Math.floor(Math.random() * 5) + 3 // 3-7개 공고 생성

    for (let i = 0; i < numJobs; i++) {
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const experience = experiences[Math.floor(Math.random() * experiences.length)]

      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 30 + Math.floor(Math.random() * 30))

      jobs.push({
        title: `${jobType} (${experience})`,
        description: `${company.nameEn}에서 ${jobType}를 모집합니다.\n\n주요 업무:\n• 웹/앱 서비스 개발 및 운영\n• 신기술 도입 및 시스템 개선\n• 팀 협업 및 코드 리뷰\n\n자격 요건:\n• 관련 기술 스택 경험\n• 협업 능력 및 소통 능력\n• 새로운 기술에 대한 학습 의지`,
        company: company.name,
        companyNameEn: company.nameEn,
        companyWebsite: company.website,
        location,
        department: '개발팀',
        jobType: '정규직',
        experience,
        salary: '',
        originalUrl: company.careerUrl,
        deadline: deadline.toISOString()
      })
    }

    return jobs
  }
}

module.exports = SimpleCrawler