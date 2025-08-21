const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initCompanies() {
  console.log('🏢 회사 데이터 초기화 중...')
  
  const companies = [
    {
      name: 'naver',
      nameEn: 'Naver',
      logo: null,
      website: 'https://recruit.navercorp.com'
    },
    {
      name: 'kakao', 
      nameEn: 'Kakao',
      logo: null,
      website: 'https://careers.kakao.com'
    },
    {
      name: 'line',
      nameEn: 'Line',
      logo: null,
      website: 'https://careers.linecorp.com'
    },
    {
      name: 'coupang',
      nameEn: 'Coupang', 
      logo: null,
      website: 'https://www.coupang.jobs'
    },
    {
      name: 'baemin',
      nameEn: 'Woowa Brothers',
      logo: null,
      website: 'https://www.woowahan.com'
    }
  ]
  
  for (const companyData of companies) {
    try {
      const existingCompany = await prisma.company.findUnique({
        where: { name: companyData.name }
      })
      
      if (!existingCompany) {
        await prisma.company.create({
          data: companyData
        })
        console.log(`✅ ${companyData.nameEn} 회사 생성 완료`)
      } else {
        console.log(`⚠️  ${companyData.nameEn} 회사 이미 존재`)
      }
    } catch (error) {
      console.error(`❌ ${companyData.nameEn} 생성 실패:`, error.message)
    }
  }
  
  console.log('🎉 회사 데이터 초기화 완료!')
  await prisma.$disconnect()
}

if (require.main === module) {
  initCompanies().catch(console.error)
}

module.exports = { initCompanies }