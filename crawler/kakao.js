const puppeteer = require('puppeteer');

async function crawlKakao() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://careers.kakao.com/jobs', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 개발 직군 필터 클릭
    try {
      await page.waitForSelector('[data-category="개발"]', { timeout: 5000 });
      await page.click('[data-category="개발"]');
      await page.waitForTimeout(2000);
    } catch (err) {
      console.log('카카오 개발 필터 클릭 실패, 전체 검색 진행');
    }

    // 채용공고 목록 대기
    await page.waitForSelector('.list-item', { timeout: 10000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.list-item');
      const jobList = [];

      jobElements.forEach(element => {
        try {
          const titleEl = element.querySelector('.link-text');
          const companyEl = element.querySelector('.team-name');
          const locationEl = element.querySelector('.location');
          const typeEl = element.querySelector('.employment-type');
          const linkEl = element.querySelector('a');

          if (titleEl) {
            jobList.push({
              title: titleEl.textContent.trim(),
              description: '',
              location: locationEl ? locationEl.textContent.trim() : '',
              department: companyEl ? companyEl.textContent.trim() : '',
              jobType: typeEl ? typeEl.textContent.trim() : '',
              originalUrl: linkEl ? 'https://careers.kakao.com' + linkEl.getAttribute('href') : '',
              company: 'kakao',
              postedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('카카오 개별 채용공고 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`카카오에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('카카오 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlKakao };