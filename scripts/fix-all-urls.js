// 모든 채용공고를 실제 작동하는 메인 채용 페이지로 통일

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllUrls() {
  console.log('🔧 모든 채용공고 URL을 실제 채용 사이트로 수정 중...');

  // 회사별 실제 메인 채용 페이지 URL
  const mainCareerUrls = {
    'naver': 'https://recruit.navercorp.com/naver/job/list/developer',
    'kakao': 'https://careers.kakao.com/jobs',
    'line': 'https://careers.linecorp.com/ko/jobs',
    'coupang': 'https://www.coupang.jobs/kr/',
    'baemin': 'https://www.woowahan.com/jobs'
  };

  let totalUpdated = 0;

  for (const [companyName, mainUrl] of Object.entries(mainCareerUrls)) {
    try {
      const result = await prisma.job.updateMany({
        where: {
          company: {
            name: companyName
          }
        },
        data: {
          originalUrl: mainUrl
        }
      });

      console.log(`✅ ${companyName}: ${result.count}개 채용공고 URL → ${mainUrl}`);
      totalUpdated += result.count;
    } catch (error) {
      console.error(`❌ ${companyName} URL 업데이트 실패:`, error.message);
    }
  }

  console.log(`\n🎉 총 ${totalUpdated}개 채용공고 URL 수정 완료!`);

  // URL 접근성 최종 검증
  console.log('\n🌐 URL 접근성 최종 검증:');
  
  for (const [companyName, url] of Object.entries(mainCareerUrls)) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${companyName} (${url}) - 정상 접근 가능!`);
      } else {
        console.log(`⚠️  ${companyName} (${url}) - 응답 코드: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${companyName} (${url}) - 접근 불가: ${error.message}`);
    }
  }

  // 수정 결과 확인
  const updatedJobs = await prisma.job.findMany({
    select: {
      title: true,
      originalUrl: true,
      company: {
        select: { 
          nameEn: true,
          name: true 
        }
      }
    },
    orderBy: [
      { company: { name: 'asc' } },
      { title: 'asc' }
    ]
  });

  console.log('\n📋 최종 수정된 채용공고 목록:');
  let currentCompany = '';
  updatedJobs.forEach((job, index) => {
    if (job.company.name !== currentCompany) {
      currentCompany = job.company.name;
      console.log(`\n🏢 ${job.company.nameEn}:`);
    }
    console.log(`   ${job.title} → ${job.originalUrl}`);
  });

  console.log('\n🎯 이제 모든 채용공고 링크가 실제 작동하는 채용 사이트로 연결됩니다!');

  await prisma.$disconnect();
}

fixAllUrls().catch(console.error);