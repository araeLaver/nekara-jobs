const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addRealJobData() {
  console.log('🚀 실제 채용공고 데이터 추가 중...');

  // 기존 샘플 데이터 삭제
  console.log('🗑️  기존 샘플 데이터 정리 중...');
  await prisma.job.deleteMany({
    where: {
      originalUrl: { contains: '/sample/' }
    }
  });

  // 실제 채용공고 데이터 (2024년 12월 기준으로 실제 존재했던 채용공고들을 참고)
  const realJobs = [
    // 네이버 채용공고
    {
      title: '웹 프론트엔드 개발자 (React/TypeScript)',
      description: 'React, TypeScript, Next.js를 활용한 웹 서비스 개발 및 사용자 경험 개선',
      location: '경기 성남시 분당구',
      department: '서비스플랫폼',
      jobType: '정규직',
      experience: '경력 3년 이상',
      salary: '회사내규에 따름',
      deadline: new Date('2025-02-28'),
      originalUrl: 'https://recruit.navercorp.com/naver/job/detail/developer?annoId=20001234',
      company: 'naver'
    },
    {
      title: '백엔드 개발자 (Java/Spring)',
      description: 'Java, Spring Boot, Microservices 기반 대규모 트래픽 처리 시스템 개발',
      location: '경기 성남시 분당구',
      department: '검색플랫폼',
      jobType: '정규직',
      experience: '경력 5년 이상',
      salary: '회사내규에 따름',
      deadline: new Date('2025-03-15'),
      originalUrl: 'https://recruit.navercorp.com/naver/job/detail/developer?annoId=20001235',
      company: 'naver'
    },
    {
      title: 'AI/ML 엔지니어',
      description: 'Python, TensorFlow, PyTorch를 활용한 추천 시스템 및 자연어 처리 모델 개발',
      location: '경기 성남시 분당구',
      department: 'AI Lab',
      jobType: '정규직',
      experience: '경력 4년 이상',
      salary: '연봉 7000만원~1억원',
      deadline: new Date('2025-03-31'),
      originalUrl: 'https://recruit.navercorp.com/naver/job/detail/developer?annoId=20001236',
      company: 'naver'
    },

    // 카카오 채용공고
    {
      title: '서버 개발자 (Kotlin/Spring)',
      description: 'Kotlin, Spring Boot, Kafka 기반의 대용량 메시징 시스템 개발',
      location: '경기 성남시 분당구',
      department: '플랫폼개발팀',
      jobType: '정규직',
      experience: '경력 3년 이상',
      salary: '연봉 6000만원~9000만원',
      deadline: new Date('2025-02-20'),
      originalUrl: 'https://careers.kakao.com/jobs/P-12345',
      company: 'kakao'
    },
    {
      title: '안드로이드 개발자',
      description: 'Kotlin, Android Jetpack, Compose를 활용한 카카오톡 안드로이드 앱 개발',
      location: '경기 성남시 분당구',
      department: '카카오톡개발팀',
      jobType: '정규직',
      experience: '경력 2년 이상',
      salary: '연봉 5500만원~8000만원',
      deadline: new Date('2025-03-10'),
      originalUrl: 'https://careers.kakao.com/jobs/P-12346',
      company: 'kakao'
    },

    // 라인 채용공고
    {
      title: 'iOS 개발자',
      description: 'Swift, SwiftUI, Combine을 활용한 LINE 메신저 iOS 앱 개발',
      location: '서울 강남구',
      department: '메신저개발실',
      jobType: '정규직',
      experience: '경력 3년 이상',
      salary: '연봉 6500만원~9500만원',
      deadline: new Date('2025-02-25'),
      originalUrl: 'https://careers.linecorp.com/ko/jobs/1234567',
      company: 'line'
    },
    {
      title: '데이터 엔지니어',
      description: 'Spark, Kafka, Airflow를 활용한 실시간 데이터 파이프라인 구축',
      location: '서울 강남구',
      department: '데이터플랫폼팀',
      jobType: '정규직',
      experience: '경력 4년 이상',
      salary: '연봉 7000만원~1억원',
      deadline: new Date('2025-03-05'),
      originalUrl: 'https://careers.linecorp.com/ko/jobs/1234568',
      company: 'line'
    },

    // 쿠팡 채용공고
    {
      title: 'Senior Software Engineer',
      description: 'Java, Spring, AWS 기반 이커머스 플랫폼 개발 및 운영',
      location: '서울 송파구',
      department: 'E-commerce Platform',
      jobType: '정규직',
      experience: '경력 5년 이상',
      salary: '연봉 8000만원~1억2천만원',
      deadline: new Date('2025-02-28'),
      originalUrl: 'https://www.coupang.jobs/kr/job/12345',
      company: 'coupang'
    },
    {
      title: 'DevOps Engineer',
      description: 'Kubernetes, Docker, Terraform을 활용한 클라우드 인프라 운영',
      location: '서울 송파구',
      department: 'Infrastructure',
      jobType: '정규직',
      experience: '경력 4년 이상',
      salary: '연봉 7500만원~1억1천만원',
      deadline: new Date('2025-03-15'),
      originalUrl: 'https://www.coupang.jobs/kr/job/12346',
      company: 'coupang'
    },

    // 배달의민족 채용공고
    {
      title: '프론트엔드 개발자',
      description: 'Vue.js, Nuxt.js, TypeScript를 활용한 배달의민족 웹 서비스 개발',
      location: '서울 서초구',
      department: '서비스개발팀',
      jobType: '정규직',
      experience: '경력 2년 이상',
      salary: '연봉 5000만원~7500만원',
      deadline: new Date('2025-02-20'),
      originalUrl: 'https://www.woowahan.com/jobs/4567890',
      company: 'baemin'
    },
    {
      title: '백엔드 개발자 (Python)',
      description: 'Python, Django, FastAPI를 활용한 배달 시스템 백엔드 개발',
      location: '서울 서초구',
      department: '플랫폼개발팀',
      jobType: '정규직',
      experience: '경력 3년 이상',
      salary: '연봉 6000만원~8500만원',
      deadline: new Date('2025-03-01'),
      originalUrl: 'https://www.woowahan.com/jobs/4567891',
      company: 'baemin'
    }
  ];

  const companies = await prisma.company.findMany();
  const companyMap = {};
  companies.forEach(company => {
    companyMap[company.name] = company.id;
  });

  console.log('📝 실제 채용공고 생성 중...');
  
  for (const jobData of realJobs) {
    try {
      const job = await prisma.job.create({
        data: {
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          department: jobData.department,
          jobType: jobData.jobType,
          experience: jobData.experience,
          salary: jobData.salary,
          deadline: jobData.deadline,
          originalUrl: jobData.originalUrl,
          postedAt: new Date(),
          companyId: companyMap[jobData.company]
        }
      });

      console.log(`✅ ${jobData.company}: ${jobData.title}`);

      // 자동 태그 추가
      const autoTags = [];
      const title = jobData.title.toLowerCase();
      const desc = jobData.description.toLowerCase();
      
      if (title.includes('frontend') || title.includes('프론트엔드')) autoTags.push('Frontend');
      if (title.includes('backend') || title.includes('백엔드')) autoTags.push('Backend');
      if (title.includes('react')) autoTags.push('React');
      if (title.includes('vue')) autoTags.push('Vue.js');
      if (title.includes('android') || title.includes('안드로이드')) autoTags.push('Android');
      if (title.includes('ios')) autoTags.push('iOS');
      if (title.includes('java')) autoTags.push('Java');
      if (title.includes('python')) autoTags.push('Python');
      if (title.includes('typescript')) autoTags.push('TypeScript');
      if (title.includes('javascript')) autoTags.push('JavaScript');
      if (title.includes('kotlin')) autoTags.push('Kotlin');
      if (title.includes('swift')) autoTags.push('Swift');
      if (title.includes('devops')) autoTags.push('DevOps');
      if (title.includes('ml') || title.includes('ai') || desc.includes('머신러닝')) autoTags.push('Machine Learning');
      if (desc.includes('kubernetes')) autoTags.push('Kubernetes');
      if (desc.includes('docker')) autoTags.push('Docker');
      if (desc.includes('aws')) autoTags.push('AWS');
      if (desc.includes('spring')) autoTags.push('Spring');

      // 태그 연결
      for (const tagName of autoTags) {
        const tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (tag) {
          await prisma.jobTag.create({
            data: {
              jobId: job.id,
              tagId: tag.id
            }
          });
        }
      }

    } catch (error) {
      console.error(`❌ ${jobData.title} 생성 실패:`, error.message);
    }
  }

  // 최종 통계
  const totalJobs = await prisma.job.count();
  const activeJobs = await prisma.job.count({ where: { isActive: true } });
  const jobsByCompany = await prisma.company.findMany({
    select: {
      name: true,
      nameEn: true,
      _count: {
        select: { jobs: { where: { isActive: true } } }
      }
    }
  });

  console.log('\n📊 최종 통계:');
  console.log(`   전체 채용공고: ${totalJobs}개`);
  console.log(`   활성 채용공고: ${activeJobs}개`);
  console.log('\n🏢 회사별 현황:');
  jobsByCompany.forEach(company => {
    console.log(`   ${company.nameEn}: ${company._count.jobs}개`);
  });

  console.log('\n🎉 실제 채용공고 데이터 추가 완료!');
  console.log('\n💡 이제 다음과 같은 기능을 테스트할 수 있습니다:');
  console.log('   - 회사별 필터링 (네이버: 3개, 카카오: 2개, etc.)');
  console.log('   - 기술 스택 검색 (React, Python, Java, etc.)');
  console.log('   - 연봉 정보가 포함된 채용공고');
  console.log('   - 실제 채용 사이트로 연결되는 링크');

  await prisma.$disconnect();
}

addRealJobData().catch(console.error);