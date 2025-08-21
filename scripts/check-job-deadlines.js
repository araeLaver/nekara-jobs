const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJobDeadlines() {
  try {
    const jobs = await prisma.job.findMany({
      take: 5,
      include: {
        company: true
      }
    })
    
    console.log('Sample jobs:')
    jobs.forEach(job => {
      console.log(`ID: ${job.id}`)
      console.log(`Title: ${job.title}`)
      console.log(`Company: ${job.company.name}`)
      console.log(`Deadline: ${job.deadline}`)
      console.log('---')
    })
    
    const totalJobs = await prisma.job.count()
    console.log(`Total jobs: ${totalJobs}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobDeadlines()