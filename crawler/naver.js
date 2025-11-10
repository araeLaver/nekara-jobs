const puppeteer = require('puppeteer');

async function crawlNaver() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    
    console.log('네이버 채용 사이트 접근 중...');
    await page.goto('https://recruit.navercorp.com/rcrt/list.do', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for the correct container for job listings
    await page.waitForSelector('ul.card_list', { timeout: 15000 });

    const jobs = await page.evaluate(() => {
      const jobList = [];
      const jobElements = document.querySelectorAll('ul.card_list li.card_item');

      jobElements.forEach(item => {
        try {
          const titleElement = item.querySelector('h4.card_title');
          const linkElement = item.querySelector('a.card_link');
          const infoElements = item.querySelectorAll('dl.card_info dd.info_text');

          if (!titleElement || !linkElement || infoElements.length < 4) return;

          const title = titleElement.textContent.trim();
          const onclickAttr = linkElement.getAttribute('onclick');
          const annoIdMatch = onclickAttr.match(/show\('(\d+)'\)/);
          if (!annoIdMatch) return;
          
          const annoId = annoIdMatch[1];
          const url = `https://recruit.navercorp.com/rcrt/view.do?annoId=${annoId}`;

          const department = infoElements[0]?.textContent.trim();
          const jobField = infoElements[1]?.textContent.trim(); // Not always dev-related
          const experience = infoElements[2]?.textContent.trim();
          const jobType = infoElements[3]?.textContent.trim();
          const deadline = infoElements[4]?.textContent.trim();

          const devKeywords = [
            'engineer', 'developer', '개발', '엔지니어', 'backend', 'frontend', 
            'android', 'ios', 'sre', 'devops', 'ai', 'ml', 'data', 'graphics', 'security'
          ];
          
          const isDevJob = devKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || 
            department.toLowerCase().includes(keyword) ||
            jobField.toLowerCase().includes(keyword)
          );

          if (isDevJob) {
            jobList.push({
              title,
              originalUrl: url,
              company: 'naver',
              jobType,
              experience,
              department,
              postedAt: new Date().toISOString(), // The page doesn't show post date easily
              description: `${title} @ ${department}`,
              location: '경기 성남시', // Default
            });
          }
        } catch (e) {
          console.error('네이버 개별 채용공고 파싱 오류:', e.message);
        }
      });
      return jobList;
    });

    console.log(`네이버에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('네이버 크롤링 중 심각한 오류 발생:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { crawlNaver };