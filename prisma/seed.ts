import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 데이터베이스 시드 데이터 생성 중...')

  // 회사 데이터 생성
  const companies = [
    {
      name: 'naver',
      nameEn: 'NAVER Corporation',
      website: 'https://www.navercorp.com',
    },
    {
      name: 'kakao',
      nameEn: 'Kakao Corporation',
      website: 'https://www.kakaocorp.com',
    },
    {
      name: 'line',
      nameEn: 'LINE Corporation',
      website: 'https://linecorp.com',
    },
    {
      name: 'coupang',
      nameEn: 'Coupang Corporation',
      website: 'https://www.coupang.com',
    },
    {
      name: 'baemin',
      nameEn: 'Woowa Brothers',
      website: 'https://www.woowahan.com',
    },
  ]

  for (const companyData of companies) {
    await prisma.company.upsert({
      where: { name: companyData.name },
      update: {},
      create: companyData,
    })
    console.log(`✅ 회사 생성/업데이트: ${companyData.nameEn}`)
  }

  // 기술 태그 데이터 생성
  const tags = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'React',
    'Vue.js',
    'Node.js',
    'Spring',
    'Django',
    'Frontend',
    'Backend',
    'Full Stack',
    'DevOps',
    'Data Engineer',
    'Machine Learning',
    'Mobile',
    'iOS',
    'Android',
    'Cloud',
    'AWS',
    'Kubernetes',
    'Docker',
    'Microservices',
    'API',
    'Database',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'GraphQL',
    'REST API',
  ]

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
  }
  console.log(`✅ ${tags.length}개 태그 생성 완료`)

  // 빅테크 회사 채용공고 데이터 생성
  const allCompanies = await prisma.company.findMany()
  
  const jobsData = [
    // 네이버 채용공고
    {
      company: 'naver',
      title: '프론트엔드 엔지니어 (네이버 서비스)',
      description: `🌐 네이버 서비스의 프론트엔드를 책임질 엔지니어를 찾습니다!

주요 업무:
• 네이버 메인 서비스 프론트엔드 개발 및 운영
• React, Vue.js 기반 SPA(Single Page Application) 구축
• 사용자 중심의 UI/UX 구현 및 개선
• 웹 성능 최적화 및 웹 접근성 개선
• 신규 서비스 기획부터 런칭까지 전 과정 참여

자격 요건:
• JavaScript, TypeScript 숙련도 우수
• React 또는 Vue.js 프레임워크 활용 경험
• HTML5, CSS3, ES6+ 기술에 대한 이해
• 웹 표준 및 크로스브라우징에 대한 이해

혜택:
• 글로벌 서비스 개발 경험 기회
• 최신 기술 스택 도입 및 학습 지원
• 자유로운 개발 환경과 수평적 조직 문화`,
      location: '경기 성남시 분당구',
      department: '프론트엔드개발팀',
      experience: '경력 3년 이상',
      tags: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'Frontend'],
      originalUrl: 'https://recruit.navercorp.com/?jobId=NAVER_1755735372804_1'
    },
    {
      company: 'naver',
      title: '백엔드 엔지니어 (서비스 플랫폼)',
      description: `⚡ 네이버 서비스 플랫폼의 백엔드 엔지니어를 모집합니다!

주요 업무:
• 대규모 웹 서비스 백엔드 시스템 설계 및 개발
• 마이크로서비스 아키텍처 설계 및 구현
• RESTful API 및 GraphQL API 설계 및 개발
• 데이터베이스 설계 및 성능 최적화
• 클라우드 인프라 운영 및 관리 (AWS, Kubernetes)

자격 요건:
• Java, Python, Go 중 하나 이상 숙련
• Spring Boot, Django 등 백엔드 프레임워크 경험
• RDBMS(MySQL, PostgreSQL) 및 NoSQL 데이터베이스 활용 경험
• 대용량 트래픽 처리 및 성능 최적화 경험`,
      location: '경기 성남시 분당구',
      department: '백엔드개발팀',
      experience: '경력 3년 이상',
      tags: ['Java', 'Python', 'Spring', 'Backend', 'API', 'Database'],
      originalUrl: 'https://recruit.navercorp.com/?jobId=NAVER_1755735372808_2'
    },
    {
      company: 'naver',
      title: 'AI/ML Engineer (네이버 AI LAB)',
      description: `🧠 네이버 AI LAB에서 최첨단 AI 기술을 연구할 엔지니어를 모집합니다!

주요 업무:
• 자연어처리, 컴퓨터비전 모델 연구 개발
• 대규모 AI 모델 학습 및 최적화
• AI 서비스 프로토타입 개발 및 상용화
• 논문 작성 및 국제 학회 발표

자격 요건:
• 머신러닝/딥러닝 전문 지식 및 이론 이해
• Python, TensorFlow/PyTorch 숙련한 활용 경험
• 논문 리딩 및 알고리즘 구현 능력`,
      location: '경기 성남시 분당구',
      department: 'AI개발팀',
      experience: '경력 3년 이상',
      tags: ['Python', 'Machine Learning', 'AI', 'Deep Learning'],
      originalUrl: 'https://recruit.navercorp.com/?jobId=NAVER_1755735372810_4'
    },
    // 카카오 채용공고
    {
      company: 'kakao',
      title: 'AI 풀스택 개발자 (카카오브레인)',
      description: `🤖 카카오브레인에서 AI 풀스택 개발자를 모집합니다!

주요 업무:
• AI 모델 서빙을 위한 백엔드 시스템 개발
• AI 서비스 프론트엔드 개발 및 UI/UX 구현
• MLOps 파이프라인 구축 및 운영
• AI 모델과 서비스 연동 개발
• 대화형 AI 서비스 개발 (ChatGPT 경쟁 서비스)

자격 요건:
• Python, JavaScript/TypeScript 숙련
• React, Vue.js 등 프론트엔드 프레임워크 경험
• FastAPI, Django 등 백엔드 프레임워크 경험
• AI/ML 모델 이해 및 활용 경험`,
      location: '경기 성남시 분당구',
      department: 'AI개발팀',
      experience: '경력 3년 이상',
      tags: ['Python', 'React', 'AI', 'Machine Learning', 'Full Stack'],
      originalUrl: 'https://careers.kakao.com/jobs/P-14191'
    },
    {
      company: 'kakao',
      title: 'MLOps Engineer (카카오브레인)',
      description: `⚙️ 카카오브레인 MLOps Engineer를 모집합니다!

주요 업무:
• ML 모델 배포 및 서빙 인프라 구축
• 모델 학습 파이프라인 자동화 시스템 개발
• AI 모델 성능 모니터링 및 A/B 테스트 환경 구축
• GPU 클러스터 관리 및 자원 최적화

자격 요건:
• Python, Docker, Kubernetes 활용 경험 3년 이상
• ML 모델 배포 및 서빙 경험
• CI/CD 파이프라인 구축 경험`,
      location: '경기 성남시 분당구',
      department: 'AI개발팀',
      experience: '경력 3년 이상',
      tags: ['Python', 'Docker', 'Kubernetes', 'DevOps', 'Machine Learning'],
      originalUrl: 'https://careers.kakao.com/jobs/P-14039'
    },
    // 라인 채용공고
    {
      company: 'line',
      title: 'LINE Ads Server Engineer',
      description: `💰 LINE 광고 플랫폼의 서버 엔지니어를 모집합니다!

주요 업무:
• LINE 광고 플랫폼 백엔드 시스템 설계 및 개발
• 대용량 광고 데이터 처리 시스템 구축
• 광고 집행 및 성과 측정 API 개발
• 실시간 광고 입찰 시스템 개발 및 최적화

자격 요건:
• Java, Spring Framework 개발 경험 3년 이상
• RESTful API 설계 및 개발 경험
• 대용량 데이터 처리 및 성능 최적화 경험
• RDBMS(MySQL, PostgreSQL) 활용 경험`,
      location: '서울 강남구',
      department: '백엔드개발팀',
      experience: '경력 3년 이상',
      tags: ['Java', 'Spring', 'Backend', 'API', 'Database'],
      originalUrl: 'https://careers.linecorp.com/ko/jobs/2779'
    },
    {
      company: 'line',
      title: 'Search Engineer',
      description: `🔍 LINE의 검색 서비스를 책임질 엔지니어를 모집합니다!

주요 업무:
• LINE 앱 내 통합 검색 서비스 개발
• 검색 알고리즘 최적화 및 성능 개선
• 대용량 검색 인덱스 관리 및 운영
• 사용자 행동 분석을 통한 검색 품질 향상

자격 요건:
• Java, Python 등 서버 개발 경험 3년 이상
• Elasticsearch, Solr 등 검색엔진 경험
• 대용량 데이터 처리 및 성능 최적화 경험`,
      location: '서울 강남구',
      department: '개발팀',
      experience: '경력 3년 이상',
      tags: ['Java', 'Python', 'Search', 'Backend'],
      originalUrl: 'https://careers.linecorp.com/ko/jobs/2370'
    },
    // 쿠팡 채용공고
    {
      company: 'coupang',
      title: 'Software Engineer (Platform)',
      description: `🚀 쿠팡에서 함께 성장할 Software Engineer를 찾습니다!

주요 업무:
• 대규모 이커머스 플랫폼 개발 및 운영
• 마이크로서비스 아키텍처 설계 및 구현
• 클라우드 네이티브 애플리케이션 개발
• 성능 최적화 및 확장성 개선

자격 요건:
• Java, Python, Go 등 프로그래밍 언어 경험
• 분산 시스템 및 마이크로서비스 아키텍처 이해
• AWS 클라우드 환경에서의 개발 및 운영 경험`,
      location: '서울 송파구',
      department: '개발팀',
      experience: '경력 5년 이상',
      tags: ['Java', 'Python', 'AWS', 'Cloud', 'Microservices'],
      originalUrl: 'https://about.coupang.com/?jobId=COUPANG_1755735372814_1'
    },
    {
      company: 'coupang',
      title: 'Staff Software Engineer (Global)',
      description: `🌏 쿠팡 글로벌 서비스의 Staff Software Engineer를 모집합니다!

주요 업무:
• 글로벌 확장을 위한 시스템 아키텍처 설계
• 다국가 서비스 인프라 구축 및 운영
• 시니어 엔지니어로서 기술 리딩 및 멘토링
• 신기술 도입 및 아키텍처 의사결정

자격 요건:
• 8년 이상의 소프트웨어 개발 경험
• 대규모 분산 시스템 설계 경험
• Java, Python, Go 등 다양한 프로그래밍 언어 전문성`,
      location: '서울 송파구',
      department: '시니어개발팀',
      experience: '경력 5년 이상',
      tags: ['Java', 'Python', 'Architecture', 'Leadership'],
      originalUrl: 'https://www.linkedin.com/company/coupang/?jobId=COUPANG_1755735372815_2'
    },
    // 배민 채용공고
    {
      company: 'baemin',
      title: '검색 플랫폼 서버 개발자',
      description: `🔍 배달의민족 검색 플랫폼 서버 개발자를 모집합니다!

주요 업무:
• 배달의민족 통합 검색 시스템 개발 및 운영
• Elasticsearch 기반 검색 엔진 최적화
• 검색 랭킹 알고리즘 개발 및 개선
• 대용량 검색 데이터 처리 및 인덱싱

자격 요건:
• Java, Spring Boot 프레임워크 숙련
• Elasticsearch, Solr 등 검색 엔진 경험
• 대용량 데이터 처리 및 성능 최적화 경험`,
      location: '서울 서초구',
      department: '검색플랫폼팀',
      experience: '경력 4년 이상',
      tags: ['Java', 'Spring', 'Search', 'Backend'],
      originalUrl: 'https://career.woowahan.com/recruitment/R2507015/detail'
    },
    {
      company: 'baemin',
      title: 'iOS 개발자 (푸드 서비스)',
      description: `📱 배달의민족 iOS 앱 개발자를 모집합니다!

주요 업무:
• 배달의민족 iOS 앱 개발 및 유지보수
• 사용자 경험 개선을 위한 UI/UX 구현
• 푸드서비스 관련 신규 기능 개발
• 앱 성능 최적화 및 안정성 향상

자격 요건:
• Swift, Objective-C 기반 iOS 앱 개발 경험 3년 이상
• iOS SDK 및 프레임워크 이해
• Auto Layout 및 반응형 UI 구현 경험`,
      location: '서울 서초구',
      department: '푸드서비스앱개발팀',
      experience: '경력 3년 이상',
      tags: ['iOS', 'Swift', 'Mobile', 'UI/UX'],
      originalUrl: 'https://career.woowahan.com/recruitment/R2505012/detail'
    },
    {
      company: 'baemin',
      title: 'AI Engineer (배달의민족)',
      description: `🤖 배민 AI 서비스를 개발할 엔지니어를 모집합니다!

주요 업무:
• 배달 예측 모델 및 추천 시스템 개발
• 머신러닝 모델 설계 및 구현
• 대용량 데이터 분석 및 모델링
• AI 서비스 프로덕션 배포 및 운영

자격 요건:
• Python, TensorFlow/PyTorch 활용 경험
• 머신러닝/딥러닝 모델 개발 경험
• 대용량 데이터 처리 및 분석 경험`,
      location: '서울 서초구',
      department: 'AI실',
      experience: '경력 5년 이상',
      tags: ['Python', 'Machine Learning', 'AI', 'Data Engineer'],
      originalUrl: 'https://career.woowahan.com/recruitment/R2506002/detail'
    }
  ]

  for (const jobData of jobsData) {
    const company = allCompanies.find(c => c.name === jobData.company)
    if (!company) continue

    const job = await prisma.job.upsert({
      where: { originalUrl: jobData.originalUrl },
      update: {},
      create: {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        department: jobData.department,
        jobType: '정규직',
        experience: jobData.experience,
        salary: '회사내규에 따름',
        originalUrl: jobData.originalUrl,
        postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 최근 7일 내 랜덤
        companyId: company.id,
      },
    })

    // 태그 연결
    for (const tagName of jobData.tags) {
      const tag = await prisma.tag.findUnique({ where: { name: tagName } })
      if (tag) {
        await prisma.jobTag.upsert({
          where: {
            jobId_tagId: {
              jobId: job.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            jobId: job.id,
            tagId: tag.id,
          },
        })
      }
    }
  }

  console.log(`✅ ${jobsData.length}개 빅테크 채용공고 생성 완료`)

  // 사용자 데이터 생성
  const users = [
    {
      id: 'clq8e5z1x0000y6o8g7h3j9k2',
      username: 'kimdeveloper',
      nickname: '김개발자',
      avatar: '/avatars/avatar1.png',
    },
    {
      id: 'clq8e6a2y0001y6o8h4f5k1l3',
      username: 'leepark',
      nickname: '이파크',
      avatar: '/avatars/avatar2.png',
    },
    {
      id: 'clq8e6b3z0002y6o8j6g7m2n4',
      username: 'choi_engineer',
      nickname: '최엔지',
      avatar: '/avatars/avatar3.png',
    },
    {
      id: 'clq8e6c4a0003y6o8k8h9n3o5',
      username: 'parkfrontend',
      nickname: '박프론트',
      avatar: '/avatars/avatar4.png',
    },
  ]

  for (const userData of users) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: userData,
    })
    console.log(`✅ 사용자 생성/업데이트: ${userData.nickname}`)
  }

  console.log('🎉 시드 데이터 생성 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })