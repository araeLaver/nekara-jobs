const puppeteer = require('puppeteer');

async function crawlCoupang() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://www.coupang.jobs/kr/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 개발 관련 직군 필터
    try {
      await page.waitForSelector('[data-automation-id="searchField"]', { timeout: 5000 });
      await page.type('[data-automation-id="searchField"]', '개발');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    } catch (err) {
      console.log('쿠팡 검색 필터 적용 실패, 전체 검색 진행');
    }

    // 채용공고 목록 대기 (Workday 플랫폼)
    await page.waitForSelector('[data-automation-id="jobTitle"]', { timeout: 10000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('[data-automation-id="jobTitle"]');
      const jobList = [];

      jobElements.forEach(element => {
        try {
          const titleEl = element.querySelector('a, span');
          const parentContainer = element.closest('[data-automation-id*="job"]');
          const locationEl = parentContainer ? parentContainer.querySelector('[data-automation-id*="location"]') : null;
          const typeEl = parentContainer ? parentContainer.querySelector('[data-automation-id*="worktype"]') : null;
          const linkEl = element.querySelector('a');

          if (titleEl) {
            jobList.push({
              title: titleEl.textContent.trim(),
              description: '',
              location: locationEl ? locationEl.textContent.trim() : '',
              department: '',
              jobType: typeEl ? typeEl.textContent.trim() : '',
              originalUrl: linkEl ? linkEl.href : '',
              company: 'coupang',
              postedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('쿠팡 개별 채용공고 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`쿠팡에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('쿠팡 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlCoupang };