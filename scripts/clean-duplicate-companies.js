// 중복된 회사 데이터 정리 스크립트

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicateCompanies() {
  try {
    console.log('🧹 중복 회사 데이터 정리 시작...\n');

    // 회사 이름 표준화 매핑
    const companyMapping = {
      'Toss': 'toss',
      'Kakao': 'kakao',
      'NEXON': 'nexon',
      'Coupang': 'coupang',
      'NAVER': 'naver',
      'LINE': 'line'
    };

    for (const [oldName, newName] of Object.entries(companyMapping)) {
      const oldCompany = await prisma.company.findUnique({
        where: { name: oldName }
      });

      const newCompany = await prisma.company.findUnique({
        where: { name: newName }
      });

      if (oldCompany && newCompany) {
        console.log(`📝 ${oldName} → ${newName} 병합 중...`);

        // 이전 회사의 채용공고를 새 회사로 이동
        await prisma.job.updateMany({
          where: { companyId: oldCompany.id },
          data: { companyId: newCompany.id }
        });

        // 이전 회사 삭제
        await prisma.company.delete({
          where: { id: oldCompany.id }
        });

        console.log(`✅ ${oldName} 제거 완료`);
      } else if (oldCompany && !newCompany) {
        // 새 회사가 없으면 이름만 변경
        console.log(`📝 ${oldName} → ${newName} 이름 변경...`);
        await prisma.company.update({
          where: { id: oldCompany.id },
          data: { name: newName }
        });
        console.log(`✅ 이름 변경 완료`);
      }
    }

    console.log('\n=== 정리 완료 ===');

    // 최종 회사 목록 조회
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

cleanDuplicateCompanies();
