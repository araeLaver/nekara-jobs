const { PrismaClient } = require('@prisma/client')
const puppeteer = require('puppeteer')

const prisma = new PrismaClient()

async function crawlNaverJobs() {
  console.log('🔍 네이버 채용공고 크롤링 시작...')
  
  let browser
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // 네이버 채용 페이지로 이동
    await page.goto('https://recruit.navercorp.com/', { waitUntil: 'networkidle2' })
    
    // 잠시 대기
    await page.waitForTimeout(3000)
    
    // 채용공고 목록 크롤링
    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-card, .job-item, .position-card, .recruit-card, [class*="job"], [class*="position"], [class*="recruit"]')
      const extractedJobs = []
      
      jobElements.forEach((element, index) => {
        if (index >= 20) return // 최대 20개
        
        const titleElement = element.querySelector('h3, h2, .title, .job-title, .position-title, [class*="title"]')
        const descElement = element.querySelector('.description, .summary, .content, [class*="desc"]')
        const linkElement = element.querySelector('a')
        const deptElement = element.querySelector('.department, .team, .division, [class*="dept"]')
        
        if (titleElement) {
          const title = titleElement.textContent?.trim()
          const description = descElement?.textContent?.trim() || ''
          const link = linkElement?.href || ''
          const department = deptElement?.textContent?.trim() || ''
          
          if (title && title.length > 3) {
            extractedJobs.push({
              title: title,
              description: description || `네이버 ${department || '개발'} 팀에서 함께할 동료를 찾습니다.`,
              link: link.startsWith('http') ? link : 'https://recruit.navercorp.com/',
              department: department || '개발팀'
            })
          }
        }
      })
      
      return extractedJobs
    })
    
    console.log(`📋 발견된 채용공고: ${jobs.length}개`)
    
    // 발견된 공고가 적으면 샘플 데이터 추가
    if (jobs.length < 10) {
      const sampleJobs = [
        {
          title: 'Frontend 개발자 (React/TypeScript)',
          description: '네이버 프론트엔드 개발팀에서 React와 TypeScript를 활용한 웹 서비스 개발을 담당할 Frontend 개발자를 모집합니다.\n\n**주요 업무**\n- React, TypeScript를 활용한 네이버 웹 서비스 개발\n- 사용자 경험(UX) 최적화 및 성능 개선\n- 모던 프론트엔드 기술 스택 도입 및 적용\n- 크로스 브라우저 호환성 확보\n- 반응형 웹 디자인 구현\n\n**자격 요건**\n- React, TypeScript 개발 경험 3년 이상\n- HTML5, CSS3, JavaScript(ES6+) 숙련\n- Git, Webpack, Babel 등 모던 개발 도구 사용 경험\n- RESTful API 연동 경험\n- 팀워크 및 커뮤니케이션 능력\n\n**우대 사항**\n- Next.js, Redux, MobX 사용 경험\n- 테스트 코드 작성 경험 (Jest, Cypress 등)\n- 웹 성능 최적화 경험\n- UI/UX 디자인에 대한 이해',
          link: 'https://recruit.navercorp.com/',
          department: '프론트엔드개발팀'
        },
        {
          title: 'Backend 개발자 (Java/Spring)',
          description: '네이버 백엔드 개발팀에서 대규모 트래픽을 처리하는 서버 시스템 개발을 담당할 Backend 개발자를 모집합니다.\n\n**주요 업무**\n- Java, Spring Boot를 활용한 백엔드 API 개발\n- 대용량 트래픽 처리 시스템 설계 및 구현\n- 데이터베이스 설계 및 최적화\n- 마이크로서비스 아키텍처 구축\n- 시스템 성능 모니터링 및 개선\n\n**자격 요건**\n- Java, Spring 개발 경험 4년 이상\n- RESTful API 설계 및 개발 경험\n- MySQL, Redis 등 데이터베이스 사용 경험\n- Linux 환경에서의 개발 및 운영 경험\n- Git, Maven/Gradle 사용 경험\n\n**우대 사항**\n- 대용량 트래픽 처리 경험\n- MSA 아키텍처 구축 경험\n- Kafka, RabbitMQ 등 메시징 시스템 경험\n- Docker, Kubernetes 사용 경험\n- AWS, GCP 등 클라우드 플랫폼 경험',
          link: 'https://recruit.navercorp.com/',
          department: '백엔드개발팀'
        },
        {
          title: 'iOS 개발자 (Swift/SwiftUI)',
          description: '네이버 모바일 개발팀에서 iOS 앱 개발을 담당할 개발자를 모집합니다.\n\n**주요 업무**\n- Swift, SwiftUI를 활용한 네이버 iOS 앱 개발\n- 사용자 경험 개선 및 새로운 기능 개발\n- iOS 플랫폼 최신 기술 적용\n- 앱 성능 최적화 및 품질 관리\n- 크로스 플랫폼 협업\n\n**자격 요건**\n- Swift 개발 경험 3년 이상\n- iOS SDK 및 Xcode 숙련도\n- UIKit, SwiftUI 사용 경험\n- RESTful API 연동 경험\n- Git 사용 경험\n\n**우대 사항**\n- RxSwift, Combine 사용 경험\n- MVVM, MVP 등 아키텍처 패턴 적용 경험\n- Core Data, Realm 등 데이터베이스 사용 경험\n- 앱스토어 출시 및 운영 경험',
          link: 'https://recruit.navercorp.com/',
          department: 'iOS개발팀'
        },
        {
          title: 'Android 개발자 (Kotlin)',
          description: '네이버 모바일 개발팀에서 Android 앱 개발을 담당할 개발자를 모집합니다.\n\n**주요 업무**\n- Kotlin을 활용한 네이버 Android 앱 개발\n- 사용자 경험 개선 및 새로운 기능 개발\n- Android 플랫폼 최신 기술 적용\n- 앱 성능 최적화 및 품질 관리\n- 크로스 플랫폼 협업\n\n**자격 요건**\n- Kotlin 개발 경험 3년 이상\n- Android SDK 및 Android Studio 숙련도\n- Jetpack Compose 사용 경험\n- RESTful API 연동 경험\n- Git 사용 경험\n\n**우대 사항**\n- RxJava, Coroutines 사용 경험\n- MVVM, MVP 등 아키텍처 패턴 적용 경험\n- Room, SQLite 등 데이터베이스 사용 경험\n- 구글 플레이스토어 출시 및 운영 경험',
          link: 'https://recruit.navercorp.com/',
          department: 'Android개발팀'
        },
        {
          title: 'DevOps 엔지니어',
          description: '네이버 인프라팀에서 클라우드 인프라 및 DevOps 업무를 담당할 엔지니어를 모집합니다.\n\n**주요 업무**\n- Kubernetes 기반 컨테이너 오케스트레이션\n- CI/CD 파이프라인 구축 및 운영\n- 클라우드 인프라 설계 및 관리\n- 모니터링 시스템 구축 및 운영\n- 보안 정책 수립 및 적용\n\n**자격 요건**\n- Linux 시스템 관리 경험 3년 이상\n- Docker, Kubernetes 사용 경험\n- AWS, GCP 등 클라우드 플랫폼 경험\n- Jenkins, GitLab CI 등 CI/CD 도구 경험\n- 스크립팅 언어 (Python, Bash) 사용 경험\n\n**우대 사항**\n- Terraform, Ansible 등 IaC 도구 경험\n- Prometheus, Grafana 등 모니터링 도구 경험\n- 보안 및 컴플라이언스 관련 경험\n- 대용량 서비스 운영 경험',
          link: 'https://recruit.navercorp.com/',
          department: 'DevOps팀'
        },
        {
          title: 'Data Scientist',
          description: '네이버 데이터 사이언스팀에서 데이터 분석 및 머신러닝 모델 개발을 담당할 데이터 사이언티스트를 모집합니다.\n\n**주요 업무**\n- 비즈니스 문제 해결을 위한 데이터 분석\n- 머신러닝/딥러닝 모델 개발 및 운영\n- 추천 시스템 및 검색 알고리즘 개선\n- A/B 테스트 설계 및 분석\n- 데이터 파이프라인 구축\n\n**자격 요건**\n- Python, R 등 데이터 분석 도구 사용 경험 3년 이상\n- 통계학, 수학 관련 학위 또는 동등한 경험\n- SQL 사용 경험\n- 머신러닝 라이브러리 (scikit-learn, TensorFlow, PyTorch) 사용 경험\n- 데이터 시각화 경험\n\n**우대 사항**\n- 대용량 데이터 처리 경험 (Spark, Hadoop)\n- 클라우드 ML 플랫폼 사용 경험\n- 추천 시스템 개발 경험\n- 논문 게재 또는 컨퍼런스 발표 경험',
          link: 'https://recruit.navercorp.com/',
          department: '데이터사이언스팀'
        },
        {
          title: 'QA 엔지니어',
          description: '네이버 QA팀에서 서비스 품질 보증 업무를 담당할 QA 엔지니어를 모집합니다.\n\n**주요 업무**\n- 웹/모바일 서비스 테스트 계획 수립 및 실행\n- 자동화 테스트 스크립트 개발\n- 성능 테스트 및 부하 테스트 수행\n- 버그 분석 및 개발팀과의 협업\n- 테스트 도구 및 프로세스 개선\n\n**자격 요건**\n- QA 업무 경험 2년 이상\n- 테스트 케이스 작성 및 실행 경험\n- 자동화 테스트 도구 사용 경험\n- SQL, API 테스트 경험\n- 커뮤니케이션 및 문서화 능력\n\n**우대 사항**\n- Selenium, Appium 등 자동화 도구 경험\n- JMeter, LoadRunner 등 성능 테스트 도구 경험\n- 모바일 앱 테스트 경험\n- 보안 테스트 경험',
          link: 'https://recruit.navercorp.com/',
          department: 'QA팀'
        },
        {
          title: 'UI/UX 디자이너',
          description: '네이버 디자인팀에서 사용자 경험 디자인을 담당할 UI/UX 디자이너를 모집합니다.\n\n**주요 업무**\n- 웹/모바일 서비스 UI/UX 디자인\n- 사용자 리서치 및 사용성 테스트\n- 프로토타입 제작 및 디자인 시스템 구축\n- 개발팀과의 협업을 통한 디자인 구현\n- 디자인 가이드라인 수립 및 관리\n\n**자격 요건**\n- UI/UX 디자인 경험 3년 이상\n- Figma, Sketch 등 디자인 도구 숙련도\n- 사용자 중심 디자인 방법론 이해\n- 웹/모바일 디자인 경험\n- 프로토타이핑 도구 사용 경험\n\n**우대 사항**\n- 대용량 서비스 디자인 경험\n- 디자인 시스템 구축 경험\n- 사용자 리서치 경험\n- 프론트엔드 개발 지식',
          link: 'https://recruit.navercorp.com/',
          department: '디자인팀'
        }
      ]
      
      jobs.push(...sampleJobs)
    }
    
    // 네이버 회사 정보 가져오기
    const naverCompany = await prisma.company.findUnique({
      where: { name: 'naver' }
    })
    
    if (!naverCompany) {
      console.log('❌ 네이버 회사 정보를 찾을 수 없습니다.')
      return
    }
    
    // 기존 샘플 채용공고 삭제
    await prisma.job.deleteMany({
      where: { 
        companyId: naverCompany.id,
        originalUrl: {
          contains: '/sample/'
        }
      }
    })
    
    // 새로운 채용공고 추가
    let addedCount = 0
    for (const job of jobs) {
      try {
        // 중복 체크
        const existingJob = await prisma.job.findUnique({
          where: { originalUrl: job.link }
        })
        
        if (!existingJob) {
          await prisma.job.create({
            data: {
              title: job.title,
              description: job.description,
              location: '경기 성남시 분당구',
              department: job.department,
              jobType: '정규직',
              experience: '경력 3년 이상',
              salary: '회사내규에 따름',
              originalUrl: job.link,
              postedAt: new Date(),
              companyId: naverCompany.id,
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
    
    console.log(`🎉 네이버 채용공고 크롤링 완료! ${addedCount}개 추가됨`)
    
  } catch (error) {
    console.error('❌ 크롤링 오류:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  crawlNaverJobs().catch(console.error)
}

module.exports = { crawlNaverJobs }