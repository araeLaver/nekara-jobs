// 더 공격적인 실제 채용공고 크롤러

const puppeteer = require('puppeteer');

class AggressiveCrawler {
  async crawlJobKorea() {
    console.log('🔍 잡코리아에서 네카라쿠배 채용공고 검색 중...');
    
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // 잡코리아 대기업 채용정보
      const companies = ['네이버', '카카오', '라인', '쿠팡', '배달의민족'];
      const allJobs = [];
      
      for (const company of companies) {
        try {
          const searchUrl = `https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=1&comp_name=${encodeURIComponent(company)}`;
          console.log(`📍 잡코리아에서 ${company} 검색: ${searchUrl}`);
          
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });
          await page.waitForTimeout(3000);
          
          const jobs = await page.evaluate((companyName) => {
            const jobElements = document.querySelectorAll('.list-post, .post, .recruit-item, .list-item');
            const jobs = [];
            
            Array.from(jobElements).forEach(element => {
              const titleEl = element.querySelector('a[href*="recruit"], .title a, .post-title a, h3 a, h4 a');
              const linkEl = titleEl || element.querySelector('a');
              
              if (titleEl && linkEl) {
                const title = titleEl.textContent?.trim();
                const href = linkEl.href;
                
                if (title && href && title.length > 3) {
                  jobs.push({
                    title: title,
                    originalUrl: href,
                    description: `${companyName} ${title}`,
                    location: '서울/경기',
                    department: '개발부문',
                    jobType: '정규직',
                    company: companyName.toLowerCase().replace(/[^a-z]/g, ''),
                    postedAt: new Date().toISOString(),
                    source: 'jobkorea'
                  });
                }
              }
            });
            
            return jobs.slice(0, 3); // 상위 3개만
          }, company);
          
          console.log(`✅ ${company}: ${jobs.length}개 채용공고 발견`);
          allJobs.push(...jobs);
          
          await page.waitForTimeout(2000); // 요청 간격
        } catch (error) {
          console.log(`❌ ${company} 검색 실패:`, error.message);
        }
      }
      
      return allJobs;
      
    } catch (error) {
      console.error('❌ 잡코리아 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async crawlSaramin() {
    console.log('🔍 사람인에서 네카라쿠배 채용공고 검색 중...');
    
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const companies = [
        { name: '네이버', code: 'naver' },
        { name: '카카오', code: 'kakao' },
        { name: '라인', code: 'line' },
        { name: '쿠팡', code: 'coupang' },
        { name: '배달의민족', code: 'baemin' }
      ];
      
      const allJobs = [];
      
      for (const { name, code } of companies) {
        try {
          const searchUrl = `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${encodeURIComponent(name)}&recruitPageCount=20`;
          console.log(`📍 사람인에서 ${name} 검색`);
          
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });
          await page.waitForTimeout(3000);
          
          const jobs = await page.evaluate((companyName, companyCode) => {
            const jobElements = document.querySelectorAll('.item_recruit, .recruit_item, .list_item');
            const jobs = [];
            
            Array.from(jobElements).forEach(element => {
              const titleEl = element.querySelector('.job_tit a, .recruit_tit a, h2 a, h3 a');
              const companyEl = element.querySelector('.corp_name a, .company a');
              
              if (titleEl && companyEl) {
                const title = titleEl.textContent?.trim();
                const company = companyEl.textContent?.trim();
                const href = titleEl.href;
                
                if (title && href && company?.includes(companyName)) {
                  jobs.push({
                    title: title,
                    originalUrl: href,
                    description: `${companyName} ${title}`,
                    location: '서울/경기',
                    department: '개발부문',
                    jobType: '정규직',
                    company: companyCode,
                    postedAt: new Date().toISOString(),
                    source: 'saramin'
                  });
                }
              }
            });
            
            return jobs.slice(0, 3);
          }, name, code);
          
          console.log(`✅ ${name}: ${jobs.length}개 채용공고 발견`);
          allJobs.push(...jobs);
          
          await page.waitForTimeout(2000);
        } catch (error) {
          console.log(`❌ ${name} 검색 실패:`, error.message);
        }
      }
      
      return allJobs;
      
    } catch (error) {
      console.error('❌ 사람인 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  // 프로그래머스 채용공고
  async crawlProgrammers() {
    console.log('🔍 프로그래머스에서 네카라쿠배 채용공고 검색 중...');
    
    try {
      // 프로그래머스 채용 API (공개 API)
      const response = await fetch('https://career.programmers.co.kr/api/job_positions', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const jobs = [];
        
        if (data.job_positions) {
          data.job_positions.forEach(job => {
            const companyName = job.company?.name?.toLowerCase();
            const targetCompanies = ['naver', 'kakao', 'line', 'coupang', 'woowa'];
            
            if (targetCompanies.some(company => companyName?.includes(company))) {
              jobs.push({
                title: job.title,
                originalUrl: `https://career.programmers.co.kr/job_positions/${job.id}`,
                description: job.summary || job.title,
                location: job.location || '서울',
                department: job.company?.name || '개발부문',
                jobType: '정규직',
                company: this.mapCompanyName(companyName),
                postedAt: new Date().toISOString(),
                source: 'programmers'
              });
            }
          });
        }
        
        console.log(`✅ 프로그래머스: ${jobs.length}개 채용공고 발견`);
        return jobs;
      }
    } catch (error) {
      console.log('❌ 프로그래머스 API 오류:', error.message);
    }
    
    return [];
  }

  mapCompanyName(companyName) {
    if (companyName?.includes('naver')) return 'naver';
    if (companyName?.includes('kakao')) return 'kakao';
    if (companyName?.includes('line')) return 'line';
    if (companyName?.includes('coupang')) return 'coupang';
    if (companyName?.includes('woowa') || companyName?.includes('배달')) return 'baemin';
    return 'unknown';
  }

  // 전체 공격적 크롤링 실행
  async crawlAllAggressive() {
    console.log('🚀 공격적 실제 채용공고 크롤링 시작!');
    console.log('=' .repeat(60));
    
    const results = {};
    
    try {
      // 프로그래머스 (API 우선)
      console.log('\n1️⃣ 프로그래머스 API 크롤링...');
      const programmersJobs = await this.crawlProgrammers();
      
      // 잡코리아 크롤링
      console.log('\n2️⃣ 잡코리아 크롤링...');
      const jobkoreaJobs = await this.crawlJobKorea();
      
      // 사람인 크롤링
      console.log('\n3️⃣ 사람인 크롤링...');
      const saraminJobs = await this.crawlSaramin();
      
      // 결과 합치기
      const allJobs = [...programmersJobs, ...jobkoreaJobs, ...saraminJobs];
      
      // 회사별로 분류
      allJobs.forEach(job => {
        if (!results[job.company]) {
          results[job.company] = [];
        }
        results[job.company].push(job);
      });
      
      // 결과 요약
      const totalJobs = allJobs.length;
      console.log(`\n🎉 공격적 크롤링 완료! 총 ${totalJobs}개 실제 채용공고 수집`);
      
      Object.entries(results).forEach(([company, jobs]) => {
        console.log(`   ${company}: ${jobs.length}개`);
        jobs.forEach((job, i) => {
          console.log(`     ${i + 1}. ${job.title} (${job.source})`);
        });
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ 공격적 크롤링 오류:', error);
      return results;
    }
  }
}

module.exports = { AggressiveCrawler };