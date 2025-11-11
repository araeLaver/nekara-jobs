// 메인 크롤러: 실제 데이터만 수집하여 DB에 저장

const { PrismaClient } = require('@prisma/client');
const WorkingCrawlers = require('./working-crawlers');
const { validateJobBatch, generateQualityReport } = require('./validators');

const prisma = new PrismaClient();

async function saveJobsToDatabase(jobs, companyName) {
  const startTime = Date.now();

  try {
    // 회사 정보 확인/생성 (upsert 사용)
    // Note: Node.js에서는 .ts import가 직접 안되므로, 간소화된 매핑 사용
    const companyInfo = {
      naver: { nameEn: 'NAVER', logo: null },
      kakao: { nameEn: 'Kakao', logo: null },
      line: { nameEn: 'LINE', logo: null },
      toss: { nameEn: 'Toss', logo: null },
      baemin: { nameEn: 'Woowa Brothers', logo: null },
      nexon: { nameEn: 'NEXON', logo: null }
    };
    // TODO: src/config/companies.ts와 동기화 필요

    const company = await prisma.company.upsert({
      where: { name: companyName },
      update: {},
      create: {
        name: companyName,
        nameEn: companyInfo[companyName]?.nameEn || companyName,
        logo: companyInfo[companyName]?.logo
      }
    });

    // 데이터 검증 수행
    const validationResult = validateJobBatch(jobs);
    const qualityReport = generateQualityReport(validationResult);

    console.log(`📊 ${companyName} 데이터 품질: ${qualityReport.qualityScore.toFixed(1)}%`);

    if (validationResult.valid.length === 0) {
      console.log(`⚠️ ${companyName}: 유효한 채용공고 없음`);
      return { saved: 0, updated: 0 };
    }

    const validJobs = validationResult.valid;

    // 기존 채용공고 조회 (한 번의 쿼리로)
    const existingJobs = await prisma.job.findMany({
      where: {
        originalUrl: {
          in: validJobs.map(job => job.originalUrl)
        }
      },
      select: {
        id: true,
        originalUrl: true
      }
    });

    const existingUrlMap = new Map(existingJobs.map(job => [job.originalUrl, job.id]));

    // 신규와 업데이트 분리
    const newJobs = [];
    const updateJobs = [];

    for (const job of validJobs) {
      const jobData = {
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
      };

      if (existingUrlMap.has(job.originalUrl)) {
        updateJobs.push({
          id: existingUrlMap.get(job.originalUrl),
          data: jobData
        });
      } else {
        newJobs.push(jobData);
      }
    }

    // Bulk 삽입 (신규)
    let savedCount = 0;
    if (newJobs.length > 0) {
      await prisma.job.createMany({
        data: newJobs,
        skipDuplicates: true
      });
      savedCount = newJobs.length;
    }

    // Bulk 업데이트 (기존) - transaction 사용
    let updatedCount = 0;
    if (updateJobs.length > 0) {
      await prisma.$transaction(
        updateJobs.map(({ id, data }) =>
          prisma.job.update({
            where: { id },
            data: {
              description: data.description,
              location: data.location,
              department: data.department,
              jobType: data.jobType,
              experience: data.experience,
              isActive: true,
              updatedAt: new Date()
            }
          })
        )
      );
      updatedCount = updateJobs.length;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ ${companyName}: 신규 ${savedCount}개, 업데이트 ${updatedCount}개 (${duration}초)`);

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
