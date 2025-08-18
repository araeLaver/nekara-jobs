const puppeteer = require('puppeteer');

async function crawlBaemin() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://www.woowahan.com/jobs', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 개발 직군 필터
    try {
      await page.waitForSelector('.category-filter', { timeout: 5000 });
      const devFilter = await page.$('button[data-category*="개발"], button[data-category*="Development"]');
      if (devFilter) {
        await devFilter.click();
        await page.waitForTimeout(2000);
      }
    } catch (err) {
      console.log('배민 개발 필터 적용 실패, 전체 검색 진행');
    }

    // 채용공고 목록 대기
    await page.waitForSelector('.job-card, .job-item', { timeout: 10000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-card, .job-item');
      const jobList = [];

      jobElements.forEach(element => {
        try {
          const titleEl = element.querySelector('.job-title, h3');
          const teamEl = element.querySelector('.team-name, .department');
          const locationEl = element.querySelector('.location, .job-location');
          const typeEl = element.querySelector('.employment-type, .job-type');
          const linkEl = element.querySelector('a');

          if (titleEl) {
            jobList.push({
              title: titleEl.textContent.trim(),
              description: '',
              location: locationEl ? locationEl.textContent.trim() : '',
              department: teamEl ? teamEl.textContent.trim() : '',
              jobType: typeEl ? typeEl.textContent.trim() : '',
              originalUrl: linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : 'https://www.woowahan.com' + linkEl.getAttribute('href')) : '',
              company: 'baemin',
              postedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('배민 개별 채용공고 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`배민에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('배민 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlBaemin };