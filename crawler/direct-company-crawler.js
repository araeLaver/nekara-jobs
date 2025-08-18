// 각 회사 채용 페이지에서 직접 크롤링

const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DirectCompanyCrawler {
  constructor() {
    this.browserOptions = {
      headless: false, // 디버깅을 위해 브라우저 표시
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    };
  }

  async crawlNaverDirect() {
    console.log('🔍 네이버 채용 페이지 직접 크롤링...');
    
    const browser = await puppeteer.launch(this.browserOptions);
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // 네이버 채용 페이지 접속
      console.log('📍 네이버 채용 사이트: https://recruit.navercorp.com');
      await page.goto('https://recruit.navercorp.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      // 페이지에서 채용공고 찾기
      const jobs = await page.evaluate(() => {
        const jobList = [];
        
        // 다양한 선택자로 채용공고 찾기
        const selectors = [
          'a[href*="job"]',
          'a[href*="position"]',
          'a[href*="recruit"]',
          '.job',
          '.position',
          '.recruit-item',
          '[data-job]',
          'li a',
          '.card a',
          '.item a'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          
          Array.from(elements).forEach(element => {
            const text = element.textContent?.trim();
            const href = element.href;
            
            if (text && href && text.length > 5 && text.length < 100) {
              // 개발 관련 키워드 확인
              const devKeywords = ['개발자', 'developer', '엔지니어', 'engineer', 'Software', 'Frontend', 'Backend'];
              const hasDevKeyword = devKeywords.some(keyword => 
                text.toLowerCase().includes(keyword.toLowerCase())
              );
              
              if (hasDevKeyword || text.includes('채용') || text.includes('모집')) {
                jobList.push({
                  title: text,
                  url: href,
                  company: 'naver'
                });
              }
            }
          });
          
          if (jobList.length > 0) break;
        }
        
        // 중복 제거
        const uniqueJobs = jobList.filter((job, index, self) => 
          index === self.findIndex(j => j.title === job.title)
        ).slice(0, 5);
        
        return uniqueJobs;
      });
      
      console.log(`✅ 네이버에서 ${jobs.length}개 채용공고 발견`);
      jobs.forEach(job => console.log(`   - ${job.title}`));
      
      return jobs;
      
    } catch (error) {
      console.error('❌ 네이버 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async crawlKakaoDirect() {
    console.log('\n🔍 카카오 채용 페이지 직접 크롤링...');
    
    const browser = await puppeteer.launch(this.browserOptions);
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log('📍 카카오 채용 사이트: https://careers.kakao.com/jobs');
      await page.goto('https://careers.kakao.com/jobs', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      const jobs = await page.evaluate(() => {
        const jobList = [];
        
        // 카카오 특화 선택자들
        const selectors = [
          '[data-testid*="job"]',
          'a[href*="/jobs/"]',
          '.job-card',
          '.position',
          '.card',
          'li a'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          
          Array.from(elements).forEach(element => {
            const text = element.textContent?.trim();
            const href = element.href || element.querySelector('a')?.href;
            
            if (text && href && text.length > 5 && text.includes('개발')) {
              jobList.push({
                title: text,
                url: href,
                company: 'kakao'
              });
            }
          });
          
          if (jobList.length > 0) break;
        }
        
        return jobList.slice(0, 5);
      });
      
      console.log(`✅ 카카오에서 ${jobs.length}개 채용공고 발견`);
      jobs.forEach(job => console.log(`   - ${job.title}`));
      
      return jobs;
      
    } catch (error) {
      console.error('❌ 카카오 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async crawlLineDirect() {
    console.log('\n🔍 라인 채용 페이지 직접 크롤링...');
    
    const browser = await puppeteer.launch(this.browserOptions);
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log('📍 라인 채용 사이트: https://careers.linecorp.com/ko/jobs');
      await page.goto('https://careers.linecorp.com/ko/jobs', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      const jobs = await page.evaluate(() => {
        const jobList = [];
        
        const selectors = [
          'a[href*="/jobs/"]',
          '.job',
          '.position',
          '.card a',
          'li a'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          
          Array.from(elements).forEach(element => {
            const text = element.textContent?.trim();
            const href = element.href;
            
            if (text && href && text.length > 5 && 
                (text.includes('Developer') || text.includes('Engineer') || text.includes('개발'))) {
              jobList.push({
                title: text,
                url: href,
                company: 'line'
              });
            }
          });
          
          if (jobList.length > 0) break;
        }
        
        return jobList.slice(0, 5);
      });
      
      console.log(`✅ 라인에서 ${jobs.length}개 채용공고 발견`);
      jobs.forEach(job => console.log(`   - ${job.title}`));
      
      return jobs;
      
    } catch (error) {
      console.error('❌ 라인 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async crawlCoupangDirect() {
    console.log('\n🔍 쿠팡 채용 페이지 직접 크롤링...');
    
    const browser = await puppeteer.launch(this.browserOptions);
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log('📍 쿠팡 채용 사이트: https://www.coupang.jobs/kr/');
      await page.goto('https://www.coupang.jobs/kr/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      const jobs = await page.evaluate(() => {
        const jobList = [];
        
        const selectors = [
          'a[href*="job"]',
          '.job',
          '.position',
          '.card a',
          'li a'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          
          Array.from(elements).forEach(element => {
            const text = element.textContent?.trim();
            const href = element.href;
            
            if (text && href && text.length > 5 && 
                (text.includes('Engineer') || text.includes('Developer') || text.includes('개발'))) {
              jobList.push({
                title: text,
                url: href,
                company: 'coupang'
              });
            }
          });
          
          if (jobList.length > 0) break;
        }
        
        return jobList.slice(0, 5);
      });
      
      console.log(`✅ 쿠팡에서 ${jobs.length}개 채용공고 발견`);
      jobs.forEach(job => console.log(`   - ${job.title}`));
      
      return jobs;
      
    } catch (error) {
      console.error('❌ 쿠팡 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async crawlBaeminDirect() {
    console.log('\n🔍 배달의민족 채용 페이지 직접 크롤링...');
    
    const browser = await puppeteer.launch(this.browserOptions);
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log('📍 배달의민족 채용 사이트: https://www.woowahan.com/jobs');
      await page.goto('https://www.woowahan.com/jobs', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      const jobs = await page.evaluate(() => {
        const jobList = [];
        
        const selectors = [
          'a[href*="job"]',
          '.job',
          '.position',
          '.card a',
          'li a'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          
          Array.from(elements).forEach(element => {
            const text = element.textContent?.trim();
            const href = element.href;
            
            if (text && href && text.length > 5 && 
                (text.includes('개발자') || text.includes('Developer') || text.includes('Engineer'))) {
              jobList.push({
                title: text,
                url: href,
                company: 'baemin'
              });
            }
          });
          
          if (jobList.length > 0) break;
        }
        
        return jobList.slice(0, 5);
      });
      
      console.log(`✅ 배달의민족에서 ${jobs.length}개 채용공고 발견`);
      jobs.forEach(job => console.log(`   - ${job.title}`));
      
      return jobs;
      
    } catch (error) {
      console.error('❌ 배달의민족 크롤링 오류:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async updateDatabaseWithDirectJobs(allJobs) {
    console.log('\n📝 실제 회사 채용공고로 데이터베이스 업데이트...');
    
    // 기존 데이터 삭제
    await prisma.job.deleteMany({});
    console.log('🗑️ 기존 데이터 삭제 완료');
    
    // 회사 정보 가져오기
    const companies = await prisma.company.findMany();
    const companyMap = {};
    companies.forEach(c => {
      companyMap[c.name] = c.id;
    });
    
    let savedCount = 0;
    
    for (const job of allJobs) {
      try {
        const companyId = companyMap[job.company];
        if (!companyId) continue;
        
        await prisma.job.create({
          data: {
            title: job.title,
            description: job.title,
            location: job.company === 'line' ? '서울 강남구' : 
                     job.company === 'coupang' ? '서울 송파구' :
                     job.company === 'baemin' ? '서울 서초구' : '경기 성남시 분당구',
            department: '개발팀',
            jobType: '정규직',
            experience: '경력무관',
            salary: '회사내규에 따름',
            originalUrl: job.url,
            postedAt: new Date(),
            companyId: companyId
          }
        });
        
        console.log(`✅ 저장: [${job.company.toUpperCase()}] ${job.title}`);
        savedCount++;
      } catch (error) {
        console.log(`❌ 저장 실패: ${job.title}`, error.message);
      }
    }
    
    console.log(`\n🎉 총 ${savedCount}개 실제 회사 채용공고 저장 완료!`);
    
    // 최종 통계
    const stats = await prisma.company.findMany({
      select: {
        nameEn: true,
        _count: {
          select: { jobs: true }
        }
      }
    });
    
    console.log('\n📊 회사별 채용공고 현황:');
    stats.forEach(company => {
      console.log(`   ${company.nameEn}: ${company._count.jobs}개`);
    });
  }

  async crawlAllDirectly() {
    console.log('🚀 각 회사 채용 페이지 직접 크롤링 시작!');
    console.log('=' .repeat(60));
    
    try {
      const allJobs = [];
      
      // 각 회사별로 직접 크롤링
      const naverJobs = await this.crawlNaverDirect();
      allJobs.push(...naverJobs);
      
      const kakaoJobs = await this.crawlKakaoDirect();
      allJobs.push(...kakaoJobs);
      
      const lineJobs = await this.crawlLineDirect();
      allJobs.push(...lineJobs);
      
      const coupangJobs = await this.crawlCoupangDirect();
      allJobs.push(...coupangJobs);
      
      const baeminJobs = await this.crawlBaeminDirect();
      allJobs.push(...baeminJobs);
      
      console.log(`\n📊 총 ${allJobs.length}개 실제 회사 채용공고 수집 완료!`);
      
      if (allJobs.length > 0) {
        await this.updateDatabaseWithDirectJobs(allJobs);
      } else {
        console.log('⚠️ 채용공고를 찾지 못했습니다. 각 사이트의 구조가 변경되었을 수 있습니다.');
      }
      
    } catch (error) {
      console.error('❌ 직접 크롤링 오류:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// 실행
if (require.main === module) {
  const crawler = new DirectCompanyCrawler();
  crawler.crawlAllDirectly().catch(console.error);
}

module.exports = { DirectCompanyCrawler };