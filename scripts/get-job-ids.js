const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getJobIds() {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        company: {
          select: {
            name: true
          }
        }
      },
      take: 15
    })
    
    console.log('실제 공고 ID들:')
    jobs.forEach(job => {
      console.log(`ID: ${job.id}`)
      console.log(`회사: ${job.company.name}`)
      console.log(`제목: ${job.title}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getJobIds()