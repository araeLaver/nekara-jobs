const puppeteer = require('puppeteer');

async function crawlCoupang() {
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
    
    // 더 현실적인 User-Agent와 헤더 설정
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br'
    });
    
    await page.setViewport({ width: 1366, height: 768 });
    
    console.log('쿠팡 채용 사이트 접근 중...');
    
    // 쿠팡 채용 사이트로 이동
    await page.goto('https://www.coupang.jobs/kr/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 페이지 로딩 대기
    await page.waitForTimeout(5000);

    // 채용공고 데이터 수집
    const jobs = await page.evaluate(() => {
      const jobList = [];
      const seenTitles = new Set();
      
      // 다양한 셀렉터로 채용공고 요소 찾기
      const possibleSelectors = [
        '[data-automation-id="jobTitle"]',
        '.job-item',
        '.position-item',
        '.career-item',
        '[class*="job"]',
        '[class*="position"]',
        'article',
        '.card'
      ];
      
      let jobElements = [];
      
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          jobElements = elements;
          console.log(`쿠팡 사용된 셀렉터: ${selector}, 찾은 요소 수: ${elements.length}`);
          break;
        }
      }
      
      // Workday 플랫폼 특화 셀렉터 시도
      if (jobElements.length === 0) {
        const workdaySelectors = [
          '[data-automation-id*="job"]',
          '[data-automation-id*="title"]',
          '[role="gridcell"]',
          '.WKPB',
          '.WJPB'
        ];
        
        for (const selector of workdaySelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            jobElements = elements;
            console.log(`쿠팡 Workday 셀렉터 사용: ${selector}, 찾은 요소 수: ${elements.length}`);
            break;
          }
        }
      }
      
      // 일반적인 채용공고 키워드로 검색
      if (jobElements.length === 0) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('Software') || text.includes('Developer') || text.includes('Engineer') || 
              text.includes('개발자') || text.includes('엔지니어') || text.includes('프로그래머')) {
            if (text.length < 300 && el.children.length < 15) {
              jobElements.push(el);
            }
          }
        });
      }

      Array.from(jobElements).forEach(element => {
        try {
          // 제목 추출 - 다양한 방법 시도
          let title = '';
          const titleSelectors = [
            'a', 'span', 'div',
            '.job-title', '.position-title', '.title',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '[class*="title"]', '[class*="name"]',
            'strong', 'b'
          ];
          
          for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
              title = titleEl.textContent.trim();
              break;
            }
          }
          
          // 요소 자체의 텍스트가 적절하면 사용
          if (!title && element.textContent && element.textContent.trim().length < 150) {
            title = element.textContent.trim();
          }

          if (title && title.length > 3 && title.length < 200) {
            // 텍스트 정리
            title = title.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
            
            // 개발 관련 키워드 확인
            const developmentKeywords = [
              'software', 'developer', 'engineer', 'programming',
              'frontend', 'backend', 'fullstack', 'full-stack',
              '개발', '엔지니어', '프로그래머', 'sw', '소프트웨어',
              'android', 'ios', 'mobile', 'web', 'server',
              'data', 'ai', 'ml', 'devops', 'infrastructure',
              'security', 'embedded', 'platform', 'system'
            ];
            
            const isDevJob = developmentKeywords.some(keyword => 
              title.toLowerCase().includes(keyword)
            );

            if (isDevJob && !seenTitles.has(title)) {
              seenTitles.add(title);
              
              // 추가 정보 추출 - 부모 컨테이너에서 찾기
              const parentContainer = element.closest('[data-automation-id*="job"]') || 
                                   element.closest('tr') || 
                                   element.closest('.job-item') ||
                                   element.closest('article');
              
              let location = '';
              let jobType = '';
              let department = '';
              
              if (parentContainer) {
                const locationSelectors = [
                  '[data-automation-id*="location"]',
                  '.location', '.addr', '[class*="location"]', '[class*="addr"]'
                ];
                
                for (const selector of locationSelectors) {
                  const locationEl = parentContainer.querySelector(selector);
                  if (locationEl && locationEl.textContent) {
                    location = locationEl.textContent.trim();
                    break;
                  }
                }
                
                const typeSelectors = [
                  '[data-automation-id*="worktype"]',
                  '[data-automation-id*="employment"]',
                  '.job-type', '.employment-type', '[class*="type"]'
                ];
                
                for (const selector of typeSelectors) {
                  const typeEl = parentContainer.querySelector(selector);
                  if (typeEl && typeEl.textContent) {
                    jobType = typeEl.textContent.trim();
                    break;
                  }
                }
                
                const deptSelectors = [
                  '[data-automation-id*="department"]',
                  '.department', '.team', '[class*="dept"]', '[class*="team"]'
                ];
                
                for (const selector of deptSelectors) {
                  const deptEl = parentContainer.querySelector(selector);
                  if (deptEl && deptEl.textContent) {
                    department = deptEl.textContent.trim();
                    break;
                  }
                }
              }
              
              // 링크 추출
              const linkEl = element.querySelector('a[href]') || element.closest('a[href]');
              let url = 'https://www.coupang.jobs/kr/';
              if (linkEl) {
                const href = linkEl.getAttribute('href');
                if (href) {
                  url = href.startsWith('http') ? href : `https://www.coupang.jobs${href}`;
                }
              }

              jobList.push({
                title: title,
                description: '',
                location: location || '서울시',
                department: department || '개발부문',
                jobType: jobType || '정규직',
                experience: '',
                originalUrl: url,
                company: 'coupang',
                postedAt: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.error('쿠팡 개별 요소 파싱 오류:', err);
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