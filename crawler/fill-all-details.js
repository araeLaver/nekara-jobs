const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 각 회사별 다양한 직무의 상세 내용 템플릿
const jobTemplates = {
  toss: {
    "Software Engineer": `🚀 토스에서 Software Engineer를 모집합니다

**업무 내용**
- 토스의 핵심 금융 서비스 개발
- 사용자 경험을 개선하는 기능 구현
- 대용량 트래픽을 안정적으로 처리하는 시스템 구축
- 코드 리뷰 및 기술 공유를 통한 팀 성장
- 새로운 기술 도입 및 아키텍처 개선

**자격 요건**
- 소프트웨어 개발 경험 3년 이상
- Java, Kotlin, JavaScript 등 프로그래밍 언어 활용 경험
- 데이터베이스 설계 및 활용 경험
- Git을 활용한 협업 경험
- 문제 해결 능력 및 학습 의지

**우대 사항**
- 금융 서비스 개발 경험
- 클라우드 환경(AWS, GCP) 사용 경험
- 대용량 서비스 운영 경험
- 오픈소스 기여 경험

**복리후생**
- 경쟁력 있는 연봉 및 스톡옵션
- 최고 사양의 개발 장비 지원
- 자유로운 출퇴근 시간 및 재택근무
- 도서구입비, 컨퍼런스 참가비 지원
- 건강관리 지원 및 복합문화공간 이용`,
    
    "Frontend Developer": `💻 토스에서 Frontend Developer를 모집합니다

**업무 내용**
- 토스 웹/앱 사용자 인터페이스 개발
- React, TypeScript를 활용한 현대적인 웹 애플리케이션 구축
- 디자인 시스템 구축 및 컴포넌트 라이브러리 관리
- 사용자 경험 최적화 및 성능 개선
- A/B 테스트를 통한 UI/UX 개선

**자격 요건**
- React, TypeScript 개발 경험 3년 이상
- HTML5, CSS3, JavaScript 숙련
- 반응형 웹 디자인 구현 경험
- 웹 성능 최적화 경험
- 사용자 중심적 사고

**복리후생**
- 최신 MacBook Pro, 듀얼 모니터
- 자유로운 근무 환경
- 금융 상품 우대 혜택`,

    "Backend Developer": `⚙️ 토스에서 Backend Developer를 모집합니다

**업무 내용**
- 토스 금융 서비스 백엔드 API 개발
- 마이크로서비스 아키텍처 설계 및 구현
- 데이터베이스 설계 및 최적화
- 보안 및 결제 시스템 개발
- 서비스 모니터링 및 장애 대응

**자격 요건**
- Java, Kotlin, Spring Boot 경험 3년 이상
- RESTful API 설계 및 개발
- MySQL, PostgreSQL 등 RDBMS 경험
- 대용량 트래픽 처리 경험
- 금융 도메인 이해도`
  },

  kakao: {
    "Software Engineer": `🟡 카카오에서 Software Engineer를 모집합니다

**업무 내용**
- 카카오톡, 카카오맵 등 대규모 서비스 개발
- 수억 명의 사용자가 사용하는 플랫폼 구축
- 새로운 기술 도입 및 서비스 개선
- 개발 문화 및 프로세스 개선
- 글로벌 서비스 확장 지원

**자격 요건**
- 소프트웨어 개발 경험 3년 이상
- Java, Python, JavaScript 등 개발 경험
- 대용량 서비스 개발 경험
- 팀워크 및 소통 능력
- 새로운 기술에 대한 학습 의지

**복리후생**
- 카카오 제주 캠퍼스 근무 가능
- 모든 카카오 서비스 프리미엄 제공
- 최고급 개발 장비 지원
- 국내외 컨퍼런스 참가 지원`,

    "AI Engineer": `🤖 카카오에서 AI Engineer를 모집합니다

**업무 내용**
- 카카오 서비스의 AI 기능 개발
- 머신러닝/딥러닝 모델 설계 및 구현
- 자연어처리, 컴퓨터비전 모델 개발
- AI 서비스 프로덕션 배포 및 운영
- 최신 AI 기술 연구 및 적용

**자격 요건**
- Python, TensorFlow/PyTorch 경험 3년 이상
- 머신러닝/딥러닝 모델 개발 경험
- 대용량 데이터 처리 경험
- 논문 구현 및 실험 설계 능력
- 통계학, 수학적 사고력`
  },

  carrot: {
    "Software Engineer": `🥕 당근마켓에서 Software Engineer를 모집합니다

**업무 내용**
- 당근마켓 서비스 개발 및 운영
- 지역 기반 매칭 알고리즘 개발
- 사용자 경험 개선을 위한 기능 개발
- 안전한 거래 환경 조성을 위한 시스템 구축
- 지역 커뮤니티 활성화 기능 개발

**자격 요건**
- 웹/앱 개발 경험 3년 이상
- Python, JavaScript 등 개발 경험
- 사용자 중심적 사고
- 지역 커뮤니티에 대한 관심
- 문제 해결 능력

**복리후생**
- 당근페이 지급
- 반려동물 출근 가능
- 건강한 간식 무제한 제공
- 자유로운 복장 및 근무 환경
- 지역 상권 활성화 참여 기회`,

    "Mobile Developer": `📱 당근마켓에서 Mobile Developer를 모집합니다

**업무 내용**
- 당근마켓 iOS/Android 앱 개발
- 사용자 친화적인 모바일 UI/UX 구현
- 위치 기반 서비스 최적화
- 푸시 알림 및 실시간 채팅 기능 개발
- 앱 성능 최적화 및 안정성 향상

**자격 요건**
- iOS(Swift) 또는 Android(Kotlin) 개발 경험 3년 이상
- 앱스토어 출시 경험
- RESTful API 연동 경험
- 위치 기반 서비스 이해
- 사용자 경험에 대한 깊은 이해`
  }
};

async function fillAllDetails() {
  try {
    console.log('📝 모든 채용공고에 상세 내용 추가 시작...');
    
    // 상세 내용이 부족한 모든 채용공고 찾기
    const jobsNeedingDetails = await prisma.job.findMany({
      where: {
        isActive: true,
        OR: [
          { description: null },
          { description: "" },
          { description: { contains: "개", mode: 'insensitive' } }, // 너무 간단한 설명
          { 
            AND: [
              { description: { not: null } },
              { description: { not: "" } }
            ]
          }
        ]
      },
      include: {
        company: true
      },
      orderBy: {
        company: {
          name: 'asc'
        }
      }
    });

    console.log(`총 ${jobsNeedingDetails.length}개 채용공고를 업데이트합니다.`);

    let updatedCount = 0;
    const companyStats = {};

    for (const job of jobsNeedingDetails) {
      const companyKey = job.company.name;
      const templates = jobTemplates[companyKey];
      
      if (!companyStats[companyKey]) {
        companyStats[companyKey] = 0;
      }

      let selectedTemplate;
      let newTitle = job.title;

      if (templates) {
        // 제목에서 키워드 추출하여 적절한 템플릿 선택
        if (job.title.toLowerCase().includes('frontend') || job.title.toLowerCase().includes('프론트')) {
          selectedTemplate = templates["Frontend Developer"];
          newTitle = "Frontend Developer";
        } else if (job.title.toLowerCase().includes('backend') || job.title.toLowerCase().includes('백엔드') || job.title.toLowerCase().includes('server')) {
          selectedTemplate = templates["Backend Developer"];
          newTitle = "Backend Developer";
        } else if (job.title.toLowerCase().includes('mobile') || job.title.toLowerCase().includes('android') || job.title.toLowerCase().includes('ios')) {
          selectedTemplate = templates["Mobile Developer"];
          newTitle = "Mobile Developer";
        } else if (job.title.toLowerCase().includes('ai') || job.title.toLowerCase().includes('ml')) {
          selectedTemplate = templates["AI Engineer"];
          newTitle = "AI Engineer";
        } else {
          // 기본 소프트웨어 엔지니어 템플릿 사용
          selectedTemplate = templates["Software Engineer"];
          newTitle = job.title.length < 15 ? "Software Engineer" : job.title;
        }
      } else {
        // 템플릿이 없는 회사는 기본 템플릿 생성
        selectedTemplate = `💼 ${job.company.nameEn}에서 개발자를 모집합니다

**업무 내용**
- ${job.company.nameEn} 서비스 개발 및 운영
- 사용자 경험 개선을 위한 기능 개발
- 코드 품질 향상 및 시스템 최적화
- 팀 협업을 통한 프로젝트 진행
- 새로운 기술 도입 및 학습

**자격 요건**
- 관련 분야 개발 경험 3년 이상
- 프로그래밍 언어 활용 능력
- 문제 해결 능력 및 학습 의지
- 팀워크 및 소통 능력
- Git을 활용한 협업 경험

**우대 사항**
- ${job.company.nameEn} 서비스 도메인 이해
- 대용량 서비스 경험
- 클라우드 환경 사용 경험
- 오픈소스 기여 경험

**복리후생**
- 경쟁력 있는 연봉
- 자유로운 근무 환경
- 개발 장비 지원
- 교육 및 컨퍼런스 지원
- 건강관리 및 복지 혜택`;
      }

      try {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            title: newTitle,
            description: selectedTemplate
          }
        });

        companyStats[companyKey]++;
        updatedCount++;

        if (updatedCount % 10 === 0) {
          console.log(`진행률: ${updatedCount}/${jobsNeedingDetails.length} (${Math.round(updatedCount/jobsNeedingDetails.length*100)}%)`);
        }

      } catch (error) {
        console.error(`❌ "${job.title}" 업데이트 실패:`, error.message);
      }
    }

    console.log(`\n🎉 총 ${updatedCount}개 채용공고 업데이트 완료!`);
    
    console.log(`\n📊 회사별 업데이트 현황:`);
    for (const [company, count] of Object.entries(companyStats)) {
      console.log(`- ${company}: ${count}개`);
    }

    // 최종 검증
    const finalStats = await prisma.company.findMany({
      include: {
        jobs: {
          where: { isActive: true }
        }
      }
    });

    console.log(`\n✅ 최종 상세 내용 보유 현황:`);
    let totalWithDetails = 0;
    let totalJobs = 0;
    
    finalStats.forEach(company => {
      if (company.jobs.length > 0) {
        const withDetails = company.jobs.filter(job => 
          job.description && job.description.length > 200
        );
        totalWithDetails += withDetails.length;
        totalJobs += company.jobs.length;
        console.log(`- ${company.nameEn}: ${withDetails.length}/${company.jobs.length}개 (${Math.round(withDetails.length/company.jobs.length*100)}%)`);
      }
    });
    
    console.log(`\n🏆 전체: ${totalWithDetails}/${totalJobs}개 (${Math.round(totalWithDetails/totalJobs*100)}%)`);

  } catch (error) {
    console.error('❌ 상세 내용 일괄 업데이트 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행
if (require.main === module) {
  fillAllDetails();
}

module.exports = { fillAllDetails };