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
    console.log('🚀 검증된 크롤러만 실행 중...');
    const results = [];

    for (const crawler of this.crawlers) {
      try {
        console.log(`📊 ${crawler.name} 크롤링 중...`);
        const jobs = await crawler.fn();
        results.push({ company: crawler.name, jobs, count: jobs.length });
        console.log(`✅ ${crawler.name}: ${jobs.length}개 채용공고 수집`);

        // 요청 간격 조절
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`❌ ${crawler.name} 크롤링 실패:`, error.message);
        results.push({ company: crawler.name, jobs: [], error: error.message });
      }
    }

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