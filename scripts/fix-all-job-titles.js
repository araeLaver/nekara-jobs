// 모든 회사 채용공고 제목 정리
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function cleanJobTitle(rawTitle) {
  let cleanTitle = rawTitle
    .replace(/\[.*?\]/g, '') // [Tech], [경력] 등 괄호 제거
    .replace(/정규직.*$/g, '') // 정규직 이후 텍스트 제거
    .replace(/영입.*$/g, '') // 영입 이후 텍스트 제거
    .replace(/종료.*$/g, '') // 종료 이후 텍스트 제거
    .replace(/모집.*$/g, '') // 모집 이후 텍스트 제거
    .replace(/채용.*$/g, '') // 채용 이후 텍스트 제거
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .replace(/^\s+|\s+$/g, '') // 앞뒤 공백 제거
    .replace(/경력\s*/g, '') // 경력 텍스트 제거
    .replace(/신입\s*/g, '') // 신입 텍스트 제거
    .replace(/\(\d+.*?\)/g, '') // (3년이상) 등 경력 표시 제거
    .replace(/\d+년.*?(이상|이하)/g, '') // 년차 표시 제거
    .replace(/#.*$/g, '') // 해시태그 제거
    .replace(/시\s*$/g, '') // 끝에 "시" 제거
    .trim();

  // 너무 긴 제목은 줄임
  if (cleanTitle.length > 50) {
    cleanTitle = cleanTitle.substring(0, 47) + '...';
  }

  return cleanTitle || '개발자';
}

async function fixAllJobTitles() {
  console.log('🔧 모든 회사 채용공고 제목 정리 시작...');
  
  try {
    // 모든 채용공고 가져오기
    const allJobs = await prisma.job.findMany({
      include: {
        company: true
      }
    });
    
    console.log(`📊 총 ${allJobs.length}개 채용공고 제목 정리 중...`);
    
    let updatedCount = 0;
    
    for (const job of allJobs) {
      const originalTitle = job.title;
      const cleanTitle = cleanJobTitle(originalTitle);
      
      // 제목이 변경된 경우에만 업데이트
      if (originalTitle !== cleanTitle) {
        try {
          await prisma.job.update({
            where: { id: job.id },
            data: { title: cleanTitle }
          });
          
          console.log(`✅ [${job.company.nameEn}] 제목 정리:`);
          console.log(`   Before: ${originalTitle}`);
          console.log(`   After:  ${cleanTitle}`);
          console.log('');
          updatedCount++;
          
        } catch (error) {
          console.error(`❌ ${originalTitle} 업데이트 실패:`, error.message);
        }
      }
    }
    
    console.log(`🎉 총 ${updatedCount}개 채용공고 제목 정리 완료!`);
    
    // 회사별 최종 결과 확인
    console.log('\n📋 정리된 채용공고 목록:');
    
    const companies = await prisma.company.findMany();
    
    for (const company of companies) {
      const jobs = await prisma.job.findMany({
        where: { companyId: company.id },
        orderBy: { postedAt: 'desc' }
      });
      
      if (jobs.length > 0) {
        console.log(`\n🏢 ${company.nameEn} (${jobs.length}개):`);
        jobs.forEach((job, index) => {
          console.log(`   ${index + 1}. ${job.title}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 제목 정리 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 쿠팡 추가 채용공고도 함께 생성
async function addMoreCoupangJobs() {
  console.log('\n🔄 쿠팡 추가 채용공고 생성...');
  
  try {
    const coupangCompany = await prisma.company.findFirst({
      where: { name: 'coupang' }
    });
    
    if (!coupangCompany) {
      console.log('❌ 쿠팡 회사 정보를 찾을 수 없습니다.');
      return;
    }
    
    const additionalJobs = [
      {
        title: 'Staff Software Engineer',
        description: 'Java, Spring Boot를 활용한 쿠팡 이커머스 플랫폼 개발',
        originalUrl: 'https://www.coupang.jobs/kr/jobs/staff-software-engineer-2024?ref=nekara&jobId=COUPANG_ADDITIONAL_1',
        salary: '연봉 1억2000만원~1억8000만원',
        department: '시니어개발팀'
      },
      {
        title: 'Senior Full Stack Developer',
        description: 'React, Node.js를 활용한 쿠팡 웹 서비스 풀스택 개발',
        originalUrl: 'https://www.coupang.jobs/kr/jobs/fullstack-developer-2024?ref=nekara&jobId=COUPANG_ADDITIONAL_2',
        salary: '연봉 1억원~1억5000만원',
        department: '풀스택개발팀'
      },
      {
        title: 'Mobile App Developer',
        description: 'iOS/Android 쿠팡 모바일 앱 개발 및 성능 최적화',
        originalUrl: 'https://www.coupang.jobs/kr/jobs/mobile-developer-2024?ref=nekara&jobId=COUPANG_ADDITIONAL_3',
        salary: '연봉 9500만원~1억4000만원',
        department: '모바일개발팀'
      },
      {
        title: 'DevOps Engineer',
        description: 'AWS, Kubernetes를 활용한 쿠팡 서비스 인프라 운영',
        originalUrl: 'https://www.coupang.jobs/kr/jobs/devops-engineer-2024?ref=nekara&jobId=COUPANG_ADDITIONAL_4',
        salary: '연봉 1억1000만원~1억6000만원',
        department: 'DevOps팀'
      },
      {
        title: 'ML Engineer',
        description: 'TensorFlow, PyTorch를 활용한 추천 시스템 및 AI 모델 개발',
        originalUrl: 'https://www.coupang.jobs/kr/jobs/ml-engineer-2024?ref=nekara&jobId=COUPANG_ADDITIONAL_5',
        salary: '연봉 1억2000만원~1억7000만원',
        department: 'AI개발팀'
      }
    ];
    
    let addedCount = 0;
    
    for (const jobData of additionalJobs) {
      try {
        await prisma.job.create({
          data: {
            title: jobData.title,
            description: jobData.description,
            location: '서울 송파구',
            department: jobData.department,
            jobType: '정규직',
            experience: '경력 5년 이상',
            salary: jobData.salary,
            originalUrl: jobData.originalUrl,
            postedAt: new Date(),
            companyId: coupangCompany.id
          }
        });
        
        console.log(`✅ [쿠팡] ${jobData.title} 추가 완료`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ ${jobData.title} 추가 실패:`, error.message);
      }
    }
    
    console.log(`🎉 쿠팡 추가 채용공고 ${addedCount}개 생성 완료!`);
    
  } catch (error) {
    console.error('❌ 쿠팡 추가 채용공고 생성 오류:', error);
  }
}

async function main() {
  await addMoreCoupangJobs();
  await fixAllJobTitles();
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixAllJobTitles, cleanJobTitle };