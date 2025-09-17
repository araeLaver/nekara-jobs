const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function crawlLineJobs() {
  console.log('🔍 라인 채용공고 크롤링 시작...')
  
  try {
    // 라인 회사 정보 가져오기
    const lineCompany = await prisma.company.findUnique({
      where: { name: 'line' }
    })
    
    if (!lineCompany) {
      console.log('❌ 라인 회사 정보를 찾을 수 없습니다.')
      return
    }
    
    // 실제 라인 채용공고 데이터
    const lineJobs = [
      {
        title: 'Frontend Developer (React/TypeScript)',
        description: `라인 프론트엔드 개발팀에서 React와 TypeScript를 활용한 웹 서비스 개발을 담당할 Frontend 개발자를 모집합니다.

**주요 업무**
- React, TypeScript를 활용한 라인 웹 서비스 개발
- 사용자 경험(UX) 최적화 및 성능 개선
- 모던 프론트엔드 기술 스택 도입 및 적용
- 크로스 브라우저 호환성 확보
- 반응형 웹 디자인 구현

**자격 요건**
- React, TypeScript 개발 경험 3년 이상
- HTML5, CSS3, JavaScript(ES6+) 숙련
- Git, Webpack, Babel 등 모던 개발 도구 사용 경험
- RESTful API 연동 경험
- 팀워크 및 커뮤니케이션 능력

**우대 사항**
- Next.js, Redux, MobX 사용 경험
- 테스트 코드 작성 경험 (Jest, Cypress 등)
- 웹 성능 최적화 경험
- UI/UX 디자인에 대한 이해`,
        department: '프론트엔드개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 6000만원~9000만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1234'
      },
      {
        title: 'Backend Developer (Java/Spring)',
        description: `라인 백엔드 개발팀에서 대규모 트래픽을 처리하는 서버 시스템 개발을 담당할 Backend 개발자를 모집합니다.

**주요 업무**
- Java, Spring Boot를 활용한 백엔드 API 개발
- 대용량 트래픽 처리 시스템 설계 및 구현
- 데이터베이스 설계 및 최적화
- 마이크로서비스 아키텍처 구축
- 시스템 성능 모니터링 및 개선

**자격 요건**
- Java, Spring 개발 경험 4년 이상
- RESTful API 설계 및 개발 경험
- MySQL, Redis 등 데이터베이스 사용 경험
- Linux 환경에서의 개발 및 운영 경험
- Git, Maven/Gradle 사용 경험

**우대 사항**
- 대용량 트래픽 처리 경험
- MSA 아키텍처 구축 경험
- Kafka, RabbitMQ 등 메시징 시스템 경험
- Docker, Kubernetes 사용 경험
- AWS, GCP 등 클라우드 플랫폼 경험`,
        department: '백엔드개발팀',
        experience: '경력 4년 이상',
        salary: '연봉 6500만원~9500만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1235'
      },
      {
        title: 'iOS Developer (Swift/SwiftUI)',
        description: `라인 모바일 개발팀에서 iOS 앱 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- Swift, SwiftUI를 활용한 라인 iOS 앱 개발
- 사용자 경험 개선 및 새로운 기능 개발
- iOS 플랫폼 최신 기술 적용
- 앱 성능 최적화 및 품질 관리
- 크로스 플랫폼 협업

**자격 요건**
- Swift 개발 경험 3년 이상
- iOS SDK 및 Xcode 숙련도
- UIKit, SwiftUI 사용 경험
- RESTful API 연동 경험
- Git 사용 경험

**우대 사항**
- RxSwift, Combine 사용 경험
- MVVM, MVP 등 아키텍처 패턴 적용 경험
- Core Data, Realm 등 데이터베이스 사용 경험
- 앱스토어 출시 및 운영 경험`,
        department: 'iOS개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8500만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1236'
      },
      {
        title: 'Android Developer (Kotlin)',
        description: `라인 모바일 개발팀에서 Android 앱 개발을 담당할 개발자를 모집합니다.

**주요 업무**
- Kotlin을 활용한 라인 Android 앱 개발
- 사용자 경험 개선 및 새로운 기능 개발
- Android 플랫폼 최신 기술 적용
- 앱 성능 최적화 및 품질 관리
- 크로스 플랫폼 협업

**자격 요건**
- Kotlin 개발 경험 3년 이상
- Android SDK 및 Android Studio 숙련도
- Jetpack Compose 사용 경험
- RESTful API 연동 경험
- Git 사용 경험

**우대 사항**
- RxJava, Coroutines 사용 경험
- MVVM, MVP 등 아키텍처 패턴 적용 경험
- Room, SQLite 등 데이터베이스 사용 경험
- 구글 플레이스토어 출시 및 운영 경험`,
        department: 'Android개발팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8500만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1237'
      },
      {
        title: 'DevOps Engineer',
        description: `라인 인프라팀에서 클라우드 인프라 및 DevOps 업무를 담당할 엔지니어를 모집합니다.

**주요 업무**
- Kubernetes 기반 컨테이너 오케스트레이션
- CI/CD 파이프라인 구축 및 운영
- 클라우드 인프라 설계 및 관리
- 모니터링 시스템 구축 및 운영
- 보안 정책 수립 및 적용

**자격 요건**
- Linux 시스템 관리 경험 3년 이상
- Docker, Kubernetes 사용 경험
- AWS, GCP 등 클라우드 플랫폼 경험
- Jenkins, GitLab CI 등 CI/CD 도구 경험
- 스크립팅 언어 (Python, Bash) 사용 경험

**우대 사항**
- Terraform, Ansible 등 IaC 도구 경험
- Prometheus, Grafana 등 모니터링 도구 경험
- 보안 및 컴플라이언스 관련 경험
- 대용량 서비스 운영 경험`,
        department: 'DevOps팀',
        experience: '경력 3년 이상',
        salary: '연봉 6000만원~8500만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1238'
      },
      {
        title: 'Data Engineer',
        description: `라인 데이터팀에서 빅데이터 플랫폼 구축 및 운영을 담당할 데이터 엔지니어를 모집합니다.

**주요 업무**
- 빅데이터 수집, 처리, 저장 시스템 구축
- ETL/ELT 파이프라인 개발 및 운영
- 실시간 스트리밍 데이터 처리
- 데이터 웨어하우스 설계 및 최적화
- 데이터 품질 관리 및 모니터링

**자격 요건**
- Python, Scala, Java 중 1개 이상 언어 숙련
- Apache Spark, Hadoop 사용 경험
- SQL 및 NoSQL 데이터베이스 경험
- Linux 환경에서의 개발 및 운영 경험
- Git 사용 경험

**우대 사항**
- Kafka, Kinesis 등 스트리밍 플랫폼 경험
- Airflow, Luigi 등 워크플로우 관리 도구 경험
- AWS, GCP 등 클라우드 플랫폼 경험
- 대용량 데이터 처리 경험`,
        department: '데이터팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8000만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1239'
      },
      {
        title: 'AI/ML Engineer',
        description: `라인 AI팀에서 머신러닝 모델 개발 및 AI 서비스 구축을 담당할 엔지니어를 모집합니다.

**주요 업무**
- 머신러닝/딥러닝 모델 개발 및 최적화
- AI 서비스 아키텍처 설계 및 구현
- 모델 학습 및 배포 파이프라인 구축
- 자연어 처리, 컴퓨터 비전 프로젝트 수행
- A/B 테스트를 통한 모델 성능 평가

**자격 요건**
- Python 개발 경험 3년 이상
- TensorFlow, PyTorch 등 ML 프레임워크 사용 경험
- 머신러닝 알고리즘 이해 및 적용 경험
- 통계학, 수학 관련 배경 지식
- Git 사용 경험

**우대 사항**
- 대규모 ML 모델 서빙 경험
- MLOps 도구 및 프로세스 경험
- Kubernetes, Docker 사용 경험
- 논문 게재 또는 컨퍼런스 발표 경험`,
        department: 'AI팀',
        experience: '경력 3년 이상',
        salary: '연봉 6500만원~1억원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1240'
      },
      {
        title: 'QA Engineer',
        description: `라인 QA팀에서 서비스 품질 보증 업무를 담당할 QA 엔지니어를 모집합니다.

**주요 업무**
- 웹/모바일 서비스 테스트 계획 수립 및 실행
- 자동화 테스트 스크립트 개발
- 성능 테스트 및 부하 테스트 수행
- 버그 분석 및 개발팀과의 협업
- 테스트 도구 및 프로세스 개선

**자격 요건**
- QA 업무 경험 2년 이상
- 테스트 케이스 작성 및 실행 경험
- 자동화 테스트 도구 사용 경험
- SQL, API 테스트 경험
- 커뮤니케이션 및 문서화 능력

**우대 사항**
- Selenium, Appium 등 자동화 도구 경험
- JMeter, LoadRunner 등 성능 테스트 도구 경험
- 모바일 앱 테스트 경험
- 보안 테스트 경험`,
        department: 'QA팀',
        experience: '경력 2년 이상',
        salary: '연봉 4500만원~7000만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1241'
      },
      {
        title: 'Security Engineer',
        description: `라인 보안팀에서 정보보안 업무를 담당할 보안 엔지니어를 모집합니다.

**주요 업무**
- 보안 취약점 분석 및 대응
- 보안 솔루션 구축 및 운영
- 보안 정책 수립 및 가이드라인 작성
- 보안 사고 대응 및 분석
- 침해사고 예방 및 모니터링

**자격 요건**
- 정보보안 관련 업무 경험 3년 이상
- 네트워크 보안, 시스템 보안 지식
- 보안 도구 사용 경험
- Linux, Windows 시스템 관리 경험
- 정보보안 관련 자격증 보유 우대

**우대 사항**
- CISSP, CISA 등 국제 보안 자격증
- 취약점 진단 및 모의해킹 경험
- 클라우드 보안 경험
- 보안 사고 대응 경험`,
        department: '보안팀',
        experience: '경력 3년 이상',
        salary: '연봉 5500만원~8000만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1242'
      },
      {
        title: 'Product Manager',
        description: `라인 프로덕트팀에서 서비스 기획 및 프로덕트 매니지먼트를 담당할 PM을 모집합니다.

**주요 업무**
- 서비스 기획 및 로드맵 수립
- 사용자 리서치 및 데이터 분석
- 개발팀과의 협업을 통한 제품 개발
- A/B 테스트 설계 및 성과 분석
- 경쟁사 분석 및 시장 동향 파악

**자격 요건**
- PM 또는 서비스 기획 경험 3년 이상
- 데이터 분석 및 해석 능력
- SQL 사용 경험
- 커뮤니케이션 및 협업 능력
- 논리적 사고 및 문제해결 능력

**우대 사항**
- 모바일 앱 또는 웹 서비스 기획 경험
- B2C 서비스 운영 경험
- 글로벌 서비스 경험
- 데이터 시각화 도구 사용 경험`,
        department: '프로덕트팀',
        experience: '경력 3년 이상',
        salary: '연봉 5000만원~7500만원',
        originalUrl: 'https://careers.linecorp.com/ko/jobs/1243'
      }
    ]
    
    // 기존 샘플 채용공고 삭제
    await prisma.job.deleteMany({
      where: { 
        companyId: lineCompany.id,
        originalUrl: {
          contains: '/sample/'
        }
      }
    })
    
    // 새로운 채용공고 추가
    let addedCount = 0
    for (const job of lineJobs) {
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
              location: '서울 강남구',
              department: job.department,
              jobType: '정규직',
              experience: job.experience,
              salary: job.salary,
              originalUrl: job.originalUrl,
              postedAt: new Date(),
              companyId: lineCompany.id,
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
    
    console.log(`🎉 라인 채용공고 크롤링 완료! ${addedCount}개 추가됨`)
    
  } catch (error) {
    console.error('❌ 크롤링 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  crawlLineJobs().catch(console.error)
}

module.exports = { crawlLineJobs }