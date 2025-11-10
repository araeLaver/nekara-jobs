const puppeteer = require('puppeteer');

async function crawlBaemin() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    console.log('배민 채용 사이트 접근 중...');

    // 배민 채용 페이지로 이동
    await page.goto('https://career.woowahan.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 다양한 셀렉터로 채용공고 요소 찾기
    const jobs = await page.evaluate(() => {
      const jobList = [];

      // 가능한 셀렉터들
      const selectors = [
        '.job-list .job-item',
        '.career-list .career-item',
        '.position-list .position-item',
        '[data-testid*="job"]',
        '.recruitment-item',
        'article',
        '.card',
        'li',
        'div[class*="job"]',
        'div[class*="career"]'
      ];

      let jobElements = [];

      // 적절한 셀렉터 찾기
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          jobElements = Array.from(elements);
          console.log(`배민: ${selector} 사용, ${elements.length}개 요소 발견`);
          break;
        }
      }

      // 텍스트 기반으로 개발 관련 요소 찾기
      if (jobElements.length === 0) {
        const allElements = document.querySelectorAll('div, article, section, li');
        Array.from(allElements).forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          if ((text.includes('developer') || text.includes('engineer') || text.includes('개발') ||
               text.includes('frontend') || text.includes('backend') || text.includes('서버')) &&
              text.length > 10 && text.length < 500 && el.children.length < 10) {
            jobElements.push(el);
          }
        });
        console.log(`배민: 텍스트 기반으로 ${jobElements.length}개 요소 발견`);
      }

      // 채용공고 데이터 추출
      const seenTitles = new Set();

      jobElements.forEach(element => {
        try {
          // 제목 추출
          let title = '';
          const titleSelectors = ['h1', 'h2', 'h3', 'h4', '.title', '[class*="title"]', 'strong', 'a'];

          for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl && titleEl.textContent.trim()) {
              title = titleEl.textContent.trim();
              break;
            }
          }

          if (!title && element.textContent.trim().length < 100) {
            title = element.textContent.trim().split('\n')[0];
          }

          if (title && title.length > 3 && title.length < 150 && !seenTitles.has(title)) {
            seenTitles.add(title);

            // 링크 추출
            const linkEl = element.querySelector('a[href]') || element.closest('a[href]');
            let url = 'https://career.woowahan.com/';
            if (linkEl) {
              const href = linkEl.getAttribute('href');
              if (href) {
                url = href.startsWith('http') ? href : `https://career.woowahan.com${href}`;
              }
            }

            // 부서/팀 정보 추출
            let department = '개발팀';
            const deptSelectors = ['.team', '.department', '[class*="team"]', '[class*="dept"]'];
            for (const selector of deptSelectors) {
              const deptEl = element.querySelector(selector);
              if (deptEl && deptEl.textContent.trim()) {
                department = deptEl.textContent.trim();
                break;
              }
            }

            jobList.push({
              title: title,
              description: `${title} 채용공고입니다. 배달의민족에서 함께할 개발자를 찾고 있습니다.`,
              location: '서울',
              department: department,
              experience: '',
              jobType: '정규직',
              originalUrl: url,
              company: 'baemin',
              postedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('배민 요소 파싱 오류:', err);
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