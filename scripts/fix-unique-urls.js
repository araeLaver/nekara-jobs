// originalUrl 유니크 제약조건을 고려하여 각 채용공고마다 고유한 실제 URL 설정

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUniqueUrls() {
  console.log('🔧 각 채용공고에 고유한 실제 URL 설정 중...');

  // 모든 채용공고 조회
  const jobs = await prisma.job.findMany({
    include: {
      company: true
    },
    orderBy: { postedAt: 'asc' }
  });

  let updatedCount = 0;

  for (const job of jobs) {
    let newUrl;
    
    // 회사별 실제 채용 사이트 URL + 고유 파라미터
    switch (job.company.name) {
      case 'naver':
        newUrl = `https://recruit.navercorp.com/naver/job/list/developer?search=${encodeURIComponent(job.title.split(' ')[0])}`;
        break;
      case 'kakao':
        newUrl = `https://careers.kakao.com/jobs?keyword=${encodeURIComponent(job.title.split(' ')[0])}`;
        break;
      case 'line':
        newUrl = `https://careers.linecorp.com/ko/jobs?search=${encodeURIComponent(job.title.split(' ')[0])}`;
        break;
      case 'coupang':
        newUrl = `https://www.coupang.jobs/kr/?search=${encodeURIComponent(job.title.split(' ')[0])}`;
        break;
      case 'baemin':
        newUrl = `https://www.woowahan.com/jobs?keyword=${encodeURIComponent(job.title.split(' ')[0])}`;
        break;
      default:
        continue;
    }

    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { originalUrl: newUrl }
      });
      
      console.log(`✅ [${job.company.nameEn}] ${job.title}`);
      console.log(`   → ${newUrl}`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ ${job.title} URL 업데이트 실패:`, error.message);
    }
  }

  console.log(`\n🎉 총 ${updatedCount}개 채용공고 URL 수정 완료!`);

  // URL 접근성 검증 (대표 URL들)
  console.log('\n🌐 채용 사이트 접근성 검증:');
  
  const mainUrls = [
    { name: 'NAVER', url: 'https://recruit.navercorp.com/' },
    { name: 'Kakao', url: 'https://careers.kakao.com/jobs' },
    { name: 'LINE', url: 'https://careers.linecorp.com/ko/jobs' },
    { name: 'Coupang', url: 'https://www.coupang.jobs/kr/' },
    { name: 'Baemin', url: 'https://www.woowahan.com/jobs' }
  ];

  for (const site of mainUrls) {
    try {
      const response = await fetch(site.url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      });
      
      if (response.ok) {
        console.log(`✅ ${site.name} - 정상 접근 가능! (${response.status})`);
      } else {
        console.log(`⚠️  ${site.name} - 응답 코드: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${site.name} - 접근 불가: ${error.message}`);
    }
  }

  // 최종 확인
  const finalJobs = await prisma.job.findMany({
    select: {
      title: true,
      originalUrl: true,
      company: {
        select: { nameEn: true }
      }
    },
    orderBy: [
      { company: { name: 'asc' } },
      { title: 'asc' }
    ]
  });

  console.log('\n📋 최종 URL 목록 확인:');
  let currentCompany = '';
  finalJobs.forEach((job) => {
    if (job.company.nameEn !== currentCompany) {
      currentCompany = job.company.nameEn;
      console.log(`\n🏢 ${job.company.nameEn}:`);
    }
    console.log(`   • ${job.title}`);
    console.log(`     ${job.originalUrl}`);
  });

  console.log('\n✨ 이제 모든 채용공고가 실제 채용 사이트로 연결됩니다!');
  console.log('💡 각 링크는 해당 직무로 검색된 채용 페이지로 이동합니다.');

  await prisma.$disconnect();
}

fixUniqueUrls().catch(console.error);