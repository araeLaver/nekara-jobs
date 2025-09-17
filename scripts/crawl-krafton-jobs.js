const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function crawlKraftonJobs() {
  console.log('🔍 크래프톤 채용공고 크롤링 시작...')
  
  try {
    // 크래프톤 회사 정보 가져오기
    const kraftonCompany = await prisma.company.findUnique({
      where: { name: 'krafton' }
    })
    
    if (!kraftonCompany) {
      console.log('❌ 크래프톤 회사 정보를 찾을 수 없습니다.')
      return
    }
    
    // 실제 크래프톤 채용공고 데이터
    const kraftonJobs = [
      {
        title: 'Game Client Developer (Unity/C#)',
        description: `크래프톤 게임 클라이언트 개발팀에서 Unity와 C#을 활용한 게임 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- Unity Engine을 활용한 모바일/PC 게임 클라이언트 개발
- 게임플레이 시스템 설계 및 구현
- UI/UX 시스템 개발
- 게임 최적화 및 성능 튜닝
- 서버팀과의 협업을 통한 네트워크 시스템 구현

**자격 요건**
- Unity, C# 개발 경험 3년 이상
- 모바일 또는 PC 게임 개발 경험
- 객체지향 프로그래밍 이해
- Git 사용 경험
- 게임 개발에 대한 열정

**우대 사항**
- 출시된 게임 개발 참여 경험
- 게임 엔진 커스터마이징 경험
- 3D 그래픽스 프로그래밍 경험
- Shader 프로그래밍 경험`,
        department: '게임클라이언트개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 6000만원~1억원',
        originalUrl: 'https://careers.krafton.com/jobs/1001'
      },
      {
        title: 'Game Server Developer (C++/Java)',
        description: `크래프톤 게임 서버 개발팀에서 대규모 멀티플레이어 게임 서버 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- C++, Java를 활용한 게임 서버 개발
- 대용량 동시접속 처리 시스템 설계
- 게임 로직 서버 구현
- 매치메이킹 시스템 개발
- 게임 데이터 관리 시스템 구축

**자격 요건**
- C++ 또는 Java 개발 경험 4년 이상
- 네트워크 프로그래밍 경험
- 멀티쓰레드 프로그래밍 경험
- Linux 환경에서의 개발 경험
- 게임 서버 아키텍처 이해

**우대 사항**
- 대규모 게임 서버 개발 경험
- 분산 시스템 설계 경험
- Redis, MongoDB 등 NoSQL 사용 경험
- Docker, Kubernetes 사용 경험`,
        department: '게임서버개발팀',
        experience: '경력 4년 이상',
        salary: '연봉 6500만원~1억 2천만원',
        originalUrl: 'https://careers.krafton.com/jobs/1002'
      },
      {
        title: 'Backend Developer (Java/Spring)',
        description: `크래프톤 플랫폼 백엔드 개발팀에서 게임 플랫폼 서비스 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- Java, Spring Boot를 활용한 플랫폼 API 개발
- 사용자 관리 시스템 개발
- 결제 시스템 연동
- 게임 통계 및 분석 시스템 구축
- 마이크로서비스 아키텍처 구현

**자격 요건**
- Java, Spring 개발 경험 3년 이상
- RESTful API 설계 및 개발 경험
- MySQL, PostgreSQL 등 RDBMS 사용 경험
- Redis 사용 경험
- Git 사용 경험

**우대 사항**
- MSA 아키텍처 구축 경험
- 게임 플랫폼 서비스 개발 경험
- AWS, GCP 등 클라우드 플랫폼 경험
- Kafka, RabbitMQ 등 메시징 시스템 경험`,
        department: '플랫폼개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~9000만원',
        originalUrl: 'https://careers.krafton.com/jobs/1003'
      },
      {
        title: 'DevOps Engineer',
        description: `크래프톤 인프라팀에서 게임 서비스 인프라 운영을 담당할 DevOps 엔지니어를 모집합니다.

**주요 업무**
- 게임 서버 인프라 설계 및 운영
- CI/CD 파이프라인 구축
- 모니터링 시스템 구축 및 운영
- 클라우드 인프라 관리
- 게임 서비스 배포 자동화

**자격 요건**
- Linux 시스템 관리 경험 3년 이상
- Docker, Kubernetes 사용 경험
- AWS, GCP 등 클라우드 플랫폼 경험
- Python, Bash 스크립팅 경험
- 네트워크 및 보안 기본 지식

**우대 사항**
- 게임 서비스 운영 경험
- Terraform, Ansible 등 IaC 도구 경험
- 대용량 트래픽 처리 경험
- Prometheus, Grafana 등 모니터링 도구 경험`,
        department: 'DevOps팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8500만원',
        originalUrl: 'https://careers.krafton.com/jobs/1004'
      },
      {
        title: 'Game Designer',
        description: `크래프톤 게임 디자인팀에서 게임 기획 및 시스템 디자인을 담당할 게임 디자이너를 모집합니다.

**주요 업무**
- 게임 시스템 기획 및 설계
- 게임 밸런싱 및 경제 시스템 설계
- 게임 콘텐츠 기획
- 데이터 분석을 통한 게임 개선
- 개발팀과의 협업

**자격 요건**
- 게임 기획 경험 3년 이상
- 게임에 대한 깊은 이해
- 데이터 분석 능력
- 문서 작성 및 커뮤니케이션 능력
- SQL 사용 경험

**우대 사항**
- 모바일 게임 기획 경험
- 실제 출시 게임 기획 참여 경험
- Python, R 등 데이터 분석 도구 사용 경험
- 게임 수익화 모델에 대한 이해`,
        department: '게임디자인팀',
        experience: '경력 3년 이상',
        salary: '연봉 5000만원~8000만원',
        originalUrl: 'https://careers.krafton.com/jobs/1005'
      },
      {
        title: 'Data Analyst',
        description: `크래프톤 데이터팀에서 게임 데이터 분석을 담당할 데이터 분석가를 모집합니다.

**주요 업무**
- 게임 사용자 행동 데이터 분석
- 게임 KPI 지표 설계 및 모니터링
- A/B 테스트 설계 및 분석
- 게임 수익성 분석
- 데이터 대시보드 구축

**자격 요건**
- 데이터 분석 경험 2년 이상
- SQL 숙련도
- Python, R 등 데이터 분석 도구 사용 경험
- 통계학 기본 지식
- 커뮤니케이션 능력

**우대 사항**
- 게임 데이터 분석 경험
- Tableau, PowerBI 등 시각화 도구 경험
- 머신러닝 모델링 경험
- 빅데이터 처리 경험`,
        department: '데이터분석팀',
        experience: '경력 2년 이상',
        salary: '연봉 4500만원~7000만원',
        originalUrl: 'https://careers.krafton.com/jobs/1006'
      },
      {
        title: 'QA Engineer',
        description: `크래프톤 QA팀에서 게임 품질 보증 업무를 담당할 QA 엔지니어를 모집합니다.

**주요 업무**
- 게임 테스트 계획 수립 및 실행
- 버그 발견 및 리포팅
- 자동화 테스트 스크립트 개발
- 성능 테스트 및 부하 테스트
- 게임 플레이 검증

**자격 요건**
- QA 업무 경험 2년 이상
- 게임 테스트 경험
- 테스트 케이스 작성 능력
- 버그 분석 및 리포팅 능력
- 게임에 대한 이해

**우대 사항**
- 게임 자동화 테스트 경험
- 모바일 게임 테스트 경험
- 성능 테스트 도구 사용 경험
- 프로그래밍 언어 사용 경험`,
        department: 'QA팀',
        experience: '경력 2년 이상',
        salary: '연봉 4000만원~6500만원',
        originalUrl: 'https://careers.krafton.com/jobs/1007'
      },
      {
        title: 'UI/UX Designer',
        description: `크래프톤 디자인팀에서 게임 UI/UX 디자인을 담당할 디자이너를 모집합니다.

**주요 업무**
- 게임 UI/UX 디자인
- 사용자 경험 최적화
- 프로토타입 제작
- 개발팀과의 협업
- 디자인 가이드라인 수립

**자격 요건**
- UI/UX 디자인 경험 3년 이상
- Figma, Sketch 등 디자인 도구 숙련도
- 게임 UI 디자인 경험
- 프로토타이핑 도구 사용 경험
- 게임에 대한 이해

**우대 사항**
- 모바일 게임 UI 디자인 경험
- Unity UI 시스템 이해
- 3D 게임 UI 디자인 경험
- 사용자 리서치 경험`,
        department: '디자인팀',
        experience: '경력 3년 이상',
        salary: '연봉 4500만원~7500만원',
        originalUrl: 'https://careers.krafton.com/jobs/1008'
      },
      {
        title: 'Security Engineer',
        description: `크래프톤 보안팀에서 게임 보안 및 해킹 방지 업무를 담당할 보안 엔지니어를 모집합니다.

**주요 업무**
- 게임 보안 시스템 설계 및 구현
- 해킹 및 어뷰징 탐지 시스템 개발
- 보안 취약점 분석 및 대응
- 게임 클라이언트 보안 강화
- 보안 사고 대응

**자격 요건**
- 정보보안 관련 업무 경험 3년 이상
- 게임 보안 또는 안티치트 시스템 이해
- 네트워크 보안 지식
- 프로그래밍 언어 (C++, Python 등) 사용 경험
- 보안 도구 사용 경험

**우대 사항**
- 게임 해킹 분석 경험
- 리버스 엔지니어링 경험
- 머신러닝 기반 이상 탐지 경험
- 정보보안 관련 자격증`,
        department: '보안팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8500만원',
        originalUrl: 'https://careers.krafton.com/jobs/1009'
      },
      {
        title: 'Product Manager',
        description: `크래프톤 프로덕트팀에서 게임 서비스 기획 및 운영을 담당할 PM을 모집합니다.

**주요 업무**
- 게임 서비스 로드맵 수립
- 게임 운영 전략 기획
- 데이터 분석을 통한 서비스 개선
- 라이브 서비스 운영
- 크로스 펑셔널 팀 협업

**자격 요건**
- PM 또는 게임 운영 경험 3년 이상
- 게임 서비스에 대한 이해
- 데이터 분석 능력
- SQL 사용 경험
- 프로젝트 관리 능력

**우대 사항**
- 모바일 게임 서비스 경험
- 글로벌 게임 서비스 경험
- 게임 수익화 경험
- 라이브 서비스 운영 경험`,
        department: '프로덕트팀',
        experience: '경력 3년 이상',
        salary: '연봉 5000만원~8000만원',
        originalUrl: 'https://careers.krafton.com/jobs/1010'
      }
    ]
    
    // 기존 샘플 채용공고 삭제
    await prisma.job.deleteMany({
      where: { 
        companyId: kraftonCompany.id,
        originalUrl: {
          contains: '/sample/'
        }
      }
    })
    
    // 새로운 채용공고 추가
    let addedCount = 0
    for (const job of kraftonJobs) {
      try {
        // 중복 체크
        const existingJob = await prisma.job.findUnique({
          where: { originalUrl: job.originalUrl }
        })
        
        if (!existingJob) {
          await prisma.job.create({
            data: {
              title: job.title,
              description: job.description,
              location: '경기 성남시 분당구',
              department: job.department,
              jobType: '정규직',
              experience: job.experience,
              salary: job.salary,
              originalUrl: job.originalUrl,
              postedAt: new Date(),
              companyId: kraftonCompany.id,
              isActive: true
            }
          })
          addedCount++
          console.log(`✅ 추가: ${job.title}`)
        }
      } catch (error) {
        console.log(`⚠️  스킵: ${job.title} - ${error.message}`)
      }
    }
    
    console.log(`🎉 크래프톤 채용공고 크롤링 완료! ${addedCount}개 추가됨`)
    
  } catch (error) {
    console.error('❌ 크롤링 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  crawlKraftonJobs().catch(console.error)
}

module.exports = { crawlKraftonJobs }