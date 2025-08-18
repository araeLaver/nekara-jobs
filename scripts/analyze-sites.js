const puppeteer = require('puppeteer');

async function analyzeSite(url, siteName) {
  const browser = await puppeteer.launch({ 
    headless: false, // 실제 페이지 구조 확인을 위해 브라우저 표시
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`\n🔍 ${siteName} 사이트 분석 중: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 페이지 로드 대기
    await page.waitForTimeout(3000);

    // 페이지 제목 확인
    const title = await page.title();
    console.log(`   페이지 제목: ${title}`);

    // 가능한 채용공고 컨테이너 셀렉터들 찾기
    const possibleSelectors = [
      // 일반적인 셀렉터들
      '.job', '.job-item', '.job-card', '.job-list-item',
      '.position', '.position-item', '.posting', '.posting-item',
      '.career', '.career-item', '.recruit', '.recruit-item',
      '[data-job]', '[data-position]', '[data-posting]',
      
      // 클래스명에 job이나 position이 포함된 요소들
      '[class*="job"]', '[class*="position"]', '[class*="posting"]',
      '[class*="career"]', '[class*="recruit"]',
      
      // 리스트 형태
      'ul li', '.list li', '.list-item', '.item',
      
      // 카드 형태
      '.card', '[class*="card"]',
      
      // 테이블 형태
      'tr', 'tbody tr', 'table tr'
    ];

    const foundElements = {};
    
    for (const selector of possibleSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0 && elements.length < 100) { // 너무 많으면 제외
          const firstElement = elements[0];
          const text = await firstElement.evaluate(el => el.textContent?.trim().substring(0, 100));
          
          if (text && text.length > 10) { // 의미있는 텍스트가 있는 경우만
            foundElements[selector] = {
              count: elements.length,
              sample: text
            };
          }
        }
      } catch (error) {
        // 셀렉터가 유효하지 않은 경우 무시
      }
    }

    console.log(`   발견된 요소들:`);
    Object.entries(foundElements)
      .sort(([,a], [,b]) => a.count - b.count)
      .slice(0, 10) // 상위 10개만 표시
      .forEach(([selector, info]) => {
        console.log(`     ${selector}: ${info.count}개 - "${info.sample}"`);
      });

    // 특정 텍스트 패턴 찾기
    const jobKeywords = ['개발자', '엔지니어', 'developer', 'engineer', '채용', '모집'];
    
    for (const keyword of jobKeywords) {
      try {
        const elements = await page.$$eval('*', (els, kw) => {
          return Array.from(els).filter(el => 
            el.textContent?.includes(kw) && 
            el.children.length === 0 && // 텍스트 노드만
            el.textContent.trim().length < 200
          ).map(el => el.textContent.trim()).slice(0, 3);
        }, keyword);
        
        if (elements.length > 0) {
          console.log(`   "${keyword}" 포함 텍스트:`, elements);
        }
      } catch (error) {
        // 무시
      }
    }

    return foundElements;

  } catch (error) {
    console.error(`❌ ${siteName} 분석 실패:`, error.message);
    return {};
  } finally {
    await browser.close();
  }
}

async function analyzeAllSites() {
  console.log('🧪 채용 사이트 구조 분석 시작');
  
  const sites = [
    { name: '네이버', url: 'https://recruit.navercorp.com/naver/job/list/developer' },
    { name: '카카오', url: 'https://careers.kakao.com/jobs' },
    { name: '라인', url: 'https://careers.linecorp.com/ko/jobs' },
    { name: '쿠팡', url: 'https://www.coupang.jobs/kr/' },
    { name: '배민', url: 'https://www.woowahan.com/jobs' }
  ];

  const results = {};
  
  for (const site of sites) {
    try {
      results[site.name] = await analyzeSite(site.url, site.name);
      console.log(`\n⏸️  다음 사이트 분석하려면 Enter를 누르세요...`);
      // await new Promise(resolve => process.stdin.once('data', resolve));
    } catch (error) {
      console.error(`❌ ${site.name} 분석 중 오류:`, error.message);
    }
  }

  console.log('\n📊 분석 완료');
  return results;
}

// 커맨드라인에서 실행 시
if (require.main === module) {
  const siteName = process.argv[2];
  const siteUrl = process.argv[3];
  
  if (siteName && siteUrl) {
    analyzeSite(siteUrl, siteName).then(result => {
      console.log('\n결과:', JSON.stringify(result, null, 2));
    });
  } else {
    console.log('사용법: node analyze-sites.js [사이트명] [URL]');
    console.log('예시: node analyze-sites.js "네이버" "https://recruit.navercorp.com/naver/job/list/developer"');
  }
}

module.exports = { analyzeSite, analyzeAllSites };