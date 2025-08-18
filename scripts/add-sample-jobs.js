const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleJobs() {
  console.log('📝 샘플 채용공고 추가 중...')

  try {
    // 회사 정보 가져오기
    const companies = await prisma.company.findMany()
    const companyMap = {}
    companies.forEach(company => {
      companyMap[company.name] = company.id
    })

    // 샘플 채용공고 데이터
    const sampleJobs = [
      {
        title: '[카카오] 백엔드 개발자 (Spring)',
        description: 'Spring Boot, JPA를 활용한 백엔드 API 개발',
        location: '경기 성남시 분당구',
        department: '서비스개발팀',
        jobType: '정규직',
        experience: '경력 2년 이상',
        salary: '연봉 4000만원~6000만원',
        originalUrl: 'https://careers.kakao.com/sample/job/2',
        companyId: companyMap['kakao']
      },
      {
        title: '[라인] 모바일 앱 개발자 (iOS)',
        description: 'Swift, SwiftUI를 활용한 iOS 앱 개발',
        location: '서울 강남구',
        department: '모바일개발팀',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '회사내규에 따름',
        originalUrl: 'https://careers.linecorp.com/sample/job/3',
        companyId: companyMap['line']
      },
      {
        title: '[쿠팡] 데이터 엔지니어',
        description: 'Python, Spark를 활용한 빅데이터 처리',
        location: '서울 송파구',
        department: '데이터팀',
        jobType: '정규직',
        experience: '경력 4년 이상',
        salary: '연봉 5000만원~8000만원',
        originalUrl: 'https://www.coupang.jobs/sample/job/4',
        companyId: companyMap['coupang']
      },
      {
        title: '[배달의민족] DevOps 엔지니어',
        description: 'Kubernetes, AWS를 활용한 인프라 운영',
        location: '서울 서초구',
        department: '인프라팀',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '연봉 4500만원~7000만원',
        originalUrl: 'https://www.woowahan.com/sample/job/5',
        companyId: companyMap['baemin']
      },
      {
        title: '[네이버] 머신러닝 엔지니어',
        description: 'Python, TensorFlow를 활용한 AI 모델 개발',
        location: '경기 성남시 분당구',
        department: 'AI Lab',
        jobType: '정규직',
        experience: '경력 5년 이상',
        salary: '연봉 6000만원~9000만원',
        originalUrl: 'https://recruit.navercorp.com/sample/job/6',
        companyId: companyMap['naver']
      }
    ]

    // 채용공고 생성
    for (const jobData of sampleJobs) {
      const existingJob = await prisma.job.findUnique({
        where: { originalUrl: jobData.originalUrl }
      })

      if (!existingJob) {
        await prisma.job.create({
          data: {
            ...jobData,
            postedAt: new Date()
          }
        })
        console.log(`✅ 생성: ${jobData.title}`)
      } else {
        console.log(`⏭️  이미 존재: ${jobData.title}`)
      }
    }

    // 태그 연결
    console.log('\n🏷️  태그 연결 중...')
    
    const tagMappings = [
      { jobTitle: '[카카오] 백엔드 개발자 (Spring)', tags: ['Java', 'Spring', 'Backend', 'API'] },
      { jobTitle: '[라인] 모바일 앱 개발자 (iOS)', tags: ['iOS', 'Mobile', 'Swift'] },
      { jobTitle: '[쿠팡] 데이터 엔지니어', tags: ['Python', 'Data Engineer', 'Database'] },
      { jobTitle: '[배달의민족] DevOps 엔지니어', tags: ['DevOps', 'AWS', 'Cloud', 'Kubernetes'] },
      { jobTitle: '[네이버] 머신러닝 엔지니어', tags: ['Python', 'Machine Learning', 'AI'] }
    ]

    for (const mapping of tagMappings) {
      const job = await prisma.job.findFirst({
        where: { title: mapping.jobTitle }
      })

      if (job) {
        for (const tagName of mapping.tags) {
          const tag = await prisma.tag.findUnique({
            where: { name: tagName }
          })

          if (tag) {
            await prisma.jobTag.upsert({
              where: {
                jobId_tagId: {
                  jobId: job.id,
                  tagId: tag.id
                }
              },
              update: {},
              create: {
                jobId: job.id,
                tagId: tag.id
              }
            })
          }
        }
        console.log(`🏷️  ${mapping.jobTitle}: ${mapping.tags.join(', ')}`)
      }
    }

    // 최종 통계
    const totalJobs = await prisma.job.count()
    const activeJobs = await prisma.job.count({ where: { isActive: true } })
    
    console.log('\n📊 최종 통계:')
    console.log(`   전체 채용공고: ${totalJobs}개`)
    console.log(`   활성 채용공고: ${activeJobs}개`)

    console.log('\n🎉 샘플 데이터 추가 완료!')

  } catch (error) {
    console.error('❌ 샘플 데이터 추가 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleJobs()