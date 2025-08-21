const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixInvalidUrls() {
  console.log('🔧 무효한 URL 수정 시작...')
  
  try {
    // 네이버 - 실제 채용 페이지로 수정
    const naverJobs = await prisma.job.findMany({
      where: {
        company: {
          name: 'naver'
        }
      }
    })
    
    console.log(`\n📍 네이버 채용공고 ${naverJobs.length}개 URL 수정...`)
    
    const naverRealUrls = [
      'https://recruit.navercorp.com/naver/job/list/developer',
      'https://recruit.navercorp.com/naver/job/list',
      'https://recruit.navercorp.com/',
      'https://recruit.navercorp.com/naver/job/list/ai',
      'https://recruit.navercorp.com/naver/job/list/data'
    ]
    
    for (let i = 0; i < naverJobs.length; i++) {
      const job = naverJobs[i]
      const newUrl = naverRealUrls[i] || 'https://recruit.navercorp.com/naver/job/list/developer'
      
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: newUrl }
      })
      
      console.log(`✅ [네이버] ${job.title} URL 수정: ${newUrl}`)
    }
    
    // 쿠팡 - 실제 채용 페이지로 수정
    const coupangJobs = await prisma.job.findMany({
      where: {
        company: {
          name: 'coupang'
        }
      }
    })
    
    console.log(`\n📍 쿠팡 채용공고 ${coupangJobs.length}개 URL 수정...`)
    
    const coupangRealUrls = [
      'https://www.coupang.jobs/kr/',
      'https://www.coupang.jobs/kr/jobs',
      'https://careers.coupang.com/'
    ]
    
    for (let i = 0; i < coupangJobs.length; i++) {
      const job = coupangJobs[i]
      const newUrl = coupangRealUrls[i] || 'https://www.coupang.jobs/kr/'
      
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: newUrl }
      })
      
      console.log(`✅ [쿠팡] ${job.title} URL 수정: ${newUrl}`)
    }
    
    // 라인 - 403 에러인 채용공고 URL 수정
    const lineInvalidJob = await prisma.job.findFirst({
      where: {
        company: {
          name: 'line'
        },
        originalUrl: {
          contains: '2433'
        }
      }
    })
    
    if (lineInvalidJob) {
      console.log(`\n📍 라인 무효 채용공고 URL 수정...`)
      
      await prisma.job.update({
        where: { id: lineInvalidJob.id },
        data: { originalUrl: 'https://careers.linecorp.com/ko/jobs' }
      })
      
      console.log(`✅ [라인] ${lineInvalidJob.title} URL 수정: https://careers.linecorp.com/ko/jobs`)
    }
    
    // 결과 확인
    const totalJobs = await prisma.job.count({
      where: { isActive: true }
    })
    
    console.log(`\n🎉 URL 수정 완료! 총 ${totalJobs}개 채용공고가 업데이트되었습니다.`)
    
    // 수정된 URL 목록 출력
    console.log('\n📋 수정된 URL 목록:')
    
    const updatedJobs = await prisma.job.findMany({
      include: {
        company: true
      },
      where: {
        company: {
          name: {
            in: ['naver', 'coupang', 'line']
          }
        }
      },
      orderBy: [
        { company: { name: 'asc' } },
        { title: 'asc' }
      ]
    })
    
    let currentCompany = ''
    updatedJobs.forEach(job => {
      if (job.company.name !== currentCompany) {
        currentCompany = job.company.name
        console.log(`\n[${currentCompany.toUpperCase()}]`)
      }
      console.log(`  ${job.title}: ${job.originalUrl}`)
    })
    
  } catch (error) {
    console.error('❌ URL 수정 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  fixInvalidUrls().catch(console.error)
}

module.exports = { fixInvalidUrls }