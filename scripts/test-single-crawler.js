const puppeteer = require('puppeteer');

async function testNaverCrawler() {
  console.log('🧪 네이버 크롤러 단독 테스트');
  
  const browser = await puppeteer.launch({ 
    headless: false, // 디버깅을 위해 브라우저 표시
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📍 네이버 채용 사이트 접속 중...');
    await page.goto('https://recruit.navercorp.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 페이지 제목 확인
    const title = await page.title();
    console.log(`   페이지 제목: ${title}`);

    // 모든 텍스트에서 채용공고 찾기
    const allJobs = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const jobKeywords = ['개발자', 'developer', '엔지니어', 'engineer', '프로그래머'];
      const foundJobs = [];
      
      Array.from(allElements).forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 5 && text.length < 200) {
          const hasJobKeyword = jobKeywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (hasJobKeyword && !foundJobs.some(job => job.text === text)) {
            const link = element.querySelector('a') || element.closest('a');
            foundJobs.push({
              text: text,
              href: link ? link.href : null,
              tag: element.tagName
            });
          }
        }
      });
      
      return foundJobs.slice(0, 10); // 상위 10개만
    });

    console.log('\n📋 발견된 개발 관련 항목들:');
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.text}`);
      console.log(`   링크: ${job.href || '없음'}`);
      console.log(`   태그: ${job.tag}`);
      console.log('');
    });

    // .job 셀렉터로 찾기
    console.log('\n🔍 .job 셀렉터로 찾기:');
    const jobElements = await page.$$('.job');
    console.log(`   .job 요소 개수: ${jobElements.length}`);
    
    if (jobElements.length > 0) {
      for (let i = 0; i < Math.min(3, jobElements.length); i++) {
        const text = await jobElements[i].evaluate(el => el.textContent?.trim());
        console.log(`   ${i + 1}. ${text}`);
      }
    }

    // 실제 채용공고가 있는지 더 자세히 확인
    const detailedSearch = await page.evaluate(() => {
      const results = [];
      
      // 링크가 있는 요소들 중에서 채용과 관련된 것들 찾기
      const links = document.querySelectorAll('a[href*="job"], a[href*="career"], a[href*="recruit"]');
      Array.from(links).forEach(link => {
        results.push({
          text: link.textContent?.trim(),
          href: link.href
        });
      });

      // 제목이 있는 요소들 찾기
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      Array.from(headings).forEach(heading => {
        const text = heading.textContent?.trim();
        if (text && (text.includes('개발') || text.includes('채용') || text.includes('모집'))) {
          results.push({
            text: text,
            href: null,
            type: 'heading'
          });
        }
      });

      return results;
    });

    console.log('\n🎯 상세 검색 결과:');
    detailedSearch.forEach((item, index) => {
      console.log(`${index + 1}. ${item.text}`);
      if (item.href) console.log(`   링크: ${item.href}`);
      if (item.type) console.log(`   타입: ${item.type}`);
      console.log('');
    });

    console.log('\n⏸️  브라우저가 열려있습니다. 수동으로 페이지 구조를 확인한 후 아무 키나 누르세요...');
    // 수동 확인을 위해 잠시 대기
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    await browser.close();
  }
}

testNaverCrawler();