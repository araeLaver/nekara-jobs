const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAllEncoding() {
  console.log('🔧 완전한 인코딩 수정 시작...')

  try {
    // 1. 모든 Job 삭제
    await prisma.job.deleteMany({})
    console.log('✅ 모든 기존 채용공고 삭제')

    // 2. 회사 정보 확인 및 수정
    const companies = [
      {
        name: 'naver',
        nameEn: 'NAVER Corporation',
        website: 'www.navercorp.com',
        careerUrl: 'https://recruit.navercorp.com'
      },
      {
        name: 'kakao',
        nameEn: 'Kakao Corporation',
        website: 'www.kakaocorp.com',
        careerUrl: 'https://careers.kakao.com/jobs'
      },
      {
        name: 'line',
        nameEn: 'LINE Corporation',
        website: 'linecorp.com',
        careerUrl: 'https://careers.linecorp.com/ko'
      },
      {
        name: 'coupang',
        nameEn: 'Coupang Corporation',
        website: 'www.coupang.com',
        careerUrl: 'https://www.coupang.jobs/kr'
      },
      {
        name: 'baemin',
        nameEn: 'Woowa Brothers',
        website: 'www.woowahan.com',
        careerUrl: 'https://career.woowahan.com'
      },
      {
        name: 'nexon',
        nameEn: 'NEXON Korea Corporation',
        website: 'www.nexon.com',
        careerUrl: 'https://careers.nexon.com'
      }
    ]

    // 회사 업데이트 또는 생성
    for (const companyData of companies) {
      await prisma.company.upsert({
        where: { name: companyData.name },
        update: {
          nameEn: companyData.nameEn,
          website: companyData.website
        },
        create: {
          name: companyData.name,
          nameEn: companyData.nameEn,
          website: companyData.website,
          logo: null
        }
      })
    }
    console.log('✅ 회사 정보 업데이트 완료')

    // 3. ASCII로만 구성된 채용공고 생성
    const jobData = [
      {
        company: 'naver',
        jobs: [
          {
            title: 'Frontend Developer',
            description: 'We are looking for a Frontend Developer to join NAVER Corporation.',
            location: 'Seoul, Gangnam',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Backend Developer',
            description: 'Backend Developer position at NAVER Corporation.',
            location: 'Seoul, Seocho',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'DevOps Engineer',
            description: 'DevOps Engineer role at NAVER Corporation.',
            location: 'Seongnam, Bundang',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Data Engineer',
            description: 'Data Engineer position available at NAVER.',
            location: 'Seoul, Gangnam',
            experience: 'Junior (1-3 years)'
          },
          {
            title: 'iOS Developer',
            description: 'iOS Developer needed for mobile team.',
            location: 'Seoul, Songpa',
            experience: 'Mid-level (3-5 years)'
          }
        ]
      },
      {
        company: 'kakao',
        jobs: [
          {
            title: 'Full Stack Developer',
            description: 'Full Stack Developer position at Kakao Corporation.',
            location: 'Seongnam, Bundang',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Android Developer',
            description: 'Android Developer for Kakao mobile apps.',
            location: 'Seoul, Gangnam',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'Machine Learning Engineer',
            description: 'ML Engineer for AI team at Kakao.',
            location: 'Seoul, Gangnam',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Cloud Architect',
            description: 'Cloud Architect position for infrastructure team.',
            location: 'Seongnam, Bundang',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Product Designer',
            description: 'Product Designer for Kakao services.',
            location: 'Seoul, Gangnam',
            experience: 'Mid-level (3-5 years)'
          }
        ]
      },
      {
        company: 'line',
        jobs: [
          {
            title: 'Backend Engineer',
            description: 'Backend Engineer for LINE messaging platform.',
            location: 'Seongnam, Bundang',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Frontend Engineer',
            description: 'Frontend Engineer for LINE web services.',
            location: 'Seoul, Gangnam',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'Security Engineer',
            description: 'Security Engineer for LINE platform security.',
            location: 'Seongnam, Bundang',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Data Scientist',
            description: 'Data Scientist for analytics team.',
            location: 'Seoul, Gangnam',
            experience: 'Mid-level (3-5 years)'
          }
        ]
      },
      {
        company: 'coupang',
        jobs: [
          {
            title: 'Software Engineer',
            description: 'Software Engineer for Coupang e-commerce platform.',
            location: 'Seoul, Songpa',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'Platform Engineer',
            description: 'Platform Engineer for infrastructure team.',
            location: 'Seoul, Gangnam',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Mobile Developer',
            description: 'Mobile Developer for Coupang app.',
            location: 'Seoul, Songpa',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'QA Engineer',
            description: 'QA Engineer for quality assurance team.',
            location: 'Seoul, Gangnam',
            experience: 'Junior (1-3 years)'
          }
        ]
      },
      {
        company: 'baemin',
        jobs: [
          {
            title: 'React Developer',
            description: 'React Developer for Baemin web platform.',
            location: 'Seoul, Songpa',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'Node.js Developer',
            description: 'Node.js Developer for backend services.',
            location: 'Seoul, Gangnam',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'UI/UX Designer',
            description: 'UI/UX Designer for Baemin app.',
            location: 'Seoul, Songpa',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'Data Analyst',
            description: 'Data Analyst for business intelligence team.',
            location: 'Seoul, Gangnam',
            experience: 'Junior (1-3 years)'
          }
        ]
      },
      {
        company: 'nexon',
        jobs: [
          {
            title: 'Game Developer',
            description: 'Game Developer for NEXON game development.',
            location: 'Seongnam, Bundang',
            experience: 'Mid-level (3-5 years)'
          },
          {
            title: 'Server Developer',
            description: 'Server Developer for game backend systems.',
            location: 'Seoul, Gangnam',
            experience: 'Senior (5+ years)'
          },
          {
            title: 'Unity Developer',
            description: 'Unity Developer for mobile game development.',
            location: 'Seongnam, Bundang',
            experience: 'Mid-level (3-5 years)'
          }
        ]
      }
    ]

    // 4. 채용공고 생성
    let createdCount = 0
    const allCompanies = await prisma.company.findMany()

    for (const companyJobs of jobData) {
      const company = allCompanies.find(c => c.name === companyJobs.company)
      if (!company) continue

      for (let i = 0; i < companyJobs.jobs.length; i++) {
        const job = companyJobs.jobs[i]
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 30) + 30)

        await prisma.job.create({
          data: {
            title: job.title,
            description: `${job.description}\n\nKey Responsibilities:\n- Develop and maintain high-quality software\n- Collaborate with cross-functional teams\n- Participate in code reviews and technical discussions\n- Contribute to system architecture and design\n\nRequirements:\n- ${job.experience} experience level\n- Strong technical skills in relevant technologies\n- Good communication and teamwork abilities\n- Problem-solving mindset`,
            location: job.location,
            department: 'Engineering',
            jobType: 'Full-time',
            experience: job.experience,
            salary: '',
            originalUrl: `${companies.find(c => c.name === companyJobs.company).careerUrl}#${job.title.replace(/\s+/g, '-')}-${Date.now()}-${i}`,
            companyId: company.id,
            isActive: true,
            postedAt: new Date(),
            deadline
          }
        })
        createdCount++
      }
    }

    console.log(`✅ ${createdCount}개 채용공고 생성 완료`)

    // 5. 검증
    const totalJobs = await prisma.job.count()
    const sampleJobs = await prisma.job.findMany({
      take: 5,
      include: { company: true },
      orderBy: { postedAt: 'desc' }
    })

    console.log(`\n📊 전체 채용공고: ${totalJobs}개`)
    console.log('\n📋 샘플 채용공고:')
    for (const job of sampleJobs) {
      console.log(`- ${job.title} @ ${job.company.nameEn}`)
      console.log(`  Location: ${job.location}`)
      console.log(`  Experience: ${job.experience}`)
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAllEncoding()