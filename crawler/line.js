const puppeteer = require('puppeteer');

async function crawlLine() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://careers.linecorp.com/ko/jobs', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 개발 관련 필터 적용
    try {
      await page.waitForSelector('[data-testid="job-category-filter"]', { timeout: 5000 });
      await page.click('[data-testid="job-category-filter"]');
      await page.waitForTimeout(1000);
      
      // 개발 카테고리 선택
      const devCategory = await page.$('input[value*="Development"], input[value*="개발"]');
      if (devCategory) {
        await devCategory.click();
        await page.waitForTimeout(2000);
      }
    } catch (err) {
      console.log('라인 개발 필터 적용 실패, 전체 검색 진행');
    }

    // 채용공고 목록 대기
    await page.waitForSelector('[data-testid="job-item"]', { timeout: 10000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('[data-testid="job-item"]');
      const jobList = [];

      jobElements.forEach(element => {
        try {
          const titleEl = element.querySelector('h3, .job-title');
          const locationEl = element.querySelector('[data-testid="job-location"]');
          const teamEl = element.querySelector('[data-testid="job-team"]');
          const typeEl = element.querySelector('[data-testid="job-type"]');
          const linkEl = element.querySelector('a');

          if (titleEl) {
            jobList.push({
              title: titleEl.textContent.trim(),
              description: '',
              location: locationEl ? locationEl.textContent.trim() : '',
              department: teamEl ? teamEl.textContent.trim() : '',
              jobType: typeEl ? typeEl.textContent.trim() : '',
              originalUrl: linkEl ? linkEl.href : '',
              company: 'line',
              postedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('라인 개별 채용공고 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`라인에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('라인 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlLine };