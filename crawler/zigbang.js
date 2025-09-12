const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function crawlZigbang() {
  console.log('직방 채용 정보 크롤링 시작...')
  
  try {
    // 직방 회사 정보 생성 또는 업데이트
    const company = await prisma.company.upsert({
      where: { name: 'zigbang' },
      update: {},
      create: {
        name: 'zigbang',
        nameEn: 'Zigbang',
        logo: 'https://www.zigbang.com/favicon.ico',
        website: 'https://www.zigbang.com'
      }
    })

    // 직방 채용 공고 샘플 데이터
    const zigbangJobs = [
      {
        title: 'Backend Developer',
        description: `백엔드 개발자로서 직방 서비스의 핵심 백엔드 시스템을 개발하고 운영합니다.
        
        주요 업무:
        • Node.js 기반 백엔드 서비스 개발
        • 마이크로서비스 아키텍처 설계 및 구현
        • RESTful API 및 GraphQL API 개발
        • 데이터베이스 설계 및 최적화
        • 메타버스 플랫폼 'Soma' 백엔드 개발
        
        자격 요건:
        • 백엔드 개발 경력 3년 이상
        • Node.js, Express 개발 경험
        • PostgreSQL, MongoDB 등 데이터베이스 경험
        • RESTful API 설계 경험
        
        우대 사항:
        • TypeScript 경험
        • GraphQL 경험
        • Docker, Kubernetes 경험
        • 메타버스/3D 관련 백엔드 경험`,
        location: '리모트 (메타버스 Soma)',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-11'),
        deadline: new Date('2025-02-11'),
        isActive: true,
        originalUrl: 'https://career.zigbang.com/backend-developer',
        companyId: company.id
      },
      {
        title: 'Frontend Developer',
        description: `프론트엔드 개발자로서 직방의 웹/모바일 웹 서비스를 개발합니다.
        
        주요 업무:
        • React 기반 웹 애플리케이션 개발
        • 사용자 경험 최적화
        • 반응형 웹 디자인 구현
        • 메타버스 플랫폼 'Soma' 프론트엔드 개발
        
        자격 요건:
        • 프론트엔드 개발 경력 3년 이상
        • React, JavaScript/TypeScript 능숙
        • HTML5, CSS3 전문 지식
        • Git 버전 관리 경험
        
        우대 사항:
        • Next.js 경험
        • Three.js 등 3D 라이브러리 경험
        • 웹 성능 최적화 경험
        • 메타버스/WebGL 경험`,
        location: '리모트 (메타버스 Soma)',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-11'),
        deadline: new Date('2025-02-11'),
        isActive: true,
        originalUrl: 'https://career.zigbang.com/frontend-developer',
        companyId: company.id
      },
      {
        title: 'iOS Developer',
        description: `iOS 개발자로서 직방 iOS 앱을 개발하고 개선합니다.
        
        주요 업무:
        • 직방 iOS 앱 신규 기능 개발
        • 앱 성능 최적화 및 안정성 개선
        • UI/UX 개선을 통한 사용자 경험 향상
        • 크로스 플랫폼 협업
        
        자격 요건:
        • iOS 개발 경력 2년 이상
        • Swift, UIKit 능숙
        • RESTful API 연동 경험
        • 앱스토어 배포 경험
        
        우대 사항:
        • SwiftUI 경험
        • RxSwift, Combine 경험
        • CI/CD 구축 경험
        • 부동산 앱 개발 경험`,
        location: '리모트 (메타버스 Soma)',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 2년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-10'),
        deadline: new Date('2025-02-10'),
        isActive: true,
        originalUrl: 'https://career.zigbang.com/ios-developer',
        companyId: company.id
      },
      {
        title: 'Android Developer',
        description: `Android 개발자로서 직방 Android 앱을 개발하고 개선합니다.
        
        주요 업무:
        • 직방 Android 앱 신규 기능 개발
        • 코드 리팩토링 및 아키텍처 개선
        • 앱 성능 최적화
        • 사용자 피드백 기반 개선
        
        자격 요건:
        • Android 개발 경력 2년 이상
        • Kotlin, Java 능숙
        • MVVM, MVP 등 아키텍처 패턴 이해
        • 플레이스토어 배포 경험
        
        우대 사항:
        • Jetpack Compose 경험
        • Coroutines, Flow 경험
        • TDD 경험
        • 부동산 앱 개발 경험`,
        location: '리모트 (메타버스 Soma)',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 2년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-10'),
        deadline: new Date('2025-02-10'),
        isActive: true,
        originalUrl: 'https://career.zigbang.com/android-developer',
        companyId: company.id
      },
      {
        title: 'DevOps Engineer',
        description: `DevOps 엔지니어로서 직방의 인프라와 배포 파이프라인을 구축하고 운영합니다.
        
        주요 업무:
        • AWS 기반 클라우드 인프라 구축 및 관리
        • CI/CD 파이프라인 구축 및 개선
        • 컨테이너 오케스트레이션 운영
        • 모니터링 및 로깅 시스템 구축
        • 메타버스 플랫폼 인프라 운영
        
        자격 요건:
        • DevOps/인프라 경력 3년 이상
        • AWS, GCP 등 클라우드 플랫폼 경험
        • Docker, Kubernetes 경험
        • Linux 시스템 관리 경험
        
        우대 사항:
        • Terraform, Ansible 등 IaC 도구 경험
        • GitOps 경험
        • 모니터링 도구(Prometheus, Grafana) 경험
        • 대규모 트래픽 처리 경험`,
        location: '리모트 (메타버스 Soma)',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-09'),
        deadline: new Date('2025-02-09'),
        isActive: true,
        originalUrl: 'https://career.zigbang.com/devops-engineer',
        companyId: company.id
      },
      {
        title: 'Data Analyst',
        description: `데이터 분석가로서 직방의 비즈니스 성장을 위한 데이터 분석을 수행합니다.
        
        주요 업무:
        • 부동산 시장 데이터 분석
        • 사용자 행동 데이터 분석
        • 대시보드 구축 및 리포팅
        • A/B 테스트 설계 및 분석
        • 비즈니스 인사이트 도출
        
        자격 요건:
        • 데이터 분석 경력 2년 이상
        • SQL 능숙
        • Python, R 중 하나 이상 능숙
        • 통계 분석 능력
        
        우대 사항:
        • 부동산 도메인 경험
        • Tableau, PowerBI 등 BI 도구 경험
        • 머신러닝 모델링 경험
        • 성장 지표 분석 경험`,
        location: '리모트 (메타버스 Soma)',
        department: 'Data',
        jobType: '정규직',
        experience: '경력 2년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-09'),
        deadline: new Date('2025-02-09'),
        isActive: true,
        originalUrl: 'https://career.zigbang.com/data-analyst',
        companyId: company.id
      }
    ]

    // 기존 채용공고 삭제
    await prisma.job.deleteMany({
      where: { companyId: company.id }
    })

    // 새 채용공고 생성
    for (const job of zigbangJobs) {
      await prisma.job.create({
        data: job
      })
    }

    console.log(`직방 채용공고 ${zigbangJobs.length}개 저장 완료`)
    
  } catch (error) {
    console.error('직방 크롤링 중 오류:', error)
  }
}

// 단독 실행 시
if (require.main === module) {
  crawlZigbang().finally(() => prisma.$disconnect())
}

module.exports = crawlZigbang