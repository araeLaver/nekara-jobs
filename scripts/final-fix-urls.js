const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function finalFixUrls() {
  console.log('🔧 최종 URL 수정 시작...')
  
  try {
    // 네이버 - 모든 채용공고를 메인 채용 페이지로 통일
    console.log('\n📍 네이버 채용공고 URL 최종 수정...')
    
    const naverJobs = await prisma.job.findMany({
      where: {
        company: {
          name: 'naver'
        }
      }
    })
    
    for (const job of naverJobs) {
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: 'https://recruit.navercorp.com/' }
      })
      
      console.log(`✅ [네이버] ${job.title}: https://recruit.navercorp.com/`)
    }
    
    // 쿠팡 - 모든 채용공고를 접근 가능한 메인 페이지로 변경
    console.log('\n📍 쿠팡 채용공고 URL 최종 수정...')
    
    const coupangJobs = await prisma.job.findMany({
      where: {
        company: {
          name: 'coupang'
        }
      }
    })
    
    // 쿠팡은 접근 제한이 있으므로 공개된 회사 정보 페이지로 변경
    const coupangUrls = [
      'https://www.coupang.com/np/campaigns/82/brand?campaignId=82',
      'https://about.coupang.com/',
      'https://www.linkedin.com/company/coupang/'
    ]
    
    for (let i = 0; i < coupangJobs.length; i++) {
      const job = coupangJobs[i]
      const newUrl = coupangUrls[i] || 'https://about.coupang.com/'
      
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: newUrl }
      })
      
      console.log(`✅ [쿠팡] ${job.title}: ${newUrl}`)
    }
    
    console.log('\n🎉 모든 무효 URL 수정 완료!')
    
    // 최종 확인
    console.log('\n📋 수정된 URL 최종 목록:')
    
    const allJobs = await prisma.job.findMany({
      include: {
        company: true
      },
      where: {
        company: {
          name: {
            in: ['naver', 'coupang']
          }
        }
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
    console.error('❌ 최종 URL 수정 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  finalFixUrls().catch(console.error)
}

module.exports = { finalFixUrls }