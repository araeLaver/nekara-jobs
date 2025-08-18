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

  // 샘플 채용공고 데이터 생성 (테스트용)
  const naverCompany = await prisma.company.findUnique({
    where: { name: 'naver' },
  })

  if (naverCompany) {
    const sampleJob = await prisma.job.upsert({
      where: { originalUrl: 'https://recruit.navercorp.com/sample/job/1' },
      update: {},
      create: {
        title: '[네이버] Frontend 개발자 (React)',
        description: 'React, TypeScript를 활용한 웹 프론트엔드 개발',
        location: '경기 성남시 분당구',
        department: '플랫폼개발팀',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '회사내규에 따름',
        originalUrl: 'https://recruit.navercorp.com/sample/job/1',
        postedAt: new Date(),
        companyId: naverCompany.id,
      },
    })

    // 샘플 태그 연결
    const reactTag = await prisma.tag.findUnique({ where: { name: 'React' } })
    const jsTag = await prisma.tag.findUnique({ where: { name: 'JavaScript' } })
    const frontendTag = await prisma.tag.findUnique({ where: { name: 'Frontend' } })

    if (reactTag && jsTag && frontendTag) {
      for (const tag of [reactTag, jsTag, frontendTag]) {
        await prisma.jobTag.upsert({
          where: {
            jobId_tagId: {
              jobId: sampleJob.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            jobId: sampleJob.id,
            tagId: tag.id,
          },
        })
      }
    }

    console.log('✅ 샘플 채용공고 생성 완료')
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