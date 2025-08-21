// 부정확한 연봉 정보와 임의로 설정한 공고기간 제거
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeFakeInfo() {
  console.log('🧹 부정확한 정보 제거 시작...');
  
  try {
    // 모든 채용공고에서 salary와 deadline 제거
    const result = await prisma.job.updateMany({
      data: {
        salary: null,
        deadline: null
      }
    });
    
    console.log(`✅ ${result.count}개 채용공고에서 부정확한 연봉 정보 및 임의 공고기간 제거 완료`);
    console.log('   - 연봉 정보: 실제 회사 채용 사이트에서 확인 가능');
    console.log('   - 공고 기간: 실제 회사 채용 사이트에서 확인 가능');
    
  } catch (error) {
    console.error('❌ 정보 제거 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  removeFakeInfo().catch(console.error);
}

module.exports = { removeFakeInfo };