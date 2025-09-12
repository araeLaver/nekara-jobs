const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function crawlBucketplace() {
  console.log('오늘의집 채용 정보 크롤링 시작...')
  
  try {
    // 오늘의집 회사 정보 생성 또는 업데이트
    const company = await prisma.company.upsert({
      where: { name: 'bucketplace' },
      update: {},
      create: {
        name: 'bucketplace',
        nameEn: 'Bucketplace',
        logo: 'https://www.bucketplace.com/favicon.ico',
        website: 'https://www.bucketplace.com'
      }
    })

    // 오늘의집 채용 공고 샘플 데이터
    const bucketplaceJobs = [
      {
        title: 'Software Engineer, Backend',
        description: `백엔드 엔지니어로서 오늘의집 서비스의 핵심 백엔드 시스템을 개발하고 운영합니다.
        
        주요 업무:
        • 커머스 플랫폼 백엔드 서비스 개발
        • 대용량 트래픽 처리를 위한 시스템 설계 및 최적화
        • MSA 기반 서비스 아키텍처 구축
        • API 설계 및 개발
        
        자격 요건:
        • 백엔드 개발 경력 3년 이상
        • Java, Kotlin, Python 중 하나 이상의 언어에 능숙
        • RDBMS, NoSQL 데이터베이스 경험
        • MSA, 분산 시스템에 대한 이해
        
        우대 사항:
        • 대규모 트래픽 처리 경험
        • 커머스 도메인 경험
        • 클라우드 플랫폼(AWS, GCP) 경험`,
        location: '서울 강남구',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-10'),
        deadline: new Date('2025-02-10'),
        isActive: true,
        originalUrl: 'https://www.bucketplace.com/careers/backend-engineer',
        companyId: company.id,
      },
      {
        title: 'Software Engineer, Frontend',
        description: `프론트엔드 엔지니어로서 사용자 경험을 극대화하는 웹 서비스를 개발합니다.
        
        주요 업무:
        • 오늘의집 웹 서비스 개발
        • React 기반 SPA 개발
        • 디자인 시스템 구축 및 운영
        • 성능 최적화 및 사용자 경험 개선
        
        자격 요건:
        • 프론트엔드 개발 경력 3년 이상
        • React, TypeScript 능숙
        • HTML, CSS, JavaScript 기본기 탄탄
        • 웹 표준 및 접근성에 대한 이해
        
        우대 사항:
        • Next.js 경험
        • 디자인 시스템 구축 경험
        • 성능 최적화 경험`,
        location: '서울 강남구',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-10'),
        deadline: new Date('2025-02-10'),
        isActive: true,
        originalUrl: 'https://www.bucketplace.com/careers/frontend-engineer',
        companyId: company.id
      },
      {
        title: 'iOS Developer',
        description: `iOS 개발자로서 오늘의집 iOS 앱을 개발하고 개선합니다.
        
        주요 업무:
        • 오늘의집 iOS 앱 개발 및 유지보수
        • Swift 기반 신규 기능 개발
        • 앱 성능 최적화 및 사용자 경험 개선
        • CI/CD 파이프라인 구축 및 개선
        
        자격 요건:
        • iOS 개발 경력 3년 이상
        • Swift 능숙
        • iOS 프레임워크에 대한 깊은 이해
        • RESTful API 연동 경험
        
        우대 사항:
        • SwiftUI 경험
        • RxSwift, Combine 경험
        • 앱스토어 배포 경험`,
        location: '서울 강남구',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-09'),
        deadline: new Date('2025-02-09'),
        isActive: true,
        originalUrl: 'https://www.bucketplace.com/careers/ios-developer',
        companyId: company.id
      },
      {
        title: 'Android Developer',
        description: `Android 개발자로서 오늘의집 Android 앱을 개발하고 개선합니다.
        
        주요 업무:
        • 오늘의집 Android 앱 개발 및 유지보수
        • Kotlin 기반 신규 기능 개발
        • 앱 성능 최적화 및 사용자 경험 개선
        • 테스트 코드 작성 및 유지보수
        
        자격 요건:
        • Android 개발 경력 3년 이상
        • Kotlin 능숙
        • Android 프레임워크에 대한 깊은 이해
        • RESTful API 연동 경험
        
        우대 사항:
        • Jetpack Compose 경험
        • 멀티 모듈 프로젝트 경험
        • 플레이스토어 배포 경험`,
        location: '서울 강남구',
        department: 'Engineering',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-09'),
        deadline: new Date('2025-02-09'),
        isActive: true,
        originalUrl: 'https://www.bucketplace.com/careers/android-developer',
        companyId: company.id
      },
      {
        title: 'Data Engineer',
        description: `데이터 엔지니어로서 오늘의집의 데이터 인프라를 구축하고 운영합니다.
        
        주요 업무:
        • 데이터 파이프라인 구축 및 운영
        • 데이터 웨어하우스 설계 및 구축
        • 실시간 데이터 처리 시스템 개발
        • 데이터 품질 관리 체계 구축
        
        자격 요건:
        • 데이터 엔지니어링 경력 3년 이상
        • Python, SQL 능숙
        • Spark, Airflow 등 데이터 처리 도구 경험
        • 데이터 모델링 경험
        
        우대 사항:
        • 클라우드 기반 데이터 플랫폼 구축 경험
        • 실시간 데이터 처리 경험
        • ML 파이프라인 구축 경험`,
        location: '서울 강남구',
        department: 'Data',
        jobType: '정규직',
        experience: '경력 3년 이상',
        salary: '협의',
        postedAt: new Date('2025-01-08'),
        deadline: new Date('2025-02-08'),
        isActive: true,
        originalUrl: 'https://www.bucketplace.com/careers/data-engineer',
        companyId: company.id
      }
    ]

    // 기존 채용공고 삭제
    await prisma.job.deleteMany({
      where: { companyId: company.id }
    })

    // 새 채용공고 생성
    for (const job of bucketplaceJobs) {
      await prisma.job.create({
        data: job
      })
    }

    console.log(`오늘의집 채용공고 ${bucketplaceJobs.length}개 저장 완료`)
    
  } catch (error) {
    console.error('오늘의집 크롤링 중 오류:', error)
  }
}

// 단독 실행 시
if (require.main === module) {
  crawlBucketplace().finally(() => prisma.$disconnect())
}

module.exports = crawlBucketplace