// 실제로 작동하는 크롤러들만 실행

const { crawlKakao } = require('./kakao');
const { crawlToss } = require('./toss');
const { crawlNexon } = require('./nexon');
const { crawlNaver } = require('./naver');
const { crawlLine } = require('./line');
const { crawlBaemin } = require('./baemin');

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
    console.log('🚀 검증된 크롤러 병렬 실행 중...');

    // 병렬로 모든 크롤러 실행
    const crawlerPromises = this.crawlers.map(async (crawler) => {
      try {
        console.log(`📊 ${crawler.name} 크롤링 시작...`);
        const startTime = Date.now();
        const jobs = await crawler.fn();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`✅ ${crawler.name}: ${jobs.length}개 채용공고 수집 (${duration}초)`);
        return { company: crawler.name, jobs, count: jobs.length };
      } catch (error) {
        console.error(`❌ ${crawler.name} 크롤링 실패:`, error.message);
        return { company: crawler.name, jobs: [], count: 0, error: error.message };
      }
    });

    // 모든 크롤러가 완료될 때까지 대기
    const results = await Promise.all(crawlerPromises);

    const totalJobs = results.reduce((sum, result) => sum + result.jobs.length, 0);
    console.log(`🎉 크롤링 완료! 총 ${totalJobs}개 채용공고 수집`);

    return results;
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