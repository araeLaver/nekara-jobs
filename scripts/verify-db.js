const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabase() {
  try {
    console.log('🔍 데이터베이스 연결 및 테이블 확인 중...')
    
    // 데이터베이스 연결 테스트
    await prisma.$connect()
    console.log('✅ PostgreSQL 데이터베이스 연결 성공')

    // 회사 데이터 확인
    const companies = await prisma.company.findMany()
    console.log(`✅ 회사 테이블: ${companies.length}개 회사 데이터`)
    companies.forEach(company => {
      console.log(`   - ${company.nameEn} (${company.name})`)
    })

    // 태그 데이터 확인
    const tags = await prisma.tag.count()
    console.log(`✅ 태그 테이블: ${tags}개 태그`)

    // 채용공고 데이터 확인
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
    console.log(`✅ 채용공고 테이블: ${jobs.length}개 공고`)
    
    if (jobs.length > 0) {
      const sampleJob = jobs[0]
      console.log(`   샘플 공고: ${sampleJob.title}`)
      console.log(`   회사: ${sampleJob.company.nameEn}`)
      console.log(`   태그: ${sampleJob.tags.map(jt => jt.tag.name).join(', ')}`)
    }

    // 테이블 정보 확인
    console.log('\n📊 테이블 구조:')
    console.log('   - companies: 회사 정보')
    console.log('   - jobs: 채용공고')
    console.log('   - tags: 기술 태그')
    console.log('   - job_tags: 채용공고-태그 연결')
    console.log('   - crawl_logs: 크롤링 로그')
    console.log('   - user_alerts: 사용자 알림 설정')
    console.log('   - job_views: 채용공고 조회 통계')

    console.log('\n🎉 데이터베이스 설정이 완료되었습니다!')
    console.log('\n📝 다음 단계:')
    console.log('   1. npm run server - API 서버 시작')
    console.log('   2. npm run dev - 프론트엔드 개발 서버 시작')
    console.log('   3. npm run crawler - 채용공고 크롤링 실행')
    console.log('   4. npm run db:studio - Prisma Studio에서 데이터 확인')

  } catch (error) {
    console.error('❌ 데이터베이스 확인 실패:', error)
    
    if (error.code === 'P1001') {
      console.log('\n💡 해결 방법:')
      console.log('   1. PostgreSQL이 실행 중인지 확인')
      console.log('   2. .env 파일의 DATABASE_URL 확인')
      console.log('   3. 데이터베이스 nekara_jobs가 생성되었는지 확인')
    }
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()