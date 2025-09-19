const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixEncoding() {
  console.log('🔧 인코딩 문제 해결 시작...')

  try {
    // 모든 기존 Job 삭제
    await prisma.job.deleteMany({})
    console.log('✅ 기존 채용공고 모두 삭제')

    // 샘플 채용공고 데이터
    const companies = await prisma.company.findMany()

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

    let createdCount = 0

    for (const company of companies) {
      const numJobs = Math.floor(Math.random() * 3) + 5 // 5-7개 채용공고

      for (let i = 0; i < numJobs; i++) {
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]
        const experience = experiences[Math.floor(Math.random() * experiences.length)]

        const deadline = new Date()
        deadline.setDate(deadline.getDate() + 30 + Math.floor(Math.random() * 30))

        try {
          await prisma.job.create({
            data: {
              title: `${jobType} (${experience})`,
              description: `${company.nameEn}에서 ${jobType}를 모집합니다.\n\n주요 업무:\n• 웹/앱 서비스 개발 및 운영\n• 신기술 도입 및 시스템 개선\n• 팀 협업 및 코드 리뷰\n\n자격 요건:\n• 관련 기술 스택 경험\n• 협업 능력 및 소통 능력\n• 새로운 기술에 대한 학습 의지`,
              location,
              department: '개발팀',
              jobType: '정규직',
              experience,
              salary: '',
              originalUrl: `https://${company.website || 'careers.com'}/job/${company.name}-${jobType}-${i}-${Date.now()}`,
              companyId: company.id,
              isActive: true,
              postedAt: new Date(),
              deadline
            }
          })
          createdCount++
        } catch (error) {
          console.error(`Failed to create job for ${company.name}:`, error.message)
        }
      }
    }

    console.log(`✅ ${createdCount}개 채용공고 생성 완료`)

    // 확인
    const jobs = await prisma.job.findMany({
      take: 3,
      include: {
        company: true
      }
    })

    console.log('\n📋 샘플 채용공고 확인:')
    for (const job of jobs) {
      console.log(`- ${job.title} @ ${job.company.nameEn}`)
      console.log(`  위치: ${job.location}`)
      console.log(`  경력: ${job.experience}`)
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixEncoding()