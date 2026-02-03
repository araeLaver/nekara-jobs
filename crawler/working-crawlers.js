// 실제로 작동하는 크롤러들만 실행

const { crawlKakao } = require('./kakao');
const { crawlToss } = require('./toss');
const { crawlNexon } = require('./nexon');
const { crawlNaver } = require('./naver');
const { crawlLine } = require('./line');
const { crawlBaemin } = require('./baemin');
const { PrismaClient } = require('@prisma/client');

const DEFAULT_TIMEOUT_MS = Number(process.env.CRAWL_TIMEOUT_MS || 30000);
const MAX_CONCURRENCY = Number(process.env.CRAWL_CONCURRENCY || 3);
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
      console.warn(`?? ${label} ??? (${attempt}/${RETRY_COUNT})`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

class WorkingCrawlers {
  constructor() {
    this.crawlers = [
      { name: 'kakao', fn: crawlKakao },
      { name: 'toss', fn: crawlToss },
      { name: 'nexon', fn: crawlNexon },
      { name: 'naver', fn: crawlNaver },
      { name: 'line', fn: crawlLine },
      { name: 'baemin', fn: crawlBaemin }
    ];
  }

  async crawlAll() {
    console.log('? ??? ??? ?? ?? ?..');

    const results = [];
    let index = 0;
    const prisma = new PrismaClient();

    try {
      const workerCount = Math.min(MAX_CONCURRENCY, this.crawlers.length);
      const workers = Array.from({ length: workerCount }, async () => {
        while (index < this.crawlers.length) {
          const crawler = this.crawlers[index++];
          try {
            const health = await shouldSkipCrawler(prisma, crawler.name);
            if (health.skip) {
              console.warn(`?? ${crawler.name} ??: ?? ?? ?? (?? ${health.recentFailures}?)`);
              results.push({
                company: crawler.name,
                jobs: [],
                count: 0,
                skipped: true,
                reason: health.reason
              });
              continue;
            }

            console.log(`?? ${crawler.name} ??? ??...`);
            const startTime = Date.now();
            const jobs = await runWithRetry(crawler.fn, crawler.name);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log(`? ${crawler.name}: ${jobs.length}? ???? ?? (${duration}?)`);
            results.push({ company: crawler.name, jobs, count: jobs.length });
          } catch (error) {
            console.error(`? ${crawler.name} ??? ??:`, error.message);
            results.push({ company: crawler.name, jobs: [], count: 0, error: error.message });
          }
        }
      });

      await Promise.all(workers);

      const totalJobs = results.reduce((sum, result) => sum + result.jobs.length, 0);
      console.log(`?? ??? ??! ? ${totalJobs}? ???? ??`);

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