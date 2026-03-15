const { getBrowser, IS_VERCEL } = require('./browser');

async function crawlToss(sharedBrowser) {
  const browser = sharedBrowser || await getBrowser();

  try {
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br'
    });

    await page.setViewport({ width: 1366, height: 768 });

    console.log('토스 채용 사이트 접근 중...');

    await page.goto('https://toss.im/career/jobs', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(r => setTimeout(r, IS_VERCEL ? 3000 : 5000));

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
        '.card'
      ];

      let jobElements = [];

      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          jobElements = elements;
          console.log(`토스 사용된 셀렉터: ${selector}, 찾은 요소 수: ${elements.length}`);
          break;
        }
      }

      if (jobElements.length === 0) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('개발자') || text.includes('Engineer') || text.includes('Developer') ||
              text.includes('프로그래머') || text.includes('백엔드') || text.includes('프론트엔드') ||
              text.includes('소프트웨어') || text.includes('Software')) {
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
              'security', 'platform', 'system'
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
              let url = 'https://toss.im/career/jobs';
              if (linkEl) {
                const href = linkEl.getAttribute('href');
                if (href) {
                  url = href.startsWith('http') ? href : `https://toss.im${href}`;
                }
              }

              jobList.push({
                title: title,
                description: descEl ? descEl.textContent.trim().substring(0, 500) : '',
                location: locationEl ? locationEl.textContent.trim() : '서울시 강남구',
                department: '개발부문',
                jobType: typeEl ? typeEl.textContent.trim() : '정규직',
                experience: '',
                originalUrl: url,
                company: 'toss',
                postedAt: new Date().toISOString(),
                detailLink: url
              });
            }
          }
        } catch (err) {
          console.error('토스 개별 요소 파싱 오류:', err);
        }
      });

      return jobList;
    });

    console.log(`토스에서 ${jobs.length}개 채용공고 기본 정보 수집 완료`);

    // Vercel 환경에서는 상세 크롤링 건너뜀 (타임아웃 방지)
    if (IS_VERCEL) {
      console.log(`토스에서 총 ${jobs.length}개 채용공고 수집 완료 (Vercel: 상세 크롤링 생략)`);
      return jobs;
    }

    // 상세 내용 크롤링 (모든 공고)
    const detailedJobs = [];
    const jobsToDetail = jobs;

    console.log(`토스 ${jobsToDetail.length}개 채용공고 상세 내용 수집 중...`);

    for (const job of jobsToDetail) {
      try {
        if (job.detailLink && job.detailLink.startsWith('http')) {
          console.log(`토스 상세 크롤링: ${job.title}`);

          const detailPage = await browser.newPage();
          await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

          try {
            await detailPage.goto(job.detailLink, {
              waitUntil: 'domcontentloaded',
              timeout: 15000
            });

            await new Promise(r => setTimeout(r, 2000));

            const detailContent = await detailPage.evaluate(() => {
              const contentSelectors = [
                '.job-description',
                '.job-detail',
                '.content',
                '[class*="description"]',
                '[class*="detail"]',
                'main',
                'article',
                '.post-content'
              ];

              let description = '';
              let requirements = '';
              let benefits = '';

              for (const selector of contentSelectors) {
                const contentEl = document.querySelector(selector);
                if (contentEl && contentEl.textContent && contentEl.textContent.trim().length > 100) {
                  const fullText = contentEl.textContent.trim();

                  if (fullText.includes('자격요건') || fullText.includes('Requirements')) {
                    const parts = fullText.split(/자격요건|Requirements|우대사항|Preferred/i);
                    description = parts[0] ? parts[0].trim() : fullText;
                    requirements = parts[1] ? parts[1].trim().substring(0, 1000) : '';
                  } else if (fullText.includes('업무내용') || fullText.includes('Job Description')) {
                    const parts = fullText.split(/업무내용|Job Description/i);
                    description = parts[1] ? parts[1].trim() : fullText;
                  } else {
                    description = fullText;
                  }

                  if (fullText.includes('복리후생') || fullText.includes('Benefits')) {
                    const benefitMatch = fullText.match(/복리후생|Benefits[\s\S]*$/i);
                    if (benefitMatch) {
                      benefits = benefitMatch[0].substring(0, 500);
                    }
                  }

                  break;
                }
              }

              return {
                description: description.substring(0, 2000),
                requirements: requirements.substring(0, 1000),
                benefits: benefits.substring(0, 500)
              };
            });

            if (detailContent.description && detailContent.description.length > 50) {
              job.description = detailContent.description;
              job.requirements = detailContent.requirements || '';
              job.benefits = detailContent.benefits || '';
            }

          } catch (detailError) {
            console.log(`토스 상세 크롤링 실패 (${job.title}):`, detailError.message);
          } finally {
            await detailPage.close();
          }
        }

        detailedJobs.push(job);
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`토스 상세 크롤링 오류 (${job.title}):`, error.message);
        detailedJobs.push(job);
      }
    }

    const remainingJobs = jobs.slice(Math.min(10, jobs.length));
    const finalJobs = [...detailedJobs, ...remainingJobs];

    console.log(`토스에서 총 ${finalJobs.length}개 채용공고 수집 완료 (상세: ${detailedJobs.length}개)`);
    return finalJobs;

  } catch (error) {
    console.error('토스 크롤링 오류:', error);
    return [];
  } finally {
    if (!sharedBrowser) await browser.close();
  }
}

module.exports = { crawlToss };
