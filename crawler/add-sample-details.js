const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 실제 채용공고 상세 내용 샘플
const sampleJobDetails = {
  toss: [
    {
      title: "Backend Engineer",
      description: `🚀 토스에서 Backend Engineer를 모집합니다

**업무 내용**
- 토스의 핵심 금융 서비스 백엔드 시스템 개발
- 대용량 트래픽을 처리하는 안정적인 API 설계 및 구현
- 마이크로서비스 아키텍처 기반의 시스템 구축
- 데이터베이스 최적화 및 성능 튜닝
- 결제, 송금, 대출 등 금융 도메인 서비스 개발

**자격 요건**
- Java, Kotlin, Spring Boot를 이용한 백엔드 개발 경험 3년 이상
- RESTful API 설계 및 개발 경험
- 관계형 데이터베이스(MySQL, PostgreSQL) 사용 경험
- Git, Docker 등 개발 도구 사용 경험
- 금융권 또는 핀테크 경험 우대

**우대 사항**
- AWS, GCP 등 클라우드 환경에서의 개발 경험
- 대용량 트래픽 처리 경험
- MSA(Microservices Architecture) 구축 경험
- Kafka, Redis 등 미들웨어 사용 경험
- 금융 도메인 지식

**복리후생**
- 경쟁력 있는 연봉 및 스톡옵션
- 최고 사양의 개발 장비 지원
- 도서구입비, 컨퍼런스 참가비 지원
- 건강검진, 의료비 지원
- 자유로운 휴가 제도`,
      requirements: "Java/Kotlin 3년 이상, Spring Boot, RESTful API, 데이터베이스"
    },
    {
      title: "Frontend Engineer",
      description: `💻 토스에서 Frontend Engineer를 모집합니다

**업무 내용**
- 토스 앱의 사용자 인터페이스 개발
- React, TypeScript를 활용한 웹 애플리케이션 개발
- 모바일 웹 최적화 및 성능 개선
- 디자인 시스템 구축 및 컴포넌트 라이브러리 관리
- A/B 테스트를 통한 UX 개선

**자격 요건**
- React, TypeScript를 이용한 프론트엔드 개발 경험 3년 이상
- HTML5, CSS3, JavaScript ES6+ 숙련
- Webpack, Babel 등 빌드 도구 사용 경험
- Git, 코드 리뷰 경험
- 반응형 웹, 크로스 브라우징 경험

**우대 사항**
- Next.js, Gatsby 등 React 프레임워크 사용 경험
- 모바일 앱 개발 경험 (React Native)
- 디자인 시스템 구축 경험
- 웹 성능 최적화 경험
- 금융 서비스 개발 경험

**복리후생**
- 최신 MacBook Pro, 듀얼 모니터 지원
- 자유로운 출퇴근 시간
- 재택근무 지원
- 교육비, 도서비 지원
- 건강관리 지원금`,
      requirements: "React/TypeScript 3년 이상, HTML/CSS/JavaScript, Webpack"
    }
  ],
  kakao: [
    {
      title: "AI/ML Engineer",
      description: `🤖 카카오에서 AI/ML Engineer를 모집합니다

**업무 내용**
- 카카오톡, 카카오맵 등 서비스의 AI 기능 개발
- 추천 시스템, 검색 엔진 개발 및 개선
- 자연어처리, 컴퓨터비전 모델 개발
- 대화형 AI 서비스 개발
- MLOps 파이프라인 구축 및 운영

**자격 요건**
- Python을 이용한 머신러닝/딥러닝 모델 개발 경험 3년 이상
- TensorFlow, PyTorch 등 ML 프레임워크 사용 경험
- 통계, 수학에 대한 이해
- 대용량 데이터 처리 경험
- 논문 구현 및 모델 최적화 경험

**우대 사항**
- 추천시스템, 검색엔진 개발 경험
- NLP, Computer Vision 분야 전문성
- Kubernetes, Docker를 이용한 모델 서빙 경험
- 관련 논문 발표 경험
- 대화형 AI 개발 경험

**복리후생**
- 카카오 제주 캠퍼스 근무 가능
- 최고급 GPU 서버 지원
- 국내외 컨퍼런스 참가 지원
- 연구 환경 조성
- 카카오 모든 서비스 프리미엄`,
      requirements: "Python 3년 이상, TensorFlow/PyTorch, 통계/수학, 대용량 데이터"
    }
  ],
  carrot: [
    {
      title: "Mobile App Developer",
      description: `📱 당근마켓에서 Mobile App Developer를 모집합니다

**업무 내용**
- 당근마켓 iOS/Android 앱 개발
- 사용자 경험 개선을 위한 기능 개발
- 지역 기반 서비스 최적화
- 실시간 채팅, 알림 시스템 개발
- 앱 성능 최적화 및 안정성 향상

**자격 요건**
- iOS(Swift) 또는 Android(Kotlin/Java) 개발 경험 3년 이상
- 앱 스토어 출시 경험
- RESTful API 연동 경험
- Git을 이용한 협업 경험
- 사용자 중심적 사고

**우대 사항**
- Flutter, React Native 등 크로스플랫폼 개발 경험
- 위치 기반 서비스 개발 경험
- 대용량 사용자 대상 앱 개발 경험
- 푸시 알림, 실시간 통신 구현 경험
- 앱 성능 최적화 경험

**복리후생**
- 최신 iPhone, Galaxy 단말기 지원
- 당근 포인트 지급
- 지역 커뮤니티 참여 지원
- 유연 근무제
- 건강 관리 지원`,
      requirements: "Swift/Kotlin 3년 이상, 앱스토어 출시, RESTful API"
    }
  ]
};

async function addSampleDetails() {
  try {
    console.log('📝 샘플 상세 내용 추가 시작...');
    
    let updatedCount = 0;
    
    // 각 회사별로 처리
    for (const [companyKey, details] of Object.entries(sampleJobDetails)) {
      console.log(`\n${companyKey.toUpperCase()} 처리 중...`);
      
      const company = await prisma.company.findUnique({
        where: { name: companyKey }
      });
      
      if (!company) {
        console.log(`${companyKey} 회사를 찾을 수 없습니다.`);
        continue;
      }
      
      // 해당 회사의 채용공고들 중 description이 비어있거나 짧은 것들 찾기
      const jobs = await prisma.job.findMany({
        where: {
          companyId: company.id,
          isActive: true,
          OR: [
            { description: null },
            { description: "" },
            { description: { contains: companyKey } }, // 간단한 설명만 있는 경우
          ]
        },
        take: details.length
      });
      
      console.log(`업데이트할 ${companyKey} 채용공고: ${jobs.length}개`);
      
      // 각 채용공고에 상세 내용 추가
      for (let i = 0; i < Math.min(jobs.length, details.length); i++) {
        const job = jobs[i];
        const detail = details[i];
        
        try {
          await prisma.job.update({
            where: { id: job.id },
            data: {
              description: detail.description,
              // title이 너무 단순하면 더 구체적인 제목으로 변경
              title: job.title.length < 10 ? detail.title : job.title
            }
          });
          
          console.log(`✅ "${job.title}" 업데이트 완료`);
          updatedCount++;
          
        } catch (updateError) {
          console.error(`❌ "${job.title}" 업데이트 실패:`, updateError.message);
        }
      }
    }
    
    console.log(`\n🎉 총 ${updatedCount}개 채용공고에 상세 내용 추가 완료!`);
    
    // 업데이트 결과 확인
    const totalJobsWithDetails = await prisma.job.count({
      where: {
        isActive: true,
        description: {
          not: ""
        }
      }
    });
    
    const totalJobs = await prisma.job.count({
      where: { isActive: true }
    });
    
    console.log(`\n📊 현재 상태:`);
    console.log(`전체 활성 채용공고: ${totalJobs}개`);
    console.log(`상세 내용이 있는 공고: ${totalJobsWithDetails}개`);
    console.log(`상세 내용 비율: ${Math.round((totalJobsWithDetails / totalJobs) * 100)}%`);
    
    // 각 회사별 상세 내용 보유 현황
    const companies = await prisma.company.findMany({
      include: {
        jobs: {
          where: { isActive: true }
        }
      }
    });
    
    console.log(`\n📈 회사별 상세 내용 현황:`);
    companies.forEach(company => {
      if (company.jobs.length > 0) {
        const withDetails = company.jobs.filter(job => job.description && job.description.length > 50);
        console.log(`- ${company.nameEn}: ${withDetails.length}/${company.jobs.length}개`);
      }
    });
    
  } catch (error) {
    console.error('❌ 샘플 상세 내용 추가 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행
if (require.main === module) {
  addSampleDetails();
}

module.exports = { addSampleDetails };