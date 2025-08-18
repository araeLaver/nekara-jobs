// 실제 작동하는 채용 사이트 URL로 수정

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRealUrls() {
  console.log('🔧 실제 채용 사이트 URL로 수정 중...');

  // 실제 확인된 채용 사이트 URL들
  const realUrls = {
    // 네이버 채용 페이지들
    'https://recruit.navercorp.com/naver/job/detail/developer?annoId=20001234': 'https://recruit.navercorp.com/naver/job/list/developer',
    'https://recruit.navercorp.com/naver/job/detail/developer?annoId=20001235': 'https://recruit.navercorp.com/naver/job/list/developer', 
    'https://recruit.navercorp.com/naver/job/detail/developer?annoId=20001236': 'https://recruit.navercorp.com/naver/job/list/developer',

    // 카카오 채용 페이지들
    'https://careers.kakao.com/jobs/P-12345': 'https://careers.kakao.com/jobs',
    'https://careers.kakao.com/jobs/P-12346': 'https://careers.kakao.com/jobs',

    // 라인 채용 페이지들  
    'https://careers.linecorp.com/ko/jobs/1234567': 'https://careers.linecorp.com/ko/jobs',
    'https://careers.linecorp.com/ko/jobs/1234568': 'https://careers.linecorp.com/ko/jobs',

    // 쿠팡 채용 페이지들
    'https://www.coupang.jobs/kr/job/12345': 'https://www.coupang.jobs/kr/',
    'https://www.coupang.jobs/kr/job/12346': 'https://www.coupang.jobs/kr/',

    // 배달의민족 채용 페이지들
    'https://www.woowahan.com/jobs/4567890': 'https://www.woowahan.com/jobs',
    'https://www.woowahan.com/jobs/4567891': 'https://www.woowahan.com/jobs'
  };

  let updatedCount = 0;

  for (const [oldUrl, newUrl] of Object.entries(realUrls)) {
    try {
      const result = await prisma.job.updateMany({
        where: { originalUrl: oldUrl },
        data: { originalUrl: newUrl }
      });
      
      if (result.count > 0) {
        console.log(`✅ ${oldUrl} → ${newUrl} (${result.count}개 업데이트)`);
        updatedCount += result.count;
      }
    } catch (error) {
      console.error(`❌ URL 업데이트 실패: ${oldUrl}`, error.message);
    }
  }

  console.log(`\n🎉 총 ${updatedCount}개 채용공고 URL 수정 완료!`);
  
  // 수정된 결과 확인
  const jobs = await prisma.job.findMany({
    select: {
      title: true,
      originalUrl: true,
      company: {
        select: { nameEn: true }
      }
    },
    orderBy: { postedAt: 'desc' }
  });

  console.log('\n📋 수정된 URL 목록:');
  jobs.forEach((job, index) => {
    console.log(`${index + 1}. [${job.company.nameEn}] ${job.title}`);
    console.log(`   → ${job.originalUrl}\n`);
  });

  // URL 검증 (실제 접근 가능한지 확인)
  console.log('🌐 URL 접근성 검증 중...');
  const uniqueUrls = [...new Set(jobs.map(job => job.originalUrl))];
  
  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${url} - 접근 가능 (${response.status})`);
      } else {
        console.log(`⚠️  ${url} - 응답 코드: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - 접근 불가: ${error.message}`);
    }
  }

  await prisma.$disconnect();
}

fixRealUrls().catch(console.error);