const puppeteer = require('puppeteer');

async function crawlCarrot() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br'
    });
    
    await page.setViewport({ width: 1366, height: 768 });
    
    console.log('당근 채용 사이트 접근 중...');
    
    await page.goto('https://about.daangn.com/jobs/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    const jobs = await page.evaluate(() => {
      const jobList = [];
      const seenTitles = new Set();
      
      const possibleSelectors = [
        '.job-item',
        '.position-item',
        '.career-item',
        '[class*="job"]',
        '[class*="position"]',
        '[class*="career"]',
        'article',
        '.card',
        '.post'
      ];
      
      let jobElements = [];
      
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          jobElements = elements;
          console.log(`당근 사용된 셀렉터: ${selector}, 찾은 요소 수: ${elements.length}`);
          break;
        }
      }
      
      if (jobElements.length === 0) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('개발자') || text.includes('Engineer') || text.includes('Developer') || 
              text.includes('프로그래머') || text.includes('백엔드') || text.includes('프론트엔드') ||
              text.includes('소프트웨어') || text.includes('Software') || text.includes('안드로이드') ||
              text.includes('iOS') || text.includes('데이터')) {
            if (text.length < 300 && el.children.length < 15) {
              jobElements.push(el);
            }
          }
        });
      }

      Array.from(jobElements).forEach(element => {
        try {
          let title = '';
          const titleSelectors = [
            '.job-title', '.position-title', '.title',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '[class*="title"]', '[class*="name"]',
            'strong', 'b', 'a'
          ];
          
          for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
              title = titleEl.textContent.trim();
              break;
            }
          }
          
          if (!title && element.textContent && element.textContent.trim().length < 150) {
            title = element.textContent.trim();
          }

          if (title && title.length > 3 && title.length < 200) {
            title = title.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
            
            const developmentKeywords = [
              'software', 'developer', 'engineer', 'programming',
              'frontend', 'backend', 'fullstack', 'full-stack',
              '개발', '엔지니어', '프로그래머', 'sw', '소프트웨어',
              'android', 'ios', 'mobile', 'web', 'server',
              'data', 'ai', 'ml', 'devops', 'infrastructure',
              'security', 'platform', 'system', '안드로이드'
            ];
            
            const isDevJob = developmentKeywords.some(keyword => 
              title.toLowerCase().includes(keyword)
            );

            if (isDevJob && !seenTitles.has(title)) {
              seenTitles.add(title);
              
              const descEl = element.querySelector('.description, .desc, .content, p, [class*="desc"]');
              const locationEl = element.querySelector('.location, .addr, [class*="location"]');
              const typeEl = element.querySelector('.job-type, .employment-type, [class*="type"]');
              
              const linkEl = element.querySelector('a[href]') || element.closest('a[href]');
              let url = 'https://about.daangn.com/jobs/';
              if (linkEl) {
                const href = linkEl.getAttribute('href');
                if (href) {
                  url = href.startsWith('http') ? href : `https://about.daangn.com${href}`;
                }
              }

              jobList.push({
                title: title,
                description: descEl ? descEl.textContent.trim().substring(0, 500) : '',
                location: locationEl ? locationEl.textContent.trim() : '서울시 송파구',
                department: '개발부문',
                jobType: typeEl ? typeEl.textContent.trim() : '정규직',
                experience: '',
                originalUrl: url,
                company: 'carrot',
                postedAt: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.error('당근 개별 요소 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`당근에서 ${jobs.length}개 채용공고 수집 완료`);
    return jobs;

  } catch (error) {
    console.error('당근 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlCarrot };