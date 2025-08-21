const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getJobDetails() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      take: 5
    })
    
    console.log('실제 공고 상세 정보:')
    jobs.forEach(job => {
      console.log(`\n=== ${job.company.name} - ${job.title} ===`)
      console.log(`ID: ${job.id}`)
      console.log(`설명: ${job.description || '설명 없음'}`)
      console.log(`위치: ${job.location || '위치 정보 없음'}`)
      console.log(`부서: ${job.department || '부서 정보 없음'}`)
      console.log(`경력: ${job.experience || '경력 정보 없음'}`)
      console.log(`원본 URL: ${job.originalUrl}`)
      console.log(`태그: ${job.tags.map(t => t.tag.name).join(', ') || '태그 없음'}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getJobDetails()