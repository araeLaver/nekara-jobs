const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllJobTitles() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true
      },
      orderBy: [
        { company: { name: 'asc' } },
        { title: 'asc' }
      ]
    })
    
    // Group by company
    const jobsByCompany = {}
    jobs.forEach(job => {
      if (!jobsByCompany[job.company.name]) {
        jobsByCompany[job.company.name] = []
      }
      jobsByCompany[job.company.name].push(job)
    })
    
    // Display grouped jobs
    Object.keys(jobsByCompany).forEach(companyName => {
      console.log(`\n=== ${companyName.toUpperCase()} (${jobsByCompany[companyName].length}개 공고) ===`)
      jobsByCompany[companyName].forEach((job, index) => {
        console.log(`${index + 1}. ${job.title}`)
      })
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllJobTitles()