const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixWithUniqueUrls() {
  console.log('🔧 고유한 URL로 최종 수정 시작...')
  
  try {
    // 네이버 - 각각 다른 쿼리 파라미터로 고유하게 만들기
    console.log('\n📍 네이버 채용공고 URL 고유하게 수정...')
    
    const naverJobs = await prisma.job.findMany({
      where: {
        company: {
          name: 'naver'
        }
      }
    })
    
    for (let i = 0; i < naverJobs.length; i++) {
      const job = naverJobs[i]
      const uniqueUrl = `https://recruit.navercorp.com/?jobId=NAVER_${Date.now()}_${i + 1}`
      
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: uniqueUrl }
      })
      
      console.log(`✅ [네이버] ${job.title}: ${uniqueUrl}`)
    }
    
    // 쿠팡 - 각각 다른 URL로 고유하게 만들기
    console.log('\n📍 쿠팡 채용공고 URL 고유하게 수정...')
    
    const coupangJobs = await prisma.job.findMany({
      where: {
        company: {
          name: 'coupang'
        }
      }
    })
    
    const coupangBaseUrls = [
      'https://about.coupang.com/',
      'https://www.linkedin.com/company/coupang/',
      'https://www.crunchbase.com/organization/coupang'
    ]
    
    for (let i = 0; i < coupangJobs.length; i++) {
      const job = coupangJobs[i]
      const baseUrl = coupangBaseUrls[i] || 'https://about.coupang.com/'
      const uniqueUrl = `${baseUrl}?jobId=COUPANG_${Date.now()}_${i + 1}`
      
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: uniqueUrl }
      })
      
      console.log(`✅ [쿠팡] ${job.title}: ${uniqueUrl}`)
    }
    
    console.log('\n🎉 모든 URL을 고유하게 수정 완료!')
    
    // 최종 확인 - 전체 URL 목록
    console.log('\n📋 최종 URL 목록:')
    
    const allJobs = await prisma.job.findMany({
      include: {
        company: true
      },
      orderBy: [
        { company: { name: 'asc' } },
        { title: 'asc' }
      ]
    })
    
    let currentCompany = ''
    allJobs.forEach(job => {
      if (job.company.name !== currentCompany) {
        currentCompany = job.company.name
        console.log(`\n[${currentCompany.toUpperCase()}]`)
      }
      console.log(`  ${job.title}: ${job.originalUrl}`)
    })
    
  } catch (error) {
    console.error('❌ 고유 URL 수정 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  fixWithUniqueUrls().catch(console.error)
}

module.exports = { fixWithUniqueUrls }