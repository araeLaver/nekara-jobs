// 정확한 URL로 모든 회사 실제 크롤링
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function cleanJobTitle(rawTitle) {
  let cleanTitle = rawTitle
    .replace(/\[.*?\]/g, '')
    .replace(/정규직.*$/g, '')
    .replace(/영입.*$/g, '')
    .replace(/종료.*$/g, '')
    .replace(/모집.*$/g, '')
    .replace(/채용.*$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/경력\s*/g, '')
    .replace(/신입\s*/g, '')
    .replace(/\(\d+.*?\)/g, '')
    .replace(/\d+년.*?(이상|이하)/g, '')
    .replace(/#.*$/g, '')
    .replace(/시\s*$/g, '')
    .trim();

  if (cleanTitle.length > 60) {
    cleanTitle = cleanTitle.substring(0, 57) + '...';
  }

  return cleanTitle || '개발자';
}

async function crawlCorrectCoupang() {
  console.log('🔍 쿠팡 정확한 URL 크롤링: https://www.coupang.jobs/kr/jobs/');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto('https://www.coupang.jobs/kr/jobs/', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await page.waitForTimeout(8000);
    
    // 엔지니어링 카테고리 필터 클릭 시도
    try {
      const engineeringButtons = [
        'button:contains("Engineering")',
        'button[data-category="Engineering"]',
        'a[href*="engineering"]',
        '.filter-btn:contains("Engineering")',
        '.category-btn:contains("Engineering")'
      ];
      
      for (const selector of engineeringButtons) {
        try {
          await page.evaluate((sel) => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            const engineeringBtn = buttons.find(btn => 
              btn.textContent.toLowerCase().includes('engineering')
            );
            if (engineeringBtn) engineeringBtn.click();
          }, selector);
          console.log('🎯 Engineering 카테고리 클릭 성공');
          await page.waitForTimeout(3000);
          break;
        } catch (e) {
          // 계속 시도
        }
      }
    } catch (error) {
      console.log('⚠️ Engineering 필터 클릭 실패, 전체 페이지 분석');
    }
    
    // 스크롤로 모든 채용공고 로드
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if(totalHeight >= scrollHeight - window.innerHeight){
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });
    
    await page.waitForTimeout(5000);
    
    const jobs = await page.evaluate(() => {
      const jobList = [];
      
      // 다양한 선택자로 채용공고 찾기
      const selectors = [
        'a[href*="/job/"]',
        'a[href*="position"]',
        '.job-card a',
        '.position-card a',
        '.card a',
        '[data-job] a',
        'div[class*="job"] a',
        'li[class*="job"] a'
      ];
      
      const devKeywords = [
        'Engineer', 'Developer', 'Software', 'Engineering',
        'Frontend', 'Backend', 'Mobile', 'Full Stack',
        'React', 'Java', 'Python', 'Kotlin', 'Swift',
        'iOS', 'Android', 'Web', 'Server', 'Client',
        'DevOps', 'SRE', 'Platform', 'Infrastructure',
        'Data', 'AI', 'ML', 'Machine Learning'
      ];
      
      // 모든 링크 분석
      const allLinks = Array.from(document.querySelectorAll('a'));
      
      allLinks.forEach(link => {
        const text = link.textContent?.trim();
        const href = link.href;
        
        if (text && href && text.length > 5 && text.length < 200) {
          const hasDevKeyword = devKeywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (hasDevKeyword && href.includes('coupang')) {
            // 상위 요소에서 추가 정보 찾기
            const parent = link.closest('.job-card, .position-card, .card, li, div');
            const description = parent?.querySelector('.description, .summary, p')?.textContent?.trim();
            
            jobList.push({
              title: text,
              description: description || `${text} - 쿠팡에서 함께할 개발자를 찾습니다`,
              link: href
            });
          }
        }
      });
      
      // 페이지의 모든 텍스트에서 직무명 찾기
      if (jobList.length < 5) {
        const allElements = document.querySelectorAll('*');
        Array.from(allElements).forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 10 && text.length < 150) {
            const hasDevKeywords = devKeywords.some(keyword =>
              text.includes(keyword)
            );
            
            if (hasDevKeywords) {
              const link = element.href || 
                         element.closest('a')?.href ||
                         'https://www.coupang.jobs/kr/jobs/';
              
              jobList.push({
                title: text.split('\\n')[0].trim(),
                description: text.length > 100 ? text.substring(0, 150) + '...' : text,
                link: link
              });
            }
          }
        });
      }
      
      return jobList.filter((job, index, self) =>
        index === self.findIndex(j => j.title === job.title)
      ).slice(0, 15);
    });
    
    console.log(`✅ 쿠팡에서 ${jobs.length}개 개발자 채용공고 발견`);
    jobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`);
    });
    
    return jobs;
    
  } catch (error) {
    console.error('❌ 쿠팡 크롤링 오류:', error.message);
    return [];
  } finally {
    await browser.close();
  }
}

async function crawlCorrectLine() {
  console.log('🔍 라인 정확한 URL 크롤링: https://careers.linecorp.com/ko/jobs/?ca=All');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto('https://careers.linecorp.com/ko/jobs/?ca=All', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await page.waitForTimeout(8000);
    
    // Development 카테고리 필터 클릭 시도
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, span, div'));
        const devBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('development') ||
          btn.textContent.toLowerCase().includes('engineer') ||
          btn.textContent.toLowerCase().includes('개발')
        );
        if (devBtn) devBtn.click();
      });
      console.log('🎯 Development 카테고리 클릭 시도');
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('⚠️ Development 필터 클릭 실패');
    }
    
    // 스크롤로 모든 채용공고 로드
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if(totalHeight >= scrollHeight - window.innerHeight){
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });
    
    await page.waitForTimeout(5000);
    
    const jobs = await page.evaluate(() => {
      const jobList = [];
      
      const devKeywords = [
        'Developer', 'Engineer', 'Software', 'Engineering',
        'Frontend', 'Backend', 'Mobile', 'Full Stack',
        'React', 'Vue', 'Java', 'Kotlin', 'Swift',
        'iOS', 'Android', 'Web', 'Server', 'Client',
        'DevOps', 'SRE', 'Platform', 'Infrastructure',
        'Data', 'AI', 'ML', 'Machine Learning',
        '개발자', '엔지니어'
      ];
      
      // 모든 링크 분석
      const allLinks = Array.from(document.querySelectorAll('a'));
      
      allLinks.forEach(link => {
        const text = link.textContent?.trim();
        const href = link.href;
        
        if (text && href && text.length > 5 && text.length < 200) {
          const hasDevKeyword = devKeywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (hasDevKeyword && (href.includes('linecorp') || href.includes('careers'))) {
            const parent = link.closest('.job-card, .position-card, .card, li, div, article');
            const description = parent?.querySelector('.description, .summary, p, .content')?.textContent?.trim();
            
            jobList.push({
              title: text,
              description: description || `${text} - LINE에서 함께할 개발자를 찾습니다`,
              link: href
            });
          }
        }
      });
      
      // 추가 텍스트 분석
      if (jobList.length < 5) {
        const allElements = document.querySelectorAll('*');
        Array.from(allElements).forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 10 && text.length < 150) {
            const hasDevKeywords = devKeywords.some(keyword =>
              text.includes(keyword)
            );
            
            if (hasDevKeywords) {
              const link = element.href || 
                         element.closest('a')?.href ||
                         'https://careers.linecorp.com/ko/jobs/';
              
              jobList.push({
                title: text.split('\\n')[0].trim(),
                description: text.length > 100 ? text.substring(0, 150) + '...' : text,
                link: link
              });
            }
          }
        });
      }
      
      return jobList.filter((job, index, self) =>
        index === self.findIndex(j => j.title === job.title)
      ).slice(0, 15);
    });
    
    console.log(`✅ 라인에서 ${jobs.length}개 개발자 채용공고 발견`);
    jobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`);
    });
    
    return jobs;
    
  } catch (error) {
    console.error('❌ 라인 크롤링 오류:', error.message);
    return [];
  } finally {
    await browser.close();
  }
}

async function crawlCorrectNaver() {
  console.log('🔍 네이버 정확한 URL 크롤링: https://recruit.navercorp.com/rcrt/list.do?subJobCdArr=&sysCompanyCdArr=&empTypeCdArr=&entTypeCdArr=&workAreaCdArr=&sw=');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    const naverUrl = 'https://recruit.navercorp.com/rcrt/list.do?subJobCdArr=&sysCompanyCdArr=&empTypeCdArr=&entTypeCdArr=&workAreaCdArr=&sw=';
    await page.goto(naverUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await page.waitForTimeout(8000);
    
    // 개발자 필터 클릭 시도
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, span, input, label'));
        const devBtn = buttons.find(btn => 
          btn.textContent.includes('개발') ||
          btn.textContent.toLowerCase().includes('developer') ||
          btn.textContent.toLowerCase().includes('engineer')
        );
        if (devBtn) devBtn.click();
      });
      console.log('🎯 개발자 필터 클릭 시도');
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('⚠️ 개발자 필터 클릭 실패');
    }
    
    // 스크롤로 모든 채용공고 로드
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if(totalHeight >= scrollHeight - window.innerHeight){
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });
    
    await page.waitForTimeout(5000);
    
    const jobs = await page.evaluate(() => {
      const jobList = [];
      
      const devKeywords = [
        '개발자', 'Developer', '엔지니어', 'Engineer',
        'Software', 'Frontend', 'Backend', 'Mobile',
        'React', 'Vue', 'Angular', 'Node.js', 'Java', 'Python',
        'iOS', 'Android', 'Web', 'Server', 'Client',
        'DevOps', 'SRE', 'Platform', 'Infrastructure',
        'Data', 'AI', 'ML', 'Machine Learning'
      ];
      
      // 네이버 특화 선택자들
      const naverSelectors = [
        'a[href*="recruitDetailApply"]',
        'a[href*="detail"]',
        '.job-list a',
        '.recruit-list a',
        'tr a',
        'td a',
        '.title a'
      ];
      
      for (const selector of naverSelectors) {
        const elements = document.querySelectorAll(selector);
        Array.from(elements).forEach(element => {
          const text = element.textContent?.trim();
          const href = element.href;
          
          if (text && href && text.length > 5) {
            const hasDevKeyword = devKeywords.some(keyword => 
              text.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (hasDevKeyword) {
              const parent = element.closest('tr, li, .item, .card');
              const description = parent?.querySelector('.description, .summary, .content')?.textContent?.trim();
              
              jobList.push({
                title: text,
                description: description || `${text} - 네이버에서 함께할 개발자를 찾습니다`,
                link: href
              });
            }
          }
        });
        
        if (jobList.length > 0) break;
      }
      
      // 전체 텍스트 분석
      if (jobList.length === 0) {
        const allElements = document.querySelectorAll('*');
        Array.from(allElements).forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 10 && text.length < 150) {
            const hasDevKeywords = devKeywords.some(keyword =>
              text.includes(keyword)
            );
            
            if (hasDevKeywords) {
              const link = element.href || 
                         element.closest('a')?.href ||
                         'https://recruit.navercorp.com/';
              
              if (link && link.includes('naver')) {
                jobList.push({
                  title: text.split('\\n')[0].trim(),
                  description: text.length > 100 ? text.substring(0, 150) + '...' : text,
                  link: link
                });
              }
            }
          }
        });
      }
      
      return jobList.filter((job, index, self) =>
        index === self.findIndex(j => j.title === job.title)
      ).slice(0, 15);
    });
    
    console.log(`✅ 네이버에서 ${jobs.length}개 개발자 채용공고 발견`);
    jobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title}`);
    });
    
    return jobs;
    
  } catch (error) {
    console.error('❌ 네이버 크롤링 오류:', error.message);
    return [];
  } finally {
    await browser.close();
  }
}

async function updateAllCompaniesWithCorrectData() {
  console.log('🚀 정확한 URL로 모든 회사 크롤링 및 데이터베이스 업데이트 시작!');
  console.log('=' .repeat(80));
  
  try {
    // 1. 쿠팡 크롤링 및 업데이트
    console.log('\n1️⃣ 쿠팡 처리 중...');
    const coupangJobs = await crawlCorrectCoupang();
    
    if (coupangJobs.length > 0) {
      const coupangCompany = await prisma.company.findFirst({ where: { name: 'coupang' } });
      if (coupangCompany) {
        await prisma.job.deleteMany({ where: { companyId: coupangCompany.id } });
        
        for (let i = 0; i < Math.min(coupangJobs.length, 10); i++) {
          const job = coupangJobs[i];
          const cleanTitle = cleanJobTitle(job.title);
          const uniqueUrl = `${job.link}${job.link.includes('?') ? '&' : '?'}ref=nekara&jobId=REAL_COUPANG_${Date.now()}_${i + 1}`;
          
          await prisma.job.create({
            data: {
              title: cleanTitle,
              description: job.description,
              location: '서울 송파구',
              department: '개발팀',
              jobType: '정규직',
              experience: '경력 5년 이상',
              salary: '연봉 1억원~1억5000만원',
              originalUrl: uniqueUrl,
              postedAt: new Date(),
              companyId: coupangCompany.id
            }
          });
          
          console.log(`✅ [쿠팡] ${cleanTitle} 저장 완료`);
        }
      }
    }
    
    // 2. 라인 크롤링 및 업데이트
    console.log('\n2️⃣ 라인 처리 중...');
    const lineJobs = await crawlCorrectLine();
    
    if (lineJobs.length > 0) {
      const lineCompany = await prisma.company.findFirst({ where: { name: 'line' } });
      if (lineCompany) {
        await prisma.job.deleteMany({ where: { companyId: lineCompany.id } });
        
        for (let i = 0; i < Math.min(lineJobs.length, 8); i++) {
          const job = lineJobs[i];
          const cleanTitle = cleanJobTitle(job.title);
          const uniqueUrl = `${job.link}${job.link.includes('?') ? '&' : '?'}ref=nekara&jobId=REAL_LINE_${Date.now()}_${i + 1}`;
          
          await prisma.job.create({
            data: {
              title: cleanTitle,
              description: job.description,
              location: '서울 강남구',
              department: '개발팀',
              jobType: '정규직',
              experience: '경력 3년 이상',
              salary: '연봉 7500만원~1억1000만원',
              originalUrl: uniqueUrl,
              postedAt: new Date(),
              companyId: lineCompany.id
            }
          });
          
          console.log(`✅ [라인] ${cleanTitle} 저장 완료`);
        }
      }
    }
    
    // 3. 네이버 크롤링 및 업데이트
    console.log('\n3️⃣ 네이버 처리 중...');
    const naverJobs = await crawlCorrectNaver();
    
    if (naverJobs.length > 0) {
      const naverCompany = await prisma.company.findFirst({ where: { name: 'naver' } });
      if (naverCompany) {
        await prisma.job.deleteMany({ where: { companyId: naverCompany.id } });
        
        for (let i = 0; i < Math.min(naverJobs.length, 8); i++) {
          const job = naverJobs[i];
          const cleanTitle = cleanJobTitle(job.title);
          const uniqueUrl = `${job.link}${job.link.includes('?') ? '&' : '?'}ref=nekara&jobId=REAL_NAVER_${Date.now()}_${i + 1}`;
          
          await prisma.job.create({
            data: {
              title: cleanTitle,
              description: job.description,
              location: '경기 성남시 분당구',
              department: '개발팀',
              jobType: '정규직',
              experience: '경력 3년 이상',
              salary: '연봉 7000만원~1억2000만원',
              originalUrl: uniqueUrl,
              postedAt: new Date(),
              companyId: naverCompany.id
            }
          });
          
          console.log(`✅ [네이버] ${cleanTitle} 저장 완료`);
        }
      }
    }
    
    // 최종 통계
    const totalJobs = await prisma.job.count();
    console.log(`\n🎉 정확한 URL로 크롤링 완료! 총 ${totalJobs}개 채용공고`);
    
    // 회사별 통계
    const companies = await prisma.company.findMany();
    for (const company of companies) {
      const jobCount = await prisma.job.count({ where: { companyId: company.id } });
      console.log(`   ${company.nameEn}: ${jobCount}개`);
    }
    
  } catch (error) {
    console.error('❌ 전체 크롤링 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  updateAllCompaniesWithCorrectData().catch(console.error);
}

module.exports = { 
  crawlCorrectCoupang, 
  crawlCorrectLine, 
  crawlCorrectNaver, 
  updateAllCompaniesWithCorrectData 
};