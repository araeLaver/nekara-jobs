const { PrismaClient } = require('@prisma/client')
const KoreanRealCrawler = require('../crawler/korean-real-crawler')

const prisma = new PrismaClient()

async function resetWithKoreanData() {
  console.log('🔧 한국어 데이터로 완전 리셋 시작...')

  try {
    // 1. 모든 채용공고 삭제
    await prisma.job.deleteMany({})
    console.log('✅ 모든 기존 채용공고 삭제 완료')

    // 2. 한국어 크롤러로 데이터 생성
    const crawler = new KoreanRealCrawler()
    const crawlResults = await crawler.crawlAll()

    console.log('\n📊 크롤링 결과:')
    for (const result of crawlResults) {
      console.log(`- ${result.company}: ${result.count}개 채용공고`)
    }

    // 3. 회사 정보 가져오기
    const companies = await prisma.company.findMany()
    const companyMap = {}
    for (const company of companies) {
      companyMap[company.name] = company
    }

    // 4. 채용공고 삽입
    let insertedCount = 0
    for (const result of crawlResults) {
      const company = companyMap[result.company]
      if (!company) {
        console.log(`⚠️ 회사 정보 없음: ${result.company}`)
        continue
      }

      for (let i = 0; i < result.jobs.length; i++) {
        const job = result.jobs[i]

        try {
          await prisma.job.create({
            data: {
              title: job.title,
              description: job.description,
              location: job.location,
              department: job.department,
              jobType: job.jobType,
              experience: job.experience,
              salary: job.salary || '',
              originalUrl: `${company.website}/careers/${job.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${i}`,
              companyId: company.id,
              isActive: true,
              postedAt: new Date(job.postedAt),
              deadline: job.deadline ? new Date(job.deadline) : null
            }
          })
          insertedCount++
        } catch (error) {
          console.error(`❌ 채용공고 삽입 실패 (${job.title}):`, error.message)
        }
      }
    }

    console.log(`\n✅ ${insertedCount}개 한국어 채용공고 삽입 완료`)

    // 5. 결과 확인
    const sampleJobs = await prisma.job.findMany({
      take: 5,
      include: { company: true },
      orderBy: { postedAt: 'desc' }
    })

    console.log('\n📋 샘플 한국어 채용공고:')
    for (const job of sampleJobs) {
      console.log(`- ${job.title} @ ${job.company.nameEn}`)
      console.log(`  부서: ${job.department}`)
      console.log(`  위치: ${job.location}`)
      console.log(`  경력: ${job.experience}`)
      console.log('')
    }

    const totalJobs = await prisma.job.count()
    console.log(`🎉 총 ${totalJobs}개 채용공고 준비 완료!`)

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetWithKoreanData()