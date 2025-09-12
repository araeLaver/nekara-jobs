const { crawlNaver } = require('./naver');
const { crawlKakao } = require('./kakao');
const { crawlLine } = require('./line');
const { crawlCoupang } = require('./coupang');
const { crawlBaemin } = require('./baemin');
const { crawlToss } = require('./toss');
const { crawlCarrot } = require('./carrot');
const { crawlNexon } = require('./nexon');
const { crawlKrafton } = require('./krafton');
const crawlBucketplace = require('./bucketplace');
const crawlZigbang = require('./zigbang');
const cron = require('node-cron');

class JobCrawler {
  constructor() {
    this.crawlers = [
      { name: 'naver', fn: crawlNaver },
      { name: 'kakao', fn: crawlKakao },
      { name: 'line', fn: crawlLine },
      { name: 'coupang', fn: crawlCoupang },
      { name: 'baemin', fn: crawlBaemin },
      { name: 'toss', fn: crawlToss },
      { name: 'carrot', fn: crawlCarrot },
      { name: 'nexon', fn: crawlNexon },
      { name: 'krafton', fn: crawlKrafton },
      { name: 'bucketplace', fn: crawlBucketplace },
      { name: 'zigbang', fn: crawlZigbang }
    ];
  }

  async crawlAll() {
    console.log('🚀 채용정보 크롤링 시작...');
    const results = [];

    for (const crawler of this.crawlers) {
      try {
        console.log(`📊 ${crawler.name} 크롤링 중...`);
        const jobs = await crawler.fn();
        results.push({ company: crawler.name, jobs, count: jobs.length });
        console.log(`✅ ${crawler.name}: ${jobs.length}개 채용공고 수집`);
        
        // 요청 간격 조절 (2초)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ ${crawler.name} 크롤링 실패:`, error.message);
        results.push({ company: crawler.name, jobs: [], error: error.message });
      }
    }

    const totalJobs = results.reduce((sum, result) => sum + result.jobs.length, 0);
    console.log(`🎉 크롤링 완료! 총 ${totalJobs}개 채용공고 수집`);
    
    return results;
  }

  async crawlSingle(company) {
    const crawler = this.crawlers.find(c => c.name === company);
    if (!crawler) {
      throw new Error(`지원하지 않는 회사: ${company}`);
    }

    console.log(`📊 ${company} 크롤링 중...`);
    const jobs = await crawler.fn();
    console.log(`✅ ${company}: ${jobs.length}개 채용공고 수집`);
    
    return jobs;
  }

  startScheduler() {
    // 매일 오전 9시와 오후 6시에 크롤링 실행
    cron.schedule('0 9,18 * * *', async () => {
      console.log('⏰ 스케줄된 크롤링 시작');
      await this.crawlAll();
    });

    console.log('⏰ 크롤링 스케줄러 시작됨 (매일 09:00, 18:00)');
  }
}

// 직접 실행 시
if (require.main === module) {
  const crawler = new JobCrawler();
  
  if (process.argv[2] === 'schedule') {
    crawler.startScheduler();
  } else if (process.argv[2]) {
    crawler.crawlSingle(process.argv[2]);
  } else {
    crawler.crawlAll();
  }
}

module.exports = JobCrawler;