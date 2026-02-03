const cron = require('node-cron');
const { main: runAllCrawlers, saveJobsToDatabase } = require('../crawler/main-crawler');
const { crawlNaver } = require('../crawler/naver');
const { crawlKakao } = require('../crawler/kakao');
const { crawlLine } = require('../crawler/line');
const { crawlCoupang } = require('../crawler/coupang');
const { crawlBaemin } = require('../crawler/baemin');
const { crawlToss } = require('../crawler/toss');
const { crawlCarrot } = require('../crawler/carrot');
const { crawlNexon } = require('../crawler/nexon');
const { crawlKrafton } = require('../crawler/krafton');
const crawlBucketplace = require('../crawler/bucketplace');
const crawlZigbang = require('../crawler/zigbang');

const CRAWLER_MAP = {
  naver: { fn: crawlNaver, label: 'naver' },
  kakao: { fn: crawlKakao, label: 'kakao' },
  line: { fn: crawlLine, label: 'line' },
  coupang: { fn: crawlCoupang, label: 'coupang' },
  baemin: { fn: crawlBaemin, label: 'baemin' },
  toss: { fn: crawlToss, label: 'toss' },
  carrot: { fn: crawlCarrot, label: 'carrot' },
  nexon: { fn: crawlNexon, label: 'nexon' },
  krafton: { fn: crawlKrafton, label: 'krafton' },
  bucketplace: { fn: crawlBucketplace, label: 'bucketplace' },
  zigbang: { fn: crawlZigbang, label: 'zigbang' }
};

class JobScheduler {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.job = null;
  }

  async runManualCrawling(company) {
    const target = company ? String(company).toLowerCase() : null;

    if (!target) {
      this._notifyStatus({ status: 'running', scope: 'all' });
      await runAllCrawlers();
      this._notifyStatus({ status: 'completed', scope: 'all' });
      return { scope: 'all' };
    }

    const crawler = CRAWLER_MAP[target];
    if (!crawler) {
      const error = `Unknown company crawler: ${company}`;
      this._notifyStatus({ status: 'failed', scope: 'single', company: target, error });
      throw new Error(error);
    }

    this._notifyStatus({ status: 'running', scope: 'single', company: target });
    const jobs = await crawler.fn();
    const result = await saveJobsToDatabase(jobs, crawler.label);
    this._notifyStatus({ status: 'completed', scope: 'single', company: target, result });
    return { scope: 'single', company: target, ...result };
  }

  startScheduledCrawling() {
    if (process.env.ENABLE_LOCAL_SCHEDULER !== 'true') {
      return;
    }

    const cronExpr = process.env.CRAWL_CRON || '0 9,18 * * *';

    this.job = cron.schedule(cronExpr, async () => {
      try {
        this._notifyStatus({ status: 'running', scope: 'all', source: 'local-cron' });
        await runAllCrawlers();
        this._notifyStatus({ status: 'completed', scope: 'all', source: 'local-cron' });
      } catch (error) {
        this._notifyStatus({
          status: 'failed',
          scope: 'all',
          source: 'local-cron',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  _notifyStatus(payload) {
    if (this.wsServer && typeof this.wsServer.notifyCrawlingStatus === 'function') {
      this.wsServer.notifyCrawlingStatus({
        timestamp: new Date().toISOString(),
        ...payload
      });
    }
  }
}

module.exports = JobScheduler;
