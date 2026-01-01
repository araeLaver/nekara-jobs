// 메인 크롤러: 실제 데이터만 수집하여 DB에 저장

const { PrismaClient } = require('@prisma/client');
const WorkingCrawlers = require('./working-crawlers');
const { validateJobBatch, generateQualityReport } = require('./validators');
const fs = require('fs'); // Import fs module
const path = require('path'); // Import path module

const prisma = new PrismaClient();

// 로그 파일 경로 설정
const logFilePath = path.join(__dirname, 'crawler-log.txt');

// 크롤링 결과 로그 기록 함수
function logCrawlerResult(status, message, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${status.toUpperCase()}] ${message} ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
}

async function saveJobsToDatabase(jobs, companyName) {
  const startTime = Date.now();

  try {
    // 회사 이름 정규화
    const normalizedCompanyName = companyName.toLowerCase();
    const companyNameMap = {
      'naver': 'NAVER',
      'kakao': 'Kakao',
      'line': 'LINE',
      'toss': 'Toss',
      'baemin': 'Woowa Brothers',
      'nexon': 'NEXON',
      'coupang': 'Coupang',
      'woowa brothers': 'Woowa Brothers',
      'zigbang': 'Zigbang', // Added for consistency
      'bucketplace': 'Bucketplace', // Added for consistency
      'krafton': 'KRAFTON', // Added for consistency
      'carrot': ' 당근마켓 (Karrot)' // Added for consistency
    };

    const displayName = companyNameMap[normalizedCompanyName] || companyName;

    // 회사 정보 확인/생성 (upsert 사용)
    const companyInfo = {
      NAVER: { nameEn: 'NAVER', logo: null },
      Kakao: { nameEn: 'Kakao', logo: null },
      LINE: { nameEn: 'LINE', logo: null },
      Toss: { nameEn: 'Toss', logo: null },
      'Woowa Brothers': { nameEn: 'Woowa Brothers', logo: null },
      NEXON: { nameEn: 'NEXON', logo: null },
      Coupang: { nameEn: 'Coupang', logo: null },
      Zigbang: { nameEn: 'Zigbang', logo: null }, // Added
      Bucketplace: { nameEn: 'Bucketplace', logo: null }, // Added
      KRAFTON: { nameEn: 'KRAFTON', logo: null }, // Added
      ' 당근마켓 (Karrot)': { nameEn: 'Karrot', logo: null } // Added
    };

    const company = await prisma.company.upsert({
      where: { name: displayName },
      update: {
        nameEn: companyInfo[displayName]?.nameEn || displayName, // Update nameEn and logo on subsequent runs
        logo: companyInfo[displayName]?.logo
      },
      create: {
        name: displayName,
        nameEn: companyInfo[displayName]?.nameEn || displayName,
        logo: companyInfo[displayName]?.logo
      }
    });

    // 크롤링된 데이터에 companyId 추가
    const jobsWithCompanyId = jobs.map(job => ({
      ...job,
      companyId: company.id
    }));

    // 데이터 검증 수행
    const validationResult = validateJobBatch(jobsWithCompanyId);
    const qualityReport = generateQualityReport(validationResult);

    console.log(`📊 ${displayName} 데이터 품질: ${qualityReport.qualityScore.toFixed(1)}%`);

    if (validationResult.valid.length === 0) {
      console.log(`⚠️ ${displayName}: 유효한 채용공고 없음`);
      logCrawlerResult('warn', `${displayName}: 유효한 채용공고 없음`, { company: displayName });
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
    console.log(`✅ ${displayName}: 신규 ${savedCount}개, 업데이트 ${updatedCount}개 (${duration}초)`);
    logCrawlerResult('info', `${displayName} DB 저장 완료`, {
      company: displayName,
      saved: savedCount,
      updated: updatedCount,
      duration: `${duration}s`
    });

    return { saved: savedCount, updated: updatedCount };
  } catch (error) {
    console.error(`❌ ${companyName} DB 저장 오류:`, error);
    logCrawlerResult('error', `${companyName} DB 저장 실패`, { error: error.message });
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 실제 채용공고 크롤링 시작...\n');
    logCrawlerResult('info', '크롤링 시작');

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
      } else {
        console.log(`⚠️ ${result.company}: 크롤링된 공고 없음`);
        logCrawlerResult('warn', `${result.company}: 크롤링된 공고 없음`, { company: result.company });
      }
    }

    console.log('\n=== 크롤링 완료 ===');
    console.log(`신규 저장: ${totalSaved}개`);
    console.log(`업데이트: ${totalUpdated}개`);
    console.log(`총 처리: ${totalSaved + totalUpdated}개`);
    logCrawlerResult('success', '크롤링 최종 완료', {
      totalSaved,
      totalUpdated,
      totalProcessed: totalSaved + totalUpdated
    });


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
    logCrawlerResult('error', '크롤링 프로세스 실패', { error: error.message, stack: error.stack });
    // 가상 Slack 알림
    console.error('🚨 [Slack Alert] 크롤링 프로세스 실패! 상세 로그를 확인하세요.');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, saveJobsToDatabase };
