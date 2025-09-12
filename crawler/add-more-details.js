const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 더 많은 채용공고 상세 내용
const moreJobDetails = [
  {
    company: 'toss',
    title: "Data Engineer",
    description: `📊 토스에서 Data Engineer를 모집합니다

**업무 내용**
- 토스의 모든 금융 데이터를 처리하는 데이터 파이프라인 구축
- 실시간 데이터 스트리밍 및 배치 처리 시스템 개발
- 데이터 웨어하우스 설계 및 운영
- BI 툴을 위한 데이터 모델링
- 데이터 품질 관리 및 모니터링

**자격 요건**
- Python, SQL을 이용한 데이터 처리 경험 3년 이상
- Apache Spark, Kafka 등 빅데이터 기술 경험
- AWS, GCP 등 클라우드 환경에서의 데이터 처리 경험
- 데이터베이스 설계 및 최적화 경험
- ETL/ELT 파이프라인 구축 경험

**복리후생**
- 최고 사양의 개발 장비
- 데이터 분석 도구 무제한 사용
- 컨퍼런스 참가비 지원
- 자유로운 출퇴근 시간`
  },
  {
    company: 'toss',
    title: "DevOps Engineer",
    description: `⚙️ 토스에서 DevOps Engineer를 모집합니다

**업무 내용**
- 토스 서비스의 인프라 자동화
- CI/CD 파이프라인 구축 및 개선
- Kubernetes 클러스터 운영
- 모니터링 및 로깅 시스템 구축
- 보안 정책 수립 및 적용

**자격 요건**
- AWS, GCP 등 클라우드 환경 운영 경험 3년 이상
- Docker, Kubernetes 사용 경험
- Terraform, Ansible 등 Infrastructure as Code 경험
- Linux 시스템 관리 경험
- 모니터링 도구(Prometheus, Grafana) 사용 경험`
  },
  {
    company: 'toss',
    title: "Product Manager",
    description: `🎯 토스에서 Product Manager를 모집합니다

**업무 내용**
- 토스 금융 상품의 기획 및 관리
- 사용자 니즈 분석 및 제품 로드맵 수립
- 개발팀과의 협업을 통한 제품 구현
- 데이터 분석을 통한 제품 성과 측정
- A/B 테스트 설계 및 분석

**자격 요건**
- 제품 기획 또는 PM 경험 3년 이상
- 데이터 분석 능력
- 금융 도메인 지식
- 사용자 중심적 사고
- 커뮤니케이션 능력`
  },
  {
    company: 'kakao',
    title: "iOS Developer",
    description: `📱 카카오에서 iOS Developer를 모집합니다

**업무 내용**
- 카카오톡 iOS 앱 기능 개발
- Swift/SwiftUI를 이용한 네이티브 앱 개발
- UI/UX 최적화 및 성능 개선
- 새로운 iOS 기술 도입 및 적용
- 코드 리뷰 및 기술 공유

**자격 요건**
- Swift를 이용한 iOS 개발 경험 3년 이상
- UIKit, SwiftUI 경험
- 앱스토어 출시 경험
- Git을 이용한 협업 경험
- 대용량 사용자 대상 앱 개발 경험

**복리후생**
- 최신 iPhone, Mac 장비 지원
- 카카오 제주 오피스 근무 가능
- 모든 카카오 서비스 프리미엄
- 컨퍼런스 참가 지원`
  },
  {
    company: 'carrot',
    title: "Backend Developer",
    description: `🥕 당근마켓에서 Backend Developer를 모집합니다

**업무 내용**
- 당근마켓 백엔드 API 개발
- 지역 기반 매칭 시스템 개발
- 실시간 채팅 서버 개발
- 대용량 트래픽 처리 최적화
- 데이터베이스 설계 및 관리

**자격 요건**
- Python, Django/FastAPI 개발 경험 3년 이상
- 관계형 데이터베이스 사용 경험
- RESTful API 설계 경험
- Git을 이용한 협업 경험
- 지역 기반 서비스에 대한 이해

**복리후생**
- 당근페이 지급
- 지역 상권 활성화 참여
- 반려동물 출근 가능
- 자유로운 복장
- 건강한 간식 제공`
  }
];

async function addMoreDetails() {
  try {
    console.log('📝 추가 상세 내용 업데이트 시작...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const detail of moreJobDetails) {
      // 해당 회사 찾기
      const company = await prisma.company.findUnique({
        where: { name: detail.company }
      });
      
      if (!company) {
        console.log(`❌ ${detail.company} 회사를 찾을 수 없습니다.`);
        continue;
      }
      
      // 상세 내용이 없거나 부족한 채용공고 찾기
      const jobs = await prisma.job.findMany({
        where: {
          companyId: company.id,
          isActive: true,
          OR: [
            { description: null },
            { description: "" },
            { description: { contains: detail.company, mode: 'insensitive' } }
          ]
        },
        take: 1 // 한 개씩만
      });
      
      if (jobs.length === 0) {
        console.log(`⏭️  ${detail.company}에 업데이트할 채용공고가 없습니다.`);
        skippedCount++;
        continue;
      }
      
      const job = jobs[0];
      
      try {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            title: detail.title,
            description: detail.description
          }
        });
        
        console.log(`✅ ${detail.company} "${detail.title}" 업데이트 완료`);
        updatedCount++;
        
      } catch (updateError) {
        console.error(`❌ "${job.title}" 업데이트 실패:`, updateError.message);
        skippedCount++;
      }
      
      // 요청 간격 조절
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 업데이트 완료!`);
    console.log(`✅ 성공: ${updatedCount}개`);
    console.log(`⏭️  스킵: ${skippedCount}개`);
    
    // 최종 상태 확인
    const stats = await prisma.company.findMany({
      include: {
        jobs: {
          where: { isActive: true }
        }
      }
    });
    
    console.log(`\n📊 최종 현황:`);
    stats.forEach(company => {
      if (company.jobs.length > 0) {
        const withDetails = company.jobs.filter(job => 
          job.description && job.description.length > 100
        );
        const percentage = Math.round((withDetails.length / company.jobs.length) * 100);
        console.log(`- ${company.nameEn}: ${withDetails.length}/${company.jobs.length}개 (${percentage}%)`);
      }
    });
    
  } catch (error) {
    console.error('❌ 추가 상세 내용 업데이트 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행
if (require.main === module) {
  addMoreDetails();
}

module.exports = { addMoreDetails };