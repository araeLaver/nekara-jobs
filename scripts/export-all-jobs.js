const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function exportAllJobs() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
    
    console.log('const realJobData = {')
    jobs.forEach(job => {
      console.log(`  '${job.id}': {`)
      console.log(`    title: '${job.title}',`)
      console.log(`    description: '${job.description || ''}',`)
      console.log(`    location: '${job.location || ''}',`)
      console.log(`    department: '${job.department || ''}',`)
      console.log(`    experience: '${job.experience || ''}',`)
      console.log(`    company: { name: '${job.company.name}', nameEn: '${job.company.nameEn || job.company.name}' },`)
      console.log(`    originalUrl: '${job.originalUrl}'`)
      console.log(`  },`)
    })
    console.log('}')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportAllJobs()