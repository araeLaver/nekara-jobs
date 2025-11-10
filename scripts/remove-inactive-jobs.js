// 비활성 채용공고 제거 스크립트

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeInactiveJobs() {
  try {
    console.log('🧹 비활성 채용공고 정리 시작...\n');

    // 비활성 채용공고 수 확인
    const inactiveCount = await prisma.job.count({
      where: { isActive: false }
    });

    console.log(`비활성 채용공고: ${inactiveCount}개`);

    if (inactiveCount > 0) {
      // 비활성 채용공고 삭제
      const deleted = await prisma.job.deleteMany({
        where: { isActive: false }
      });

      console.log(`✅ ${deleted.count}개 채용공고 삭제 완료`);
    }

    // 현재 활성 채용공고 통계
    const activeCount = await prisma.job.count({
      where: { isActive: true }
    });

    console.log(`\n현재 활성 채용공고: ${activeCount}개`);

    // 회사별 통계
    const companies = await prisma.company.findMany({
      select: {
        name: true,
        _count: {
          select: { jobs: { where: { isActive: true } } }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n=== 회사별 채용공고 현황 ===');
    companies.forEach(company => {
      console.log(`${company.name}: ${company._count.jobs}개`);
    });

  } catch (error) {
    console.error('정리 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeInactiveJobs();
