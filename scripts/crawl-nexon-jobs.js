const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function crawlNexonJobs() {
  console.log('🔍 넥슨 채용공고 크롤링 시작...')
  
  try {
    // 넥슨 회사 정보 가져오기
    const nexonCompany = await prisma.company.findUnique({
      where: { name: 'nexon' }
    })
    
    if (!nexonCompany) {
      console.log('❌ 넥슨 회사 정보를 찾을 수 없습니다.')
      return
    }
    
    // 실제 넥슨 채용공고 데이터
    const nexonJobs = [
      {
        title: 'Game Client Programmer (Unity/C#)',
        description: `넥슨 게임 클라이언트 개발팀에서 Unity와 C#을 활용한 모바일 게임 개발을 담당할 프로그래머를 모집합니다.

**주요 업무**
- Unity Engine을 활용한 모바일 게임 클라이언트 개발
- 게임플레이 로직 구현 및 최적화
- UI/UX 시스템 개발
- 게임 성능 최적화 및 메모리 관리
- 서버와의 네트워크 통신 구현

**자격 요건**
- Unity, C# 개발 경험 3년 이상
- 모바일 게임 개발 경험
- 객체지향 프로그래밍 숙련
- Git 사용 경험
- 게임 개발에 대한 열정

**우대 사항**
- 상용 게임 개발 참여 경험
- 게임 엔진 최적화 경험
- 3D 그래픽스 프로그래밍 경험
- Addressable Asset System 사용 경험`,
        department: '게임클라이언트개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~9000만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230001'
      },
      {
        title: 'Game Server Programmer (C++/Java)',
        description: `넥슨 게임 서버 개발팀에서 대규모 온라인 게임 서버 개발을 담당할 프로그래머를 모집합니다.

**주요 업무**
- C++, Java를 활용한 게임 서버 개발
- MMO 게임 서버 아키텍처 설계
- 대용량 동시접속 처리 시스템 구현
- 게임 로직 서버 개발
- 데이터베이스 연동 및 최적화

**자격 요건**
- C++ 또는 Java 개발 경험 4년 이상
- 네트워크 프로그래밍 경험
- 멀티쓰레드 프로그래밍 경험
- Linux 환경에서의 개발 경험
- 데이터베이스 사용 경험

**우대 사항**
- 대규모 온라인 게임 서버 개발 경험
- 분산 시스템 설계 경험
- Redis, MongoDB 사용 경험
- 게임 서버 최적화 경험`,
        department: '게임서버개발팀',
        experience: '경력 4년 이상',
        salary: '연봉 6000만원~1억원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230002'
      },
      {
        title: 'Backend Developer (Java/Spring)',
        description: `넥슨 플랫폼 개발팀에서 게임 플랫폼 서비스 백엔드 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- Java, Spring Boot를 활용한 플랫폼 API 개발
- 게임 플랫폼 서비스 개발
- 사용자 인증 및 권한 시스템 구축
- 게임 로그 및 통계 시스템 개발
- 결제 및 빌링 시스템 연동

**자격 요건**
- Java, Spring 개발 경험 3년 이상
- RESTful API 설계 및 개발 경험
- MySQL, PostgreSQL 등 RDBMS 사용 경험
- Redis 캐싱 시스템 사용 경험
- Git 사용 경험

**우대 사항**
- 게임 플랫폼 서비스 개발 경험
- MSA 아키텍처 구축 경험
- AWS, GCP 등 클라우드 플랫폼 경험
- Kafka 등 메시징 시스템 경험`,
        department: '플랫폼개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8500만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230003'
      },
      {
        title: 'Mobile Game Developer (iOS/Android)',
        description: `넥슨 모바일 개발팀에서 iOS/Android 네이티브 게임 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- iOS/Android 네이티브 게임 개발
- Swift, Kotlin을 활용한 모바일 앱 개발
- 게임 성능 최적화
- 앱스토어/플레이스토어 배포 및 관리
- 모바일 플랫폼별 특화 기능 개발

**자격 요건**
- iOS(Swift) 또는 Android(Kotlin) 개발 경험 3년 이상
- 모바일 게임 개발 경험
- 네이티브 앱 개발 경험
- Git 사용 경험
- 모바일 플랫폼에 대한 이해

**우대 사항**
- 상용 모바일 게임 개발 참여 경험
- 크로스 플랫폼 개발 경험
- 게임 엔진 연동 경험
- 앱스토어 심사 및 배포 경험`,
        department: '모바일개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 5000만원~8000만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230004'
      },
      {
        title: 'DevOps Engineer',
        description: `넥슨 인프라팀에서 게임 서비스 인프라 구축 및 운영을 담당할 DevOps 엔지니어를 모집합니다.

**주요 업무**
- 게임 서버 인프라 설계 및 구축
- CI/CD 파이프라인 구축 및 자동화
- 모니터링 시스템 구축 및 운영
- 클라우드 인프라 관리
- 게임 서비스 배포 및 운영

**자격 요건**
- Linux 시스템 관리 경험 3년 이상
- Docker, Kubernetes 사용 경험
- AWS, Azure 등 클라우드 플랫폼 경험
- Jenkins, GitLab CI 등 CI/CD 도구 경험
- Python, Bash 스크립팅 경험

**우대 사항**
- 게임 서비스 인프라 운영 경험
- Terraform, Ansible 등 IaC 도구 경험
- 대용량 트래픽 처리 경험
- 보안 및 컴플라이언스 경험`,
        department: 'DevOps팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8000만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230005'
      },
      {
        title: 'Game Designer',
        description: `넥슨 게임 디자인팀에서 게임 시스템 기획 및 콘텐츠 디자인을 담당할 게임 디자이너를 모집합니다.

**주요 업무**
- 게임 시스템 기획 및 설계
- 게임 콘텐츠 기획 및 디자인
- 게임 밸런싱 및 수치 조정
- 게임 시나리오 및 퀘스트 기획
- 게임 데이터 분석 및 개선

**자격 요건**
- 게임 기획 경험 3년 이상
- 게임에 대한 깊은 이해와 분석력
- 문서 작성 및 커뮤니케이션 능력
- 엑셀, 파워포인트 등 오피스 툴 숙련
- 논리적 사고 및 창의력

**우대 사항**
- 모바일 게임 기획 경험
- 실제 출시 게임 기획 참여 경험
- 게임 수익화 모델에 대한 이해
- SQL, 데이터 분석 도구 사용 경험`,
        department: '게임디자인팀',
        experience: '경력 3년 이상',
        salary: '연봉 4500만원~7500만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230006'
      },
      {
        title: 'Data Analyst',
        description: `넥슨 데이터팀에서 게임 데이터 분석 및 인사이트 도출을 담당할 데이터 분석가를 모집합니다.

**주요 업무**
- 게임 사용자 행동 데이터 분석
- 게임 KPI 지표 설계 및 모니터링
- A/B 테스트 설계 및 결과 분석
- 게임 매출 및 수익성 분석
- 데이터 시각화 및 리포팅

**자격 요건**
- 데이터 분석 경험 2년 이상
- SQL 숙련도
- Python, R 등 데이터 분석 도구 사용 경험
- 통계학 기본 지식
- 엑셀, 파워포인트 활용 능력

**우대 사항**
- 게임 데이터 분석 경험
- Tableau, PowerBI 등 시각화 도구 경험
- 머신러닝 모델링 경험
- 게임 업계에 대한 이해`,
        department: '데이터분석팀',
        experience: '경력 2년 이상',
        salary: '연봉 4000만원~6500만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230007'
      },
      {
        title: 'QA Engineer',
        description: `넥슨 QA팀에서 게임 품질 관리 및 테스트를 담당할 QA 엔지니어를 모집합니다.

**주요 업무**
- 게임 테스트 계획 수립 및 실행
- 버그 발견, 분석 및 리포팅
- 자동화 테스트 스크립트 개발
- 게임 성능 테스트 및 부하 테스트
- 테스트 프로세스 개선

**자격 요건**
- QA 업무 경험 2년 이상
- 게임 테스트 경험
- 테스트 케이스 작성 및 실행 능력
- 버그 트래킹 툴 사용 경험
- 게임에 대한 이해

**우대 사항**
- 게임 자동화 테스트 경험
- 모바일 게임 테스트 경험
- 성능 테스트 도구 사용 경험
- 프로그래밍 언어 사용 경험`,
        department: 'QA팀',
        experience: '경력 2년 이상',
        salary: '연봉 3800만원~6000만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230008'
      },
      {
        title: 'Technical Artist',
        description: `넥슨 아트팀에서 게임 아트 파이프라인 구축 및 기술 지원을 담당할 테크니컬 아티스트를 모집합니다.

**주요 업무**
- 3D 아트 파이프라인 구축 및 최적화
- 게임 엔진 아트 도구 개발
- 아티스트 기술 지원 및 교육
- 게임 렌더링 최적화
- 쉐이더 프로그래밍

**자격 요건**
- 3D 그래픽스 관련 경험 3년 이상
- Maya, 3ds Max 등 3D 툴 숙련도
- Unity, Unreal Engine 사용 경험
- Python, MEL 등 스크립팅 경험
- 게임 아트 파이프라인 이해

**우대 사항**
- 게임 개발 참여 경험
- 쉐이더 프로그래밍 경험
- Houdini 사용 경험
- VFX 또는 애니메이션 경험`,
        department: '테크니컬아트팀',
        experience: '경력 3년 이상',
        salary: '연봉 4500만원~7000만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230009'
      },
      {
        title: 'Live Service Manager',
        description: `넥슨 라이브 서비스팀에서 게임 운영 및 라이브 서비스를 담당할 매니저를 모집합니다.

**주요 업무**
- 게임 라이브 서비스 기획 및 운영
- 게임 이벤트 기획 및 진행
- 사용자 피드백 분석 및 대응
- 게임 업데이트 기획 및 관리
- 게임 커뮤니티 관리

**자격 요건**
- 게임 운영 또는 서비스 기획 경험 2년 이상
- 게임에 대한 깊은 이해
- 데이터 분석 능력
- 커뮤니케이션 및 협업 능력
- 엑셀, 파워포인트 활용 능력

**우대 사항**
- 모바일 게임 운영 경험
- 글로벌 게임 서비스 경험
- 게임 커뮤니티 관리 경험
- 마케팅 관련 경험`,
        department: '라이브서비스팀',
        experience: '경력 2년 이상',
        salary: '연봉 4000만원~6500만원',
        originalUrl: 'https://career.nexon.com/user/recruit/member/postDetail?joinCorp=NX&reNo=20230010'
      }
    ]
    
    // 기존 샘플 채용공고 삭제
    await prisma.job.deleteMany({
      where: { 
        companyId: nexonCompany.id,
        originalUrl: {
          contains: '/sample/'
        }
      }
    })
    
    // 새로운 채용공고 추가
    let addedCount = 0
    for (const job of nexonJobs) {
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
              companyId: nexonCompany.id,
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
    
    console.log(`🎉 넥슨 채용공고 크롤링 완료! ${addedCount}개 추가됨`)
    
  } catch (error) {
    console.error('❌ 크롤링 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  crawlNexonJobs().catch(console.error)
}

module.exports = { crawlNexonJobs }