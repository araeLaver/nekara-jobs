const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addNexonCompany() {
  console.log('🏢 넥슨 회사 정보 추가 중...')
  
  try {
    // 넥슨 회사가 이미 있는지 확인
    const existingCompany = await prisma.company.findUnique({
      where: { name: 'nexon' }
    })
    
    if (existingCompany) {
      console.log('✅ 넥슨 회사가 이미 존재합니다.')
      return existingCompany
    }
    
    // 넥슨 회사 추가
    const nexonCompany = await prisma.company.create({
      data: {
        name: 'nexon',
        nameEn: 'NEXON',
        website: 'https://www.nexon.com',
        logo: '/images/companies/nexon-logo.png'
      }
    })
    
    console.log('✅ 넥슨 회사 정보가 추가되었습니다.')
    console.log(`   ID: ${nexonCompany.id}`)
    console.log(`   이름: ${nexonCompany.nameEn}`)
    
    return nexonCompany
    
  } catch (error) {
    console.error('❌ 넥슨 회사 추가 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  addNexonCompany().catch(console.error)
}

module.exports = { addNexonCompany }