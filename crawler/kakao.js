const puppeteer = require('puppeteer');

async function crawlKakao() {
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
    
    console.log('카카오 채용 사이트 접근 중...');
    
    // 카카오 채용 사이트로 이동
    await page.goto('https://careers.kakao.com/jobs', {
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
        '.list-item',
        '.job-item',
        '.career-item',
        '.position-item',
        'article',
        '.card',
        '[class*="job"]',
        '[class*="career"]'
      ];
      
      let jobElements = [];
      
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          jobElements = elements;
          console.log(`카카오 사용된 셀렉터: ${selector}, 찾은 요소 수: ${elements.length}`);
          break;
        }
      }
      
      // 일반적인 채용공고 키워드로 검색
      if (jobElements.length === 0) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('개발자') || text.includes('Engineer') || text.includes('Developer') || 
              text.includes('프로그래머') || text.includes('백엔드') || text.includes('프론트엔드')) {
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
            '.link-text', '.job-title', '.position-title', '.title',
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
          
          // 요소 자체의 텍스트가 짧고 적절하면 사용
          if (!title && element.textContent && element.textContent.trim().length < 100) {
            title = element.textContent.trim();
          }

          if (title && title.length > 2 && title.length < 150) {
            // 텍스트 정리
            title = title.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
            
            // 개발 관련 키워드 확인
            const developmentKeywords = [
              'frontend', 'backend', 'fullstack', 'full-stack',
              'developer', 'engineer', 'programming', 'software',
              '개발', '엔지니어', '프로그래머', 'sw', '소프트웨어',
              'android', 'ios', 'mobile', 'web', 'server',
              'data', 'ai', 'ml', 'devops', 'infrastructure',
              'security', 'embedded', 'graphics', '백엔드', '프론트엔드'
            ];
            
            const isDevJob = developmentKeywords.some(keyword => 
              title.toLowerCase().includes(keyword)
            );

            if (isDevJob && !seenTitles.has(title)) {
              seenTitles.add(title);
              
              // 추가 정보 추출
              const companyEl = element.querySelector('.team-name, .department, .company, [class*="team"], [class*="dept"]');
              const locationEl = element.querySelector('.location, .addr, [class*="location"], [class*="addr"]');
              const typeEl = element.querySelector('.employment-type, .job-type, .type, [class*="type"]');
              const descEl = element.querySelector('.description, .desc, .content, p, [class*="desc"]');
              
              // 링크 추출
              const linkEl = element.querySelector('a[href]') || element.closest('a[href]');
              let url = 'https://careers.kakao.com/jobs';
              if (linkEl) {
                const href = linkEl.getAttribute('href');
                if (href) {
                  url = href.startsWith('http') ? href : `https://careers.kakao.com${href}`;
                }
              }

              jobList.push({
                title: title,
                description: descEl ? descEl.textContent.trim().substring(0, 500) : '',
                location: locationEl ? locationEl.textContent.trim() : '서울시 판교',
                department: companyEl ? companyEl.textContent.trim() : '개발부문',
                jobType: typeEl ? typeEl.textContent.trim() : '정규직',
                experience: '',
                originalUrl: url,
                company: 'kakao',
                postedAt: new Date().toISOString(),
                detailLink: url
              });
            }
          }
        } catch (err) {
          console.error('카카오 개별 요소 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`카카오에서 ${jobs.length}개 채용공고 기본 정보 수집 완료`);
    
    // 상세 내용 크롤링 (모든 공고)
    const detailedJobs = [];
    const jobsToDetail = jobs; // 모든 공고 크롤링으로 변경

    console.log(`카카오 ${jobsToDetail.length}개 채용공고 상세 내용 수집 중...`);
    
    for (const job of jobsToDetail) {
      try {
        if (job.detailLink && job.detailLink.startsWith('http')) {
          console.log(`카카오 상세 크롤링: ${job.title}`);
          
          const detailPage = await browser.newPage();
          await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
          
          try {
            await detailPage.goto(job.detailLink, {
              waitUntil: 'domcontentloaded',
              timeout: 15000
            });
            
            await detailPage.waitForTimeout(3000);
            
            const detailContent = await detailPage.evaluate(() => {
              const contentSelectors = [
                '.job-description',
                '.content',
                '.detail-content',
                '[class*="description"]',
                '[class*="detail"]',
                'main',
                'article'
              ];
              
              let description = '';
              let requirements = '';
              
              for (const selector of contentSelectors) {
                const contentEl = document.querySelector(selector);
                if (contentEl && contentEl.textContent && contentEl.textContent.trim().length > 100) {
                  const fullText = contentEl.textContent.trim();
                  
                  if (fullText.includes('자격요건') || fullText.includes('지원자격')) {
                    const parts = fullText.split(/자격요건|지원자격|우대사항/i);
                    description = parts[0] ? parts[0].trim() : fullText;
                    requirements = parts[1] ? parts[1].trim().substring(0, 1000) : '';
                  } else if (fullText.includes('업무내용')) {
                    const parts = fullText.split(/업무내용/i);
                    description = parts[1] ? parts[1].trim() : fullText;
                  } else {
                    description = fullText;
                  }
                  
                  break;
                }
              }
              
              return {
                description: description.substring(0, 2000),
                requirements: requirements.substring(0, 1000)
              };
            });
            
            if (detailContent.description && detailContent.description.length > 50) {
              job.description = detailContent.description;
              job.requirements = detailContent.requirements || '';
            }
            
          } catch (detailError) {
            console.log(`카카오 상세 크롤링 실패 (${job.title}):`, detailError.message);
          } finally {
            await detailPage.close();
          }
        }
        
        detailedJobs.push(job);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`카카오 상세 크롤링 오류 (${job.title}):`, error.message);
        detailedJobs.push(job);
      }
    }
    
    const remainingJobs = jobs.slice(Math.min(5, jobs.length));
    const finalJobs = [...detailedJobs, ...remainingJobs];

    console.log(`카카오에서 총 ${finalJobs.length}개 채용공고 수집 완료 (상세: ${detailedJobs.length}개)`);
    return finalJobs;

  } catch (error) {
    console.error('카카오 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlKakao };