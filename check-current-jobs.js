const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUpdatedCounts() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { jobs: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('🎯 업데이트된 회사별 채용공고 수:');
    console.log('================================');
    let total = 0;
    for (const company of companies) {
      const displayName = {
        naver: '네이버',
        kakao: '카카오',
        line: '라인',
        coupang: '쿠팡',
        baemin: '배민',
        toss: '토스',
        carrot: '당근',
        krafton: '크래프톤',
        bucketplace: '오늘의집',
        zigbang: '직방',
        nexon: '넥슨'
      }[company.name] || company.name;
      
      console.log(`${displayName}: ${company._count.jobs}개`);
      total += company._count.jobs;
    }
    console.log('================================');
    console.log(`✅ 총 채용공고: ${total}개`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUpdatedCounts();