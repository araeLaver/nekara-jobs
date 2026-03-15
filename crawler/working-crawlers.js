// 실제로 작동하는 크롤러들만 실행

const { crawlKakao } = require('./kakao');
const { crawlToss } = require('./toss');
const { crawlNexon } = require('./nexon');
const { crawlNaver } = require('./naver');
const { crawlLine } = require('./line');
const { crawlBaemin } = require('./baemin');
const { getBrowser, IS_VERCEL } = require('./browser');
const { PrismaClient } = require('@prisma/client');

const DEFAULT_TIMEOUT_MS = Number(process.env.CRAWL_TIMEOUT_MS || 30000);
const MAX_CONCURRENCY = IS_VERCEL ? 1 : Number(process.env.CRAWL_CONCURRENCY || 3);
const RETRY_COUNT = Number(process.env.CRAWL_RETRY_COUNT || 1);
const RETRY_DELAY_MS = Number(process.env.CRAWL_RETRY_DELAY_MS || 2000);

const HEALTHCHECK_ENABLED = process.env.CRAWL_HEALTHCHECK_ENABLED === 'true';
const FAIL_THRESHOLD = Number(process.env.CRAWL_FAIL_THRESHOLD || 3);
const FAIL_WINDOW_HOURS = Number(process.env.CRAWL_FAIL_WINDOW_HOURS || 24);
const FAIL_COOLDOWN_HOURS = Number(process.env.CRAWL_FAIL_COOLDOWN_HOURS || 6);

const DISPLAY_NAME_MAP = {
  kakao: 'Kakao',
  toss: 'Toss',
  nexon: 'NEXON',
  naver: 'NAVER',
  line: 'LINE',
  baemin: 'Woowa Brothers'
};

async function shouldSkipCrawler(prisma, crawlerName) {
  if (!HEALTHCHECK_ENABLED) {
    return { skip: false };
  }

  const displayName = DISPLAY_NAME_MAP[crawlerName] || crawlerName;
  const since = new Date();
  since.setHours(since.getHours() - FAIL_WINDOW_HOURS);

  const [recentFailures, lastLog] = await Promise.all([
    prisma.crawlLog.count({
      where: {
        company: displayName,
        status: { in: ['failed', 'warning'] },
        createdAt: { gte: since }
      }
    }),
    prisma.crawlLog.findFirst({
      where: { company: displayName },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (recentFailures >= FAIL_THRESHOLD && lastLog?.createdAt) {
    const cooldownMs = FAIL_COOLDOWN_HOURS * 60 * 60 * 1000;
    const sinceLast = Date.now() - new Date(lastLog.createdAt).getTime();
    if (sinceLast < cooldownMs) {
      return {
        skip: true,
        reason: 'healthcheck_failure_cooldown',
        recentFailures,
        lastStatus: lastLog.status,
        lastAt: lastLog.createdAt,
        displayName
      };
    }
  }

  return { skip: false };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Timeout after ${ms}ms${label ? `: ${label}` : ''}`));
        }, ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function runWithRetry(fn, label) {
  let attempt = 0;

  while (true) {
    try {
      return await withTimeout(fn(), DEFAULT_TIMEOUT_MS, label);
    } catch (error) {
      attempt += 1;
      if (attempt > RETRY_COUNT) {
        throw error;
      }
      console.warn(`⚠️ ${label} 재시도 (${attempt}/${RETRY_COUNT})`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

class WorkingCrawlers {
  constructor() {
    // naver는 API 기반이므로 브라우저 불필요
    this.browserCrawlers = [
      { name: 'kakao', fn: crawlKakao },
      { name: 'toss', fn: crawlToss },
      { name: 'nexon', fn: crawlNexon },
      { name: 'line', fn: crawlLine },
      { name: 'baemin', fn: crawlBaemin }
    ];
    this.apiCrawlers = [
      { name: 'naver', fn: crawlNaver }
    ];
  }

  async crawlAll() {
    console.log(`🚀 크롤링 시작 (concurrency: ${MAX_CONCURRENCY}, vercel: ${IS_VERCEL})...`);

    const results = [];
    const prisma = new PrismaClient();

    try {
      // 1) API 기반 크롤러 먼저 실행 (브라우저 불필요)
      for (const crawler of this.apiCrawlers) {
        try {
          const health = await shouldSkipCrawler(prisma, crawler.name);
          if (health.skip) {
            console.warn(`⏭️ ${crawler.name} 건너뜀: 연속 실패 쿨다운 (최근 ${health.recentFailures}회)`);
            results.push({ company: crawler.name, jobs: [], count: 0, skipped: true, reason: health.reason });
            continue;
          }

          console.log(`🔍 ${crawler.name} API 크롤링 시작...`);
          const startTime = Date.now();
          const jobs = await runWithRetry(crawler.fn, crawler.name);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);

          console.log(`✅ ${crawler.name}: ${jobs.length}개 채용공고 수집 (${duration}초)`);
          results.push({ company: crawler.name, jobs, count: jobs.length });
        } catch (error) {
          console.error(`❌ ${crawler.name} 크롤링 실패:`, error.message);
          results.push({ company: crawler.name, jobs: [], count: 0, error: error.message });
        }
      }

      // 2) 브라우저 기반 크롤러: 브라우저 1회 생성 → 공유 → 완료 후 close
      let browser;
      try {
        console.log('🌐 브라우저 인스턴스 시작...');
        browser = await getBrowser();
        console.log('🌐 브라우저 준비 완료');

        let index = 0;
        const crawlers = this.browserCrawlers;

        const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, crawlers.length) }, async () => {
          while (index < crawlers.length) {
            const crawler = crawlers[index++];
            try {
              const health = await shouldSkipCrawler(prisma, crawler.name);
              if (health.skip) {
                console.warn(`⏭️ ${crawler.name} 건너뜀: 연속 실패 쿨다운 (최근 ${health.recentFailures}회)`);
                results.push({ company: crawler.name, jobs: [], count: 0, skipped: true, reason: health.reason });
                continue;
              }

              console.log(`🔍 ${crawler.name} 크롤링 시작...`);
              const startTime = Date.now();
              const jobs = await runWithRetry(() => crawler.fn(browser), crawler.name);
              const duration = ((Date.now() - startTime) / 1000).toFixed(2);

              console.log(`✅ ${crawler.name}: ${jobs.length}개 채용공고 수집 (${duration}초)`);
              results.push({ company: crawler.name, jobs, count: jobs.length });
            } catch (error) {
              console.error(`❌ ${crawler.name} 크롤링 실패:`, error.message);
              results.push({ company: crawler.name, jobs: [], count: 0, error: error.message });
            }
          }
        });

        await Promise.all(workers);
      } finally {
        if (browser) {
          await browser.close().catch(() => {});
          console.log('🌐 브라우저 종료');
        }
      }

      const totalJobs = results.reduce((sum, result) => sum + result.jobs.length, 0);
      console.log(`🎉 크롤링 완료! 총 ${totalJobs}개 채용공고 수집`);

      return results;
    } finally {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  const crawler = new WorkingCrawlers();
  crawler.crawlAll().then(results => {
    console.log('\n=== 크롤링 결과 요약 ===');
    results.forEach(result => {
      console.log(`${result.company}: ${result.count}개 공고`);
      if (result.error) {
        console.log(`  오류: ${result.error}`);
      }
    });
  });
}

module.exports = WorkingCrawlers;
