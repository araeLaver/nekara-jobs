// 메인 크롤러: 실제 데이터만 수집하여 DB에 저장

const { PrismaClient } = require('@prisma/client');
const WorkingCrawlers = require('./working-crawlers');

const prisma = new PrismaClient();

async function saveJobsToDatabase(jobs, companyName) {
  try {
    // 회사 정보 확인/생성
    let company = await prisma.company.findUnique({
      where: { name: companyName }
    });

    if (!company) {
      const companyInfo = {
        naver: { nameEn: 'NAVER', logo: null },
        kakao: { nameEn: 'Kakao', logo: null },
        line: { nameEn: 'LINE', logo: null },
        toss: { nameEn: 'Toss', logo: null },
        baemin: { nameEn: 'Woowa Brothers', logo: null },
        nexon: { nameEn: 'NEXON', logo: null }
      };

      company = await prisma.company.create({
        data: {
          name: companyName,
          nameEn: companyInfo[companyName]?.nameEn || companyName,
          logo: companyInfo[companyName]?.logo
        }
      });
      console.log(`✅ 회사 생성: ${companyName}`);
    }

    let savedCount = 0;
    let updatedCount = 0;

    // 채용공고 저장
    for (const job of jobs) {
      // 유효성 검사
      if (!job.title || !job.originalUrl) {
        console.log(`⚠️ 건너뛰기 (필수 정보 누락): ${job.title || 'No title'}`);
        continue;
      }

      // URL 중복 확인
      const existingJob = await prisma.job.findUnique({
        where: { originalUrl: job.originalUrl }
      });

      if (!existingJob) {
        await prisma.job.create({
          data: {
            title: job.title,
            description: job.description || '',
            location: job.location || '서울',
            department: job.department || '',
            jobType: job.jobType || '정규직',
            experience: job.experience || '경력무관',
            salary: job.salary || null,
            originalUrl: job.originalUrl,
            postedAt: job.postedAt ? new Date(job.postedAt) : new Date(),
            deadline: job.deadline ? new Date(job.deadline) : null,
            companyId: company.id,
            isActive: true
          }
        });
        savedCount++;
      } else {
        // 기존 채용공고 업데이트
        await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            description: job.description || existingJob.description,
            location: job.location || existingJob.location,
            department: job.department || existingJob.department,
            jobType: job.jobType || existingJob.jobType,
            experience: job.experience || existingJob.experience,
            isActive: true,
            updatedAt: new Date()
          }
        });
        updatedCount++;
      }
    }

    console.log(`✅ ${companyName}: 신규 ${savedCount}개, 업데이트 ${updatedCount}개`);
    return { saved: savedCount, updated: updatedCount };
  } catch (error) {
    console.error(`❌ ${companyName} DB 저장 오류:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 실제 채용공고 크롤링 시작...\n');

    const crawler = new WorkingCrawlers();
    const results = await crawler.crawlAll();

    console.log('\n📊 데이터베이스 저장 중...\n');

    let totalSaved = 0;
    let totalUpdated = 0;

    for (const result of results) {
      if (result.jobs && result.jobs.length > 0) {
        const { saved, updated } = await saveJobsToDatabase(result.jobs, result.company);
        totalSaved += saved;
        totalUpdated += updated;
      }
    }

    console.log('\n=== 크롤링 완료 ===');
    console.log(`신규 저장: ${totalSaved}개`);
    console.log(`업데이트: ${totalUpdated}개`);
    console.log(`총 처리: ${totalSaved + totalUpdated}개`);

    // 통계 조회
    const stats = await prisma.company.findMany({
      select: {
        name: true,
        _count: {
          select: { jobs: { where: { isActive: true } } }
        }
      }
    });

    console.log('\n=== 회사별 채용공고 현황 ===');
    stats.forEach(stat => {
      console.log(`${stat.name}: ${stat._count.jobs}개`);
    });

  } catch (error) {
    console.error('크롤링 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, saveJobsToDatabase };
