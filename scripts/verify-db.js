const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabase() {
  try {
    console.log('🔍 데이터베이스 연결 및 테이블 확인 중...')
    
    await prisma.$connect()
    console.log('✅ PostgreSQL 데이터베이스 연결 성공')

    // 회사별 공고 개수 확인 (핵심)
    const jobsByCompany = await prisma.job.groupBy({
        by: ['companyId'],
        _count: {
            id: true
        }
    });

    // 회사 이름 매핑을 위해 회사 정보 로드
    const companies = await prisma.company.findMany();
    const companyMap = {};
    companies.forEach(c => companyMap[c.id] = c.nameEn);

    console.log('\n📊 [최종 점검] 회사별 수집된 공고 현황:');
    let totalJobs = 0;
    
    // 정렬해서 출력
    const sortedStats = jobsByCompany.map(item => ({
        name: companyMap[item.companyId] || 'Unknown',
        count: item._count.id
    })).sort((a, b) => b.count - a.count);

    sortedStats.forEach(stat => {
        console.log(`   - ${stat.name}: ${stat.count}개`);
        totalJobs += stat.count;
    });
    
    console.log(`\n✅ 총 합계: ${totalJobs}개 채용공고가 DB에 저장되어 있습니다.`);

    // 기타 테이블 확인
    const tags = await prisma.tag.count();
    console.log(`✅ 태그: ${tags}개`);

    console.log('\n🎉 데이터베이스 검증 완료.');

  } catch (error) {
    console.error('❌ 데이터베이스 확인 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()