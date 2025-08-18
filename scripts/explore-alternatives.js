// 실제 채용 데이터 수집을 위한 대체 방안 탐색

const puppeteer = require('puppeteer');

class JobDataCollector {
  constructor() {
    this.companies = {
      naver: {
        name: '네이버',
        baseUrl: 'https://recruit.navercorp.com',
        approaches: [
          {
            type: 'API',
            url: 'https://recruit.navercorp.com/naver/job/api/list',
            method: 'GET',
            description: '네이버 채용 API (추정)'
          },
          {
            type: 'RSS',
            url: 'https://recruit.navercorp.com/rss',
            description: 'RSS 피드 (추정)'
          },
          {
            type: 'JSON-LD',
            description: '구조화된 데이터 스크래핑'
          }
        ]
      },
      kakao: {
        name: '카카오',
        baseUrl: 'https://careers.kakao.com',
        approaches: [
          {
            type: 'API',
            url: 'https://careers.kakao.com/api/jobs',
            method: 'GET',
            description: '카카오 채용 API (추정)'
          }
        ]
      },
      line: {
        name: '라인',
        baseUrl: 'https://careers.linecorp.com',
        approaches: [
          {
            type: 'API',
            url: 'https://careers.linecorp.com/api/jobs',
            method: 'GET',
            description: '라인 채용 API (추정)'
          }
        ]
      },
      coupang: {
        name: '쿠팡',
        baseUrl: 'https://www.coupang.jobs',
        approaches: [
          {
            type: 'API',
            url: 'https://www.coupang.jobs/api/jobs',
            method: 'GET',
            description: '쿠팡 채용 API (추정)'
          }
        ]
      },
      baemin: {
        name: '배달의민족',
        baseUrl: 'https://www.woowahan.com',
        approaches: [
          {
            type: 'API',
            url: 'https://www.woowahan.com/api/jobs',
            method: 'GET',
            description: '우아한형제들 채용 API (추정)'
          }
        ]
      }
    };
  }

  async checkApiEndpoint(url, company) {
    try {
      console.log(`🔍 ${company} API 엔드포인트 확인: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`✅ ${company} API 응답 성공!`);
          console.log(`   Content-Type: ${contentType}`);
          console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
          return { success: true, data, contentType };
        }
      }
      
      console.log(`❌ ${company} API 응답 실패: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, statusText: response.statusText };

    } catch (error) {
      console.log(`❌ ${company} API 오류: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async checkRssFeed(url, company) {
    try {
      console.log(`📡 ${company} RSS 피드 확인: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (text.includes('<rss') || text.includes('<feed')) {
          console.log(`✅ ${company} RSS 피드 발견!`);
          return { success: true, type: text.includes('<rss') ? 'RSS' : 'Atom' };
        }
      }
      
      console.log(`❌ ${company} RSS 피드 없음: ${response.status}`);
      return { success: false };

    } catch (error) {
      console.log(`❌ ${company} RSS 오류: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async checkStructuredData(baseUrl, company) {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log(`🏗️ ${company} 구조화된 데이터 확인: ${baseUrl}`);
      
      await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      
      // JSON-LD 구조화된 데이터 찾기
      const jsonLdData = await page.$$eval('script[type="application/ld+json"]', scripts => {
        return scripts.map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch {
            return null;
          }
        }).filter(data => data !== null);
      });

      if (jsonLdData.length > 0) {
        console.log(`✅ ${company} JSON-LD 데이터 발견! (${jsonLdData.length}개)`);
        return { success: true, data: jsonLdData };
      }

      // 네트워크 요청 모니터링으로 숨겨진 API 찾기
      const apiCalls = [];
      page.on('response', response => {
        const url = response.url();
        if (url.includes('api') || url.includes('json')) {
          apiCalls.push({
            url,
            status: response.status(),
            contentType: response.headers()['content-type']
          });
        }
      });

      await page.waitForTimeout(3000);

      if (apiCalls.length > 0) {
        console.log(`🔍 ${company} 발견된 API 호출:`);
        apiCalls.forEach(call => {
          console.log(`   ${call.url} (${call.status})`);
        });
        return { success: true, apis: apiCalls };
      }

      console.log(`❌ ${company} 구조화된 데이터 없음`);
      return { success: false };

    } catch (error) {
      console.log(`❌ ${company} 구조화된 데이터 확인 오류: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      await browser.close();
    }
  }

  async exploreAlternatives() {
    console.log('🚀 채용 데이터 수집 대체 방안 탐색 시작');
    console.log('='.repeat(60));

    const results = {};

    for (const [companyCode, companyInfo] of Object.entries(this.companies)) {
      console.log(`\n🏢 ${companyInfo.name} 분석 중...`);
      results[companyCode] = {
        name: companyInfo.name,
        results: {}
      };

      // 1. API 엔드포인트 확인
      for (const approach of companyInfo.approaches) {
        if (approach.type === 'API') {
          const result = await this.checkApiEndpoint(approach.url, companyInfo.name);
          results[companyCode].results.api = result;
          await new Promise(resolve => setTimeout(resolve, 1000)); // 요청 간격
        }
      }

      // 2. RSS 피드 확인
      const rssUrls = [
        `${companyInfo.baseUrl}/rss`,
        `${companyInfo.baseUrl}/feed`,
        `${companyInfo.baseUrl}/jobs/rss`,
        `${companyInfo.baseUrl}/careers/rss`
      ];

      for (const rssUrl of rssUrls) {
        const result = await this.checkRssFeed(rssUrl, companyInfo.name);
        if (result.success) {
          results[companyCode].results.rss = result;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 3. 구조화된 데이터 확인
      const structuredResult = await this.checkStructuredData(companyInfo.baseUrl, companyInfo.name);
      results[companyCode].results.structured = structuredResult;

      console.log(`   ${companyInfo.name} 분석 완료\n`);
    }

    // 결과 요약
    console.log('\n📊 탐색 결과 요약');
    console.log('='.repeat(60));

    for (const [companyCode, result] of Object.entries(results)) {
      console.log(`\n🏢 ${result.name}:`);
      
      if (result.results.api?.success) {
        console.log('  ✅ API 엔드포인트 사용 가능');
      } else {
        console.log('  ❌ API 엔드포인트 없음');
      }

      if (result.results.rss?.success) {
        console.log(`  ✅ RSS 피드 사용 가능 (${result.results.rss.type})`);
      } else {
        console.log('  ❌ RSS 피드 없음');
      }

      if (result.results.structured?.success) {
        console.log('  ✅ 구조화된 데이터 사용 가능');
      } else {
        console.log('  ❌ 구조화된 데이터 없음');
      }
    }

    // 추천 전략
    console.log('\n💡 추천 전략');
    console.log('='.repeat(60));
    console.log('1. 🎯 개선된 웹 크롤링:');
    console.log('   - 더 정교한 셀렉터 사용');
    console.log('   - 동적 콘텐츠 로딩 대기');
    console.log('   - 사용자 에이전트 및 헤더 최적화');
    console.log('   - 요청 간격 및 재시도 로직');

    console.log('\n2. 📡 주기적 데이터 수집:');
    console.log('   - 하루 1-2회 스케줄 크롤링');
    console.log('   - 변화 감지 및 업데이트');
    console.log('   - 오류 복구 메커니즘');

    console.log('\n3. 🔄 하이브리드 접근:');
    console.log('   - 크롤링 + 수동 데이터 보완');
    console.log('   - 실제 채용공고 패턴 학습');
    console.log('   - 사용자 제보 시스템');

    return results;
  }
}

// 실행
if (require.main === module) {
  const collector = new JobDataCollector();
  collector.exploreAlternatives().catch(console.error);
}

module.exports = { JobDataCollector };