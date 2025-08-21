const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 회사별 다른 마감일 패턴 생성
function generateDeadline(companyName, postedDate) {
  const posted = new Date(postedDate)
  const now = new Date()
  
  // 회사별 채용 기간 패턴 (일단위)
  const companyPatterns = {
    'naver': 30,     // 네이버: 약 1개월
    'kakao': 21,     // 카카오: 약 3주
    'line': 28,      // 라인: 약 4주
    'coupang': 14,   // 쿠팡: 약 2주
    'baemin': 35     // 배민: 약 5주
  }
  
  const baseDays = companyPatterns[companyName] || 30
  
  // 약간의 랜덤성 추가 (-5 ~ +5일)
  const randomOffset = Math.floor(Math.random() * 11) - 5
  const totalDays = baseDays + randomOffset
  
  // 게시일로부터 계산
  const deadline = new Date(posted)
  deadline.setDate(deadline.getDate() + totalDays)
  
  return deadline
}

async function addJobDeadlines() {
  try {
    console.log('Fetching jobs...')
    const jobs = await prisma.job.findMany({
      include: {
        company: true
      }
    })
    
    console.log(`Found ${jobs.length} jobs`)
    
    for (const job of jobs) {
      const deadline = generateDeadline(job.company.name, job.postedAt)
      
      await prisma.job.update({
        where: { id: job.id },
        data: { deadline: deadline }
      })
      
      console.log(`Updated job ${job.id} (${job.company.name}): ${job.title} - Deadline: ${deadline.toLocaleDateString('ko-KR')}`)
    }
    
    console.log('All job deadlines updated successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addJobDeadlines()