const puppeteer = require('puppeteer');

async function crawlLine() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('라인 채용 사이트 접근 중...');
    await page.goto('https://careers.linecorp.com/ko/jobs', {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    // Wait for the job count to be updated from "0개"
    try {
      await page.waitForFunction(
        () => !document.querySelector('p.text_result > span')?.innerText.startsWith('0'),
        { timeout: 15000 }
      );
    } catch (e) {
      console.log('라인: 채용공고 개수 업데이트를 기다리는 데 실패했습니다. 공고가 없거나 페이지 구조가 변경되었을 수 있습니다.');
      // If it times out, there might be no jobs, so we can proceed and let it return 0.
    }

    // Wait for the list to be populated
    await page.waitForSelector('ul.job_list li a', { timeout: 10000 }).catch(() => {
      console.log('라인: 채용공고 목록(ul.job_list li a)을 찾지 못했습니다.');
    });

    const jobs = await page.evaluate(() => {
      const jobList = [];
      const jobElements = document.querySelectorAll('ul.job_list li');

      jobElements.forEach(element => {
        try {
          const linkElement = element.querySelector('a');
          const titleElement = element.querySelector('.title');
          
          if (!linkElement || !titleElement) return;

          const title = titleElement.textContent.trim();
          const url = new URL(linkElement.getAttribute('href'), 'https://careers.linecorp.com').href;
          
          const devKeywords = [
            'engineer', 'developer', 'programming', 'software', '개발', '엔지니어', 
            'frontend', 'backend', 'platform', 'android', 'ios', 'web', 'server', 
            'data', 'ai', 'ml', 'security', 'devops'
          ];

          const isDevJob = devKeywords.some(keyword =>
            title.toLowerCase().includes(keyword.toLowerCase())
          );

          if (isDevJob) {
            const company = element.querySelector('.company')?.textContent.trim() || 'LINE';
            const location = element.querySelector('.location')?.textContent.trim() || '한국';
            
            jobList.push({
              title,
              originalUrl: url,
              company: 'line', // The main company is line
              description: `${title} @ ${company}`,
              location,
              jobType: '정규직',
              postedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('라인 요소 파싱 오류:', err.message);
        }
      });
      return jobList;
    });

    console.log(`라인에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('라인 크롤링 오류:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { crawlLine };
