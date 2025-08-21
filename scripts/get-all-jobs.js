const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getAllJobs() {
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
      }
    })
    
    console.log(`총 ${jobs.length}개의 공고:`)
    jobs.forEach(job => {
      console.log(`'${job.id}': { // ${job.company.name} - ${job.title}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getAllJobs()