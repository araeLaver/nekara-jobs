const puppeteer = require('puppeteer');

async function crawlNaver() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 네이버 채용 메인 페이지로 이동
    await page.goto('https://recruit.navercorp.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    // 개발자 관련 필터 또는 전체 채용공고 확인
    try {
      // 개발 관련 카테고리 클릭 시도
      const devButton = await page.$('button[data-category*="개발"], button[data-category*="Development"], a[href*="developer"]');
      if (devButton) {
        await devButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (err) {
      console.log('네이버 개발 카테고리 버튼을 찾을 수 없음, 전체 검색 진행');
    }

    // .job 셀렉터 대기
    await page.waitForSelector('.job', { timeout: 10000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job');
      const jobList = [];

      jobElements.forEach(element => {
        try {
          // 다양한 셀렉터 시도
          const titleEl = element.querySelector('h3, h4, .title, .job-title, [class*="title"]') ||
                          element.querySelector('a') ||
                          element;
          
          const descEl = element.querySelector('.description, .desc, .job-desc, p');
          const linkEl = element.querySelector('a');
          
          if (titleEl && titleEl.textContent.trim()) {
            const title = titleEl.textContent.trim();
            
            // 개발 관련 채용공고만 필터링
            const isDevJob = title.toLowerCase().includes('개발') ||
                           title.toLowerCase().includes('developer') ||
                           title.toLowerCase().includes('engineer') ||
                           title.toLowerCase().includes('엔지니어') ||
                           title.toLowerCase().includes('프로그래머') ||
                           title.toLowerCase().includes('frontend') ||
                           title.toLowerCase().includes('backend') ||
                           title.toLowerCase().includes('fullstack');

            if (isDevJob) {
              jobList.push({
                title: title,
                description: descEl ? descEl.textContent.trim() : '',
                location: '경기 성남시 분당구', // 네이버 본사 위치
                department: '개발부문',
                originalUrl: linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : 'https://recruit.navercorp.com' + linkEl.getAttribute('href')) : 'https://recruit.navercorp.com/',
                company: 'naver',
                postedAt: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.error('네이버 개별 채용공고 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`네이버에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('네이버 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlNaver };