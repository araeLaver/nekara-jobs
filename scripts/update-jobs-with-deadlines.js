// 채용공고에 지원 기간 추가 및 만료된 공고 비활성화
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateJobsWithDeadlines() {
  console.log('📅 채용공고 지원 기간 업데이트 시작...');
  
  try {
    // 모든 활성 채용공고 가져오기
    const allJobs = await prisma.job.findMany({
      where: { isActive: true },
      include: { company: true }
    });
    
    console.log(`📊 총 ${allJobs.length}개 활성 채용공고 처리 중...`);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let updatedCount = 0;
    let deactivatedCount = 0;
    
    for (const job of allJobs) {
      try {
        let deadline;
        let isActive = true;
        
        // 회사별로 현실적인 채용 기간 설정
        if (job.company.name === 'naver') {
          // 네이버: 보통 2-3개월 채용 기간
          deadline = new Date(currentYear, currentMonth + 2, 15);
        } else if (job.company.name === 'kakao') {
          // 카카오: 보통 1-2개월 채용 기간
          deadline = new Date(currentYear, currentMonth + 1, 30);
        } else if (job.company.name === 'line') {
          // 라인: 상시 채용이지만 마감일 설정
          deadline = new Date(currentYear, currentMonth + 3, 10);
        } else if (job.company.name === 'coupang') {
          // 쿠팡: 보통 긴 채용 기간
          deadline = new Date(currentYear, currentMonth + 4, 20);
        } else if (job.company.name === 'baemin') {
          // 배민: 보통 1-2개월 채용 기간
          deadline = new Date(currentYear, currentMonth + 2, 5);
        }
        
        // 일부 채용공고는 이미 마감된 것으로 설정 (현실성 위해)
        const randomFactor = Math.random();
        if (randomFactor < 0.2) { // 20% 확률로 마감
          deadline = new Date(currentYear, currentMonth - 1, Math.floor(Math.random() * 28) + 1);
          isActive = false;
        } else if (randomFactor < 0.3) { // 10% 확률로 곧 마감
          deadline = new Date(today);
          deadline.setDate(today.getDate() + 3); // 3일 후 마감
        }
        
        // 데이터베이스 업데이트
        await prisma.job.update({
          where: { id: job.id },
          data: {
            deadline: deadline,
            isActive: isActive
          }
        });
        
        if (isActive) {
          const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
          console.log(`✅ [${job.company.nameEn}] ${job.title}`);
          console.log(`   📅 마감일: ${deadline.toISOString().split('T')[0]} (${daysRemaining > 0 ? `${daysRemaining}일 남음` : '오늘 마감'})`);
          updatedCount++;
        } else {
          console.log(`❌ [${job.company.nameEn}] ${job.title} - 마감됨`);
          deactivatedCount++;
        }
        
      } catch (error) {
        console.error(`❌ ${job.title} 업데이트 실패:`, error.message);
      }
    }
    
    console.log(`\n🎉 채용공고 업데이트 완료!`);
    console.log(`   ✅ 활성 공고: ${updatedCount}개`);
    console.log(`   ❌ 마감 공고: ${deactivatedCount}개`);
    
    // 회사별 활성 채용공고 통계
    console.log('\n📊 회사별 활성 채용공고 현황:');
    const companies = await prisma.company.findMany();
    
    for (const company of companies) {
      const activeJobs = await prisma.job.count({
        where: { 
          companyId: company.id, 
          isActive: true 
        }
      });
      
      const totalJobs = await prisma.job.count({
        where: { companyId: company.id }
      });
      
      console.log(`   ${company.nameEn}: ${activeJobs}/${totalJobs}개 (활성/전체)`);
    }
    
    // 마감 임박 공고 (3일 이내)
    const urgentJobs = await prisma.job.findMany({
      where: {
        isActive: true,
        deadline: {
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3일 후
        }
      },
      include: { company: true },
      orderBy: { deadline: 'asc' }
    });
    
    if (urgentJobs.length > 0) {
      console.log('\n🚨 마감 임박 공고 (3일 이내):');
      urgentJobs.forEach(job => {
        const daysLeft = Math.ceil((job.deadline - today) / (1000 * 60 * 60 * 24));
        console.log(`   [${job.company.nameEn}] ${job.title} - ${daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 마감'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 채용공고 업데이트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  updateJobsWithDeadlines().catch(console.error);
}

module.exports = { updateJobsWithDeadlines };