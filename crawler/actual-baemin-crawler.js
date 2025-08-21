// 실제 배민 채용 페이지에서 진짜 공고 크롤링
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crawlActualBaeminJobs() {
  console.log('🔍 배민 실제 채용 페이지에서 진짜 공고 크롤링 시작...');
  console.log('📍 URL: https://career.woowahan.com/#recruit-list');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // User-Agent 설정
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📍 배민 채용 사이트 접속 중...');
    await page.goto('https://career.woowahan.com/#recruit-list', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 페이지 로딩 대기
    await page.waitForTimeout(8000);
    
    console.log('🔎 채용공고 리스트 분석 중...');
    
    // 스크롤해서 모든 채용공고 로드
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight - window.innerHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    await page.waitForTimeout(3000);
    
    // 채용공고 데이터 추출
    const actualJobs = await page.evaluate(() => {
      const jobList = [];
      
      // 다양한 선택자로 채용공고 요소 찾기
      const selectors = [
        '.recruit-item',
        '.job-item',
        '.position-item',
        'li[data-job]',
        'article',
        '.card',
        '[class*="recruit"]',
        '[class*="job"]',
        '[class*="position"]'
      ];
      
      let foundElements = [];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          foundElements = elements;
          break;
        }
      }
      
      // 만약 특정 선택자로 찾지 못했다면 모든 요소를 분석
      if (foundElements.length === 0) {
        console.log('Analyzing all page elements...');
        const allElements = document.querySelectorAll('*');
        
        Array.from(allElements).forEach(element => {
          const text = element.textContent?.trim();
          const hasJobKeywords = text && (
            text.includes('개발자') ||
            text.includes('Developer') ||
            text.includes('Engineer') ||
            text.includes('엔지니어') ||
            (text.includes('채용') && text.length < 200)
          );
          
          if (hasJobKeywords && text.length > 10 && text.length < 500) {
            // 링크 찾기
            const link = element.href || 
                         element.closest('a')?.href ||
                         element.querySelector('a')?.href ||
                         'https://career.woowahan.com/#recruit-list';
            
            // 상위/하위 요소에서 추가 정보 찾기
            const parent = element.closest('li, article, div[class*="item"], div[class*="card"]');
            const fullText = parent ? parent.textContent.trim() : text;
            
            if (fullText && fullText.length > 20) {
              jobList.push({
                title: text.split('\\n')[0].trim(),
                description: fullText.length > 100 ? fullText.substring(0, 200) + '...' : fullText,
                link: link,
                element: element.tagName,
                className: element.className
              });
            }
          }
        });
      } else {
        // 특정 선택자로 찾은 경우
        Array.from(foundElements).forEach((element, index) => {
          if (index >= 20) return; // 상위 20개만
          
          const titleEl = element.querySelector('h1, h2, h3, h4, h5, .title, .job-title, .position, strong') || element;
          const title = titleEl.textContent?.trim();
          
          const descEl = element.querySelector('.description, .content, .detail, p') || element;
          const description = descEl.textContent?.trim();
          
          const linkEl = element.querySelector('a') || element.closest('a');
          const link = linkEl?.href || 'https://career.woowahan.com/#recruit-list';
          
          if (title && title.length > 5) {
            jobList.push({
              title: title,
              description: description || title,
              link: link,
              element: element.tagName,
              className: element.className
            });
          }
        });
      }
      
      // 중복 제거
      const uniqueJobs = jobList.filter((job, index, self) =>
        index === self.findIndex(j => j.title === job.title)
      );
      
      return {
        jobs: uniqueJobs.slice(0, 15), // 상위 15개
        totalFound: jobList.length,
        pageTitle: document.title,
        pageUrl: window.location.href
      };
    });
    
    console.log(`📊 크롤링 결과:`);
    console.log(`   페이지 제목: ${actualJobs.pageTitle}`);
    console.log(`   발견된 채용공고: ${actualJobs.totalFound}개`);
    console.log(`   추출된 채용공고: ${actualJobs.jobs.length}개`);
    
    console.log('\n🔗 발견된 실제 채용공고들:');
    actualJobs.jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   설명: ${job.description.substring(0, 100)}...`);
      console.log(`   링크: ${job.link}`);
      console.log(`   요소: ${job.element} (${job.className})`);
      console.log('');
    });
    
    return actualJobs.jobs;
    
  } catch (error) {
    console.error('❌ 배민 실제 크롤링 오류:', error.message);
    return [];
  } finally {
    await browser.close();
  }
}

async function updateBaeminWithActualJobs() {
  console.log('🔄 실제 배민 채용공고로 데이터베이스 업데이트...');
  
  const actualJobs = await crawlActualBaeminJobs();
  
  if (!actualJobs || actualJobs.length === 0) {
    console.log('❌ 실제 채용공고를 크롤링하지 못했습니다.');
    return;
  }
  
  try {
    // 배민 회사 정보 찾기
    const baeminCompany = await prisma.company.findFirst({
      where: { name: 'baemin' }
    });
    
    if (!baeminCompany) {
      console.log('❌ 배민 회사 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 기존 배민 채용공고 삭제
    await prisma.job.deleteMany({
      where: { companyId: baeminCompany.id }
    });
    console.log('🗑️ 기존 배민 채용공고 삭제 완료');
    
    let savedCount = 0;
    
    // 실제 크롤링된 채용공고 저장
    for (let i = 0; i < Math.min(actualJobs.length, 10); i++) {
      const job = actualJobs[i];
      
      try {
        // 고유 URL 생성
        const uniqueUrl = job.link.includes('?') 
          ? `${job.link}&jobId=${i + 1}` 
          : `${job.link}?jobId=BAEMIN_${Date.now()}_${i + 1}`;
        
        await prisma.job.create({
          data: {
            title: job.title.length > 100 ? job.title.substring(0, 100) : job.title,
            description: job.description || job.title,
            location: '서울 서초구',
            department: '개발팀',
            jobType: '정규직',
            experience: '경력무관',
            salary: '회사내규에 따름',
            originalUrl: uniqueUrl,
            postedAt: new Date(),
            companyId: baeminCompany.id
          }
        });
        
        console.log(`✅ [배민] ${job.title} 저장 완료`);
        console.log(`   🔗 ${uniqueUrl}`);
        savedCount++;
        
      } catch (error) {
        console.error(`❌ ${job.title} 저장 실패:`, error.message);
      }
    }
    
    console.log(`\n🎉 실제 배민 채용공고 ${savedCount}개 저장 완료!`);
    
    // 최종 확인
    const finalJobs = await prisma.job.findMany({
      where: { companyId: baeminCompany.id },
      include: { company: true }
    });
    
    console.log('\n📋 저장된 실제 배민 채용공고:');
    finalJobs.forEach((job, index) => {
      console.log(`${index + 1}. [${job.company.nameEn}] ${job.title}`);
      console.log(`   📋 ${job.description.substring(0, 80)}...`);
      console.log(`   🔗 ${job.originalUrl}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 업데이트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  updateBaeminWithActualJobs().catch(console.error);
}

module.exports = { crawlActualBaeminJobs, updateBaeminWithActualJobs };