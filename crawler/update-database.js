const { PrismaClient } = require('@prisma/client');
const JobCrawler = require('./index.js');

const prisma = new PrismaClient();

async function updateDatabase() {
  try {
    console.log('📡 데이터베이스 업데이트 시작...');
    
    const crawler = new JobCrawler();
    const results = await crawler.crawlAll();
    
    console.log('\n📊 수집 결과:');
    results.forEach(result => {
      if (result.jobs && result.jobs.length > 0) {
        console.log(`✅ ${result.company}: ${result.jobs.length}개`);
      } else {
        console.log(`❌ ${result.company}: 0개 (${result.error || '데이터 없음'})`);
      }
    });
    
    // 데이터베이스에 저장
    let totalSaved = 0;
    let totalSkipped = 0;
    
    for (const result of results) {
      if (result.jobs && result.jobs.length > 0) {
        console.log(`\n💾 ${result.company} 데이터 저장 중...`);
        
        // 회사 정보 생성 또는 조회
        const companyMap = {
          naver: { name: 'naver', nameEn: 'Naver', logo: null },
          kakao: { name: 'kakao', nameEn: 'Kakao', logo: null },
          line: { name: 'line', nameEn: 'Line', logo: null },
          coupang: { name: 'coupang', nameEn: 'Coupang', logo: null },
          baemin: { name: 'baemin', nameEn: 'Woowa Brothers', logo: null },
          toss: { name: 'toss', nameEn: 'Toss', logo: null },
          carrot: { name: 'carrot', nameEn: 'Karrot', logo: null },
          nexon: { name: 'nexon', nameEn: 'Nexon', logo: null },
          krafton: { name: 'krafton', nameEn: 'Krafton', logo: null }
        };
        
        const companyInfo = companyMap[result.company];
        if (!companyInfo) continue;
        
        const company = await prisma.company.upsert({
          where: { name: companyInfo.name },
          update: {},
          create: companyInfo
        });
        
        // 채용공고 저장
        for (const job of result.jobs) {
          try {
            // 중복 체크
            const existingJob = await prisma.job.findFirst({
              where: {
                OR: [
                  { originalUrl: job.originalUrl },
                  { 
                    AND: [
                      { title: job.title },
                      { companyId: company.id }
                    ]
                  }
                ]
              }
            });
            
            if (existingJob) {
              totalSkipped++;
              continue;
            }
            
            // 새 채용공고 저장
            await prisma.job.create({
              data: {
                title: job.title,
                description: job.description || '',
                location: job.location || '',
                experience: job.experience || '',
                jobType: job.jobType || '정규직',
                department: job.department || '',
                postedAt: new Date(job.postedAt),
                originalUrl: job.originalUrl,
                companyId: company.id,
                isActive: true
              }
            });
            
            totalSaved++;
            
          } catch (jobError) {
            console.error(`채용공고 저장 실패 (${job.title}):`, jobError.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 데이터베이스 업데이트 완료!`);
    console.log(`💾 새로 저장된 채용공고: ${totalSaved}개`);
    console.log(`⏭️  중복으로 스킵된 공고: ${totalSkipped}개`);
    
    // 통계 확인
    const totalJobs = await prisma.job.count({ where: { isActive: true } });
    const companiesWithJobs = await prisma.company.findMany({
      include: {
        jobs: {
          where: { isActive: true }
        }
      }
    });
    
    console.log(`\n📈 현재 데이터베이스 상태:`);
    console.log(`총 활성 채용공고: ${totalJobs}개`);
    companiesWithJobs.forEach(company => {
      if (company.jobs.length > 0) {
        console.log(`- ${company.nameEn}: ${company.jobs.length}개`);
      }
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 업데이트 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행
if (require.main === module) {
  updateDatabase();
}

module.exports = { updateDatabase };