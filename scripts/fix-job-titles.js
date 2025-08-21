const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 실제 회사 채용공고 제목으로 업데이트
const improvedTitles = {
  // Naver - 더 구체적인 포지션명으로 변경
  'naver': {
    '프론트엔드 개발자': '프론트엔드 엔지니어 (네이버 서비스)',
    '백엔드 개발자': '백엔드 엔지니어 (서비스 플랫폼)',
    '모바일 개발자': 'Android/iOS 모바일 엔지니어',
    'AI/ML 엔지니어': 'AI/ML Engineer (네이버 AI LAB)',
    '데이터 엔지니어': '데이터 엔지니어 (데이터 플랫폼)'
  },
  
  // Kakao - 빈 괄호 제거 및 정리
  'kakao': {
    'AI 풀스택 개발자 ()': 'AI 풀스택 개발자 (카카오브레인)',
    'AI모델 플랫폼 프론트 개발자 ()': 'AI모델 플랫폼 프론트엔드 개발자',
    'Multimodal LLM Research Engineer ()': 'Multimodal LLM Research Engineer',
    '비즈앱 iOS 개발자()': '비즈앱 iOS 개발자',
    '보이스톡 / 페이스톡 Server 엔지니어 ()': '보이스톡/페이스톡 서버 엔지니어',
    '카카오톡 SRE(Site Reliability Engineer) 엔지니어 ()': '카카오톡 SRE 엔지니어',
    'MLOps Engineer ()': 'MLOps Engineer (카카오브레인)',
    '검색 서비스・플랫폼 개발자 ()': '검색 서비스 플랫폼 개발자'
  },
  
  // Line - NEW 제거 및 정리
  'line': {
    'Search Engineer': 'Search Engineer',
    'Platform Server QA Assistant NEW': 'Platform Server QA Engineer',
    'WEBTOON - Operations & Growth Intern NEW': 'WEBTOON Operations & Growth Intern',
    'WEBTOON - Creative Marketing Designer NEW': 'WEBTOON Creative Marketing Designer',
    'Backend Engineer_Corporate Business NEW': 'Backend Engineer (Corporate Business)',
    'AD Platform Product Manager NEW': 'AD Platform Product Manager',
    'LINE Ads - Server Engineer NEW': 'LINE Ads Server Engineer',
    'Webtoon_Social Marketing': 'WEBTOON Social Marketing Manager'
  },
  
  // Coupang - 이상한 텍스트 제거 및 정리
  'coupang': {
    'Engineering Blog': 'Software Engineer (Platform)',
    'Staff Software Engineer 저장하기 저장 완료 벵갈루루': 'Staff Software Engineer (Global)',
    'Staff Software Engineer': 'Staff Software Engineer (E-commerce Platform)'
  },
  
  // Baemin - 이미 괜찮지만 약간 개선
  'baemin': {
    'AI엔지니어': 'AI Engineer (배달의민족)',
    'iOS 개발자 (푸드서비스)': 'iOS 개발자 (푸드 서비스)',
    'ML엔지니어 (AI플랫폼)': 'ML Engineer (AI 플랫폼)',
    '검색플랫폼팀 서버개발자': '검색 플랫폼 서버 개발자',
    '데이터엔지니어 (라이더모델링)': '데이터 엔지니어 (라이더 모델링)',
    '백엔드 개발자 (CS 프로덕트)': '백엔드 개발자 (CS Product)',
    '백엔드 시스템 개발자 (딜리버리)': '백엔드 시스템 개발자 (Delivery)',
    '테스트 자동화 엔지니어': 'QA 자동화 엔지니어'
  }
}

async function fixJobTitles() {
  try {
    console.log('Fetching all jobs...')
    const jobs = await prisma.job.findMany({
      include: {
        company: true
      }
    })
    
    console.log(`Found ${jobs.length} jobs to process`)
    
    let updatedCount = 0
    
    for (const job of jobs) {
      const companyName = job.company.name
      const currentTitle = job.title
      
      if (improvedTitles[companyName] && improvedTitles[companyName][currentTitle]) {
        const newTitle = improvedTitles[companyName][currentTitle]
        
        await prisma.job.update({
          where: { id: job.id },
          data: { title: newTitle }
        })
        
        console.log(`✓ Updated [${companyName}]: "${currentTitle}" → "${newTitle}"`)
        updatedCount++
      } else {
        console.log(`- Skipped [${companyName}]: "${currentTitle}" (no mapping found)`)
      }
    }
    
    console.log(`\nCompleted! Updated ${updatedCount} job titles.`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixJobTitles()