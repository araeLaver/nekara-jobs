const puppeteer = require('puppeteer');

async function testDetailCrawling() {
  const browser = await puppeteer.launch({ 
    headless: false, // 브라우저를 보이게 해서 디버깅
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    
    // 토스 채용 사이트 예시 URL (실제 채용공고 URL)
    const testUrl = 'https://toss.im/career/job-detail?job=4394068003';
    
    console.log('테스트 URL로 이동 중:', testUrl);
    
    try {
      await page.goto(testUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      console.log('페이지 로딩 완료');
      await page.waitForTimeout(3000);
      
      // 페이지의 모든 텍스트 내용 추출
      const content = await page.evaluate(() => {
        // 다양한 셀렉터로 상세 내용 찾기
        const selectors = [
          'main',
          '[class*="content"]',
          '[class*="description"]', 
          '[class*="detail"]',
          'article',
          '.job-description',
          'body'
        ];
        
        let bestContent = '';
        let maxLength = 0;
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent || '';
            if (text.length > maxLength && text.length > 500) {
              maxLength = text.length;
              bestContent = text;
            }
          });
        }
        
        // 제목 추출
        let title = '';
        const titleSelectors = ['h1', 'h2', '[class*="title"]', 'title'];
        for (const selector of titleSelectors) {
          const titleEl = document.querySelector(selector);
          if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
            title = titleEl.textContent.trim();
            break;
          }
        }
        
        // 모든 텍스트를 단락별로 정리
        const allText = document.body.textContent || '';
        const paragraphs = allText.split('\n')
          .map(p => p.trim())
          .filter(p => p.length > 10)
          .slice(0, 50); // 처음 50개 단락만
        
        return {
          title: title || '제목 없음',
          content: bestContent.substring(0, 3000),
          paragraphs: paragraphs,
          url: window.location.href
        };
      });
      
      console.log('\n=== 크롤링 결과 ===');
      console.log('제목:', content.title);
      console.log('URL:', content.url);
      console.log('내용 길이:', content.content.length);
      console.log('\n첫 500자:');
      console.log(content.content.substring(0, 500));
      console.log('\n단락들:');
      content.paragraphs.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}: ${p.substring(0, 100)}...`);
      });
      
    } catch (error) {
      console.log('특정 URL 접근 실패, 토스 메인 채용 페이지로 이동');
      
      // 메인 채용 페이지에서 첫 번째 공고 링크 찾기
      await page.goto('https://toss.im/career/jobs', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      const jobLinks = await page.evaluate(() => {
        const links = [];
        const allLinks = document.querySelectorAll('a[href*="job"]');
        allLinks.forEach(link => {
          if (link.href && link.textContent && link.textContent.trim()) {
            links.push({
              url: link.href,
              title: link.textContent.trim(),
              text: link.textContent.trim().substring(0, 100)
            });
          }
        });
        return links.slice(0, 5); // 처음 5개만
      });
      
      console.log('\n찾은 채용공고 링크들:');
      jobLinks.forEach((link, i) => {
        console.log(`${i + 1}: ${link.title} - ${link.url}`);
      });
      
      if (jobLinks.length > 0) {
        const firstJob = jobLinks[0];
        console.log(`\n첫 번째 공고 상세 페이지로 이동: ${firstJob.url}`);
        
        try {
          await page.goto(firstJob.url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          });
          
          await page.waitForTimeout(3000);
          
          const detailContent = await page.evaluate(() => {
            return {
              title: document.title || '제목 없음',
              bodyText: document.body.textContent || '',
              url: window.location.href
            };
          });
          
          console.log('\n=== 첫 번째 공고 상세 ===');
          console.log('제목:', detailContent.title);
          console.log('URL:', detailContent.url);
          console.log('내용 길이:', detailContent.bodyText.length);
          console.log('\n첫 1000자:');
          console.log(detailContent.bodyText.substring(0, 1000));
          
        } catch (detailError) {
          console.error('상세 페이지 접근 실패:', detailError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('크롤링 오류:', error);
  } finally {
    // 브라우저를 잠시 열어둬서 결과 확인 가능
    console.log('\n5초 후 브라우저가 종료됩니다...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

testDetailCrawling();