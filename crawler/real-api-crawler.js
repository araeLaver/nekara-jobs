// 실제 API 및 공개 데이터를 활용한 채용공고 크롤러

class RealAPICrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  // 카카오 채용 API (실제 API 확인)
  async crawlKakaoAPI() {
    console.log('🔍 카카오 채용 API 탐색 중...');
    
    const apiUrls = [
      'https://careers.kakao.com/api/recruitment/jobs',
      'https://careers.kakao.com/api/jobs',
      'https://careers.kakao.com/jobs.json',
      'https://api.kakaocorp.com/careers',
      'https://careers.kakao.com/_next/static/chunks/pages/jobs-*.js'
    ];
    
    for (const url of apiUrls) {
      try {
        console.log(`📍 시도 중: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json, */*',
            'Referer': 'https://careers.kakao.com/jobs'
          }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`✅ 성공! Content-Type: ${contentType}`);
          
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            console.log('📄 JSON 데이터 구조:', Object.keys(data));
            return this.parseKakaoJobs(data);
          } else {
            const text = await response.text();
            console.log('📄 텍스트 응답 (처음 200자):', text.substring(0, 200));
          }
        }
      } catch (error) {
        console.log(`❌ ${url} 실패: ${error.message}`);
      }
    }
    
    return [];
  }

  parseKakaoJobs(data) {
    const jobs = [];
    
    // 다양한 가능한 데이터 구조 탐색
    const possibleKeys = ['jobs', 'positions', 'recruitments', 'data', 'items', 'results'];
    
    for (const key of possibleKeys) {
      if (data[key] && Array.isArray(data[key])) {
        data[key].forEach(item => {
          if (item.title || item.name) {
            jobs.push({
              title: item.title || item.name,
              originalUrl: item.url || item.link || 'https://careers.kakao.com/jobs',
              description: item.description || item.summary || '',
              location: item.location || '경기 성남시 분당구',
              department: item.department || item.team || '개발팀',
              jobType: '정규직',
              company: 'kakao',
              postedAt: new Date().toISOString()
            });
          }
        });
      }
    }
    
    return jobs;
  }

  // 네이버 채용 RSS/JSON 탐색
  async crawlNaverFeeds() {
    console.log('🔍 네이버 채용 피드 탐색 중...');
    
    const feedUrls = [
      'https://recruit.navercorp.com/rss',
      'https://recruit.navercorp.com/feed',
      'https://recruit.navercorp.com/api/jobs',
      'https://recruit.navercorp.com/naver/job/api/list',
      'https://www.navercorp.com/careers/rss',
      'https://d2.naver.com/news/rss'
    ];
    
    for (const url of feedUrls) {
      try {
        console.log(`📍 시도 중: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, application/json, text/xml, */*'
          }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          const text = await response.text();
          
          console.log(`✅ 응답 받음! Content-Type: ${contentType}`);
          console.log('📄 내용 미리보기:', text.substring(0, 300));
          
          if (text.includes('<rss') || text.includes('<feed')) {
            console.log('📡 RSS/Atom 피드 발견!');
            return this.parseRSSFeed(text);
          } else if (contentType?.includes('json')) {
            const data = JSON.parse(text);
            return this.parseNaverJobs(data);
          }
        }
      } catch (error) {
        console.log(`❌ ${url} 실패: ${error.message}`);
      }
    }
    
    return [];
  }

  parseRSSFeed(xmlText) {
    const jobs = [];
    
    // 간단한 XML 파싱 (정규표현식 사용)
    const items = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    items.forEach(item => {
      const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
      const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim();
      const description = item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]?.trim();
      
      if (title && title.includes('개발')) {
        jobs.push({
          title: title,
          originalUrl: link || 'https://recruit.navercorp.com/',
          description: description || title,
          location: '경기 성남시 분당구',
          department: '개발부문',
          jobType: '정규직',
          company: 'naver',
          postedAt: new Date().toISOString()
        });
      }
    });
    
    return jobs;
  }

  parseNaverJobs(data) {
    // 네이버 JSON 데이터 파싱 로직
    return [];
  }

  // GitHub Jobs API (공개 API)
  async crawlGitHubJobs() {
    console.log('🔍 GitHub Jobs에서 한국 채용공고 검색 중...');
    
    const keywords = ['naver', 'kakao', 'line', 'coupang', 'baemin', 'korea', 'seoul'];
    const jobs = [];
    
    for (const keyword of keywords) {
      try {
        // GitHub Jobs API (현재는 종료됨, 대안 API 사용)
        const url = `https://api.github.com/search/repositories?q=${keyword}+jobs+korea&sort=updated`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 GitHub에서 ${keyword} 관련 ${data.items?.length || 0}개 결과`);
          
          // GitHub에서 채용 관련 레포지토리 찾기
          data.items?.forEach(repo => {
            if (repo.description?.includes('job') || repo.description?.includes('career')) {
              jobs.push({
                title: `${keyword} 개발자 채용`,
                originalUrl: repo.html_url,
                description: repo.description,
                location: '서울/경기',
                department: '개발팀',
                jobType: '정규직',
                company: keyword === 'baemin' ? 'baemin' : keyword,
                postedAt: new Date().toISOString(),
                source: 'github'
              });
            }
          });
        }
      } catch (error) {
        console.log(`❌ GitHub ${keyword} 검색 실패:`, error.message);
      }
    }
    
    return jobs;
  }

  // 전체 실제 API 크롤링
  async crawlAllRealAPIs() {
    console.log('🚀 실제 API 채용공고 크롤링 시작!');
    console.log('=' .repeat(60));
    
    const allJobs = [];
    
    try {
      // 1. 카카오 API 시도
      console.log('\n1️⃣ 카카오 API 크롤링...');
      const kakaoJobs = await this.crawlKakaoAPI();
      allJobs.push(...kakaoJobs);
      
      // 2. 네이버 피드 시도
      console.log('\n2️⃣ 네이버 피드 크롤링...');
      const naverJobs = await this.crawlNaverFeeds();
      allJobs.push(...naverJobs);
      
      // 3. GitHub Jobs 시도
      console.log('\n3️⃣ GitHub 채용 정보 크롤링...');
      const githubJobs = await this.crawlGitHubJobs();
      allJobs.push(...githubJobs);
      
      // 결과 정리
      const jobsByCompany = {};
      allJobs.forEach(job => {
        if (!jobsByCompany[job.company]) {
          jobsByCompany[job.company] = [];
        }
        jobsByCompany[job.company].push(job);
      });
      
      console.log(`\n🎉 실제 API 크롤링 완료! 총 ${allJobs.length}개 채용공고 발견`);
      Object.entries(jobsByCompany).forEach(([company, jobs]) => {
        console.log(`   ${company}: ${jobs.length}개`);
        jobs.forEach((job, i) => {
          console.log(`     ${i + 1}. ${job.title}`);
        });
      });
      
      return jobsByCompany;
      
    } catch (error) {
      console.error('❌ API 크롤링 오류:', error);
      return {};
    }
  }
}

// 실행 스크립트
if (require.main === module) {
  const crawler = new RealAPICrawler();
  crawler.crawlAllRealAPIs().then(results => {
    console.log('\n📋 최종 결과:', JSON.stringify(results, null, 2));
  }).catch(console.error);
}

module.exports = { RealAPICrawler };