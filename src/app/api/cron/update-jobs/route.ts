import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job 인증 헤더 확인
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting daily job update...')

    // 1. 기존 공고들을 비활성화
    await prisma.job.updateMany({
      where: {
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    // 2. 새로운 공고 데이터 (실제로는 크롤러에서 가져와야 함)
    const newJobs = await generateSampleJobs()

    // 3. 새 공고들 삽입
    let insertedCount = 0
    for (const jobData of newJobs) {
      try {
        // 회사 찾기 또는 생성
        let company = await prisma.company.findFirst({
          where: { name: jobData.companyName }
        })

        if (!company) {
          company = await prisma.company.create({
            data: {
              name: jobData.companyName,
              nameEn: jobData.companyNameEn,
              logo: null,
              website: jobData.companyWebsite
            }
          })
        }

        // 중복 체크 (제목과 회사로)
        const existingJob = await prisma.job.findFirst({
          where: {
            title: jobData.title,
            companyId: company.id
          }
        })

        if (!existingJob) {
          // 새 공고 삽입
          await prisma.job.create({
            data: {
              title: jobData.title,
              description: jobData.description,
              location: jobData.location,
              department: jobData.department,
              jobType: jobData.jobType || '정규직',
              experience: jobData.experience,
              salary: jobData.salary || '',
              originalUrl: jobData.originalUrl,
              companyId: company.id,
              isActive: true,
              postedAt: new Date(),
              deadline: jobData.deadline
            }
          })
          insertedCount++
        } else {
          // 기존 공고 활성화
          await prisma.job.update({
            where: { id: existingJob.id },
            data: {
              isActive: true,
              postedAt: new Date() // 게시일 업데이트
            }
          })
        }
      } catch (error) {
        console.error('Job insertion error:', error)
      }
    }

    console.log(`Job update completed. Inserted: ${insertedCount}, Total processed: ${newJobs.length}`)

    return NextResponse.json({
      success: true,
      message: `Job update completed`,
      inserted: insertedCount,
      total: newJobs.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 샘플 데이터 생성 함수 (실제로는 웹 크롤링으로 대체)
async function generateSampleJobs() {
  const companies = [
    { name: 'naver', nameEn: 'NAVER Corporation', website: 'https://www.navercorp.com', careerUrl: 'https://recruit.navercorp.com/rcrt/list.do' },
    { name: 'kakao', nameEn: 'Kakao Corporation', website: 'https://www.kakaocorp.com', careerUrl: 'https://careers.kakao.com/jobs' },
    { name: 'line', nameEn: 'LINE Corporation', website: 'https://linecorp.com', careerUrl: 'https://careers.linecorp.com/ko/jobs' },
    { name: 'coupang', nameEn: 'Coupang Corporation', website: 'https://www.coupang.com', careerUrl: 'https://www.coupang.jobs/kr/' },
    { name: 'baemin', nameEn: 'Woowa Brothers', website: 'https://www.woowahan.com', careerUrl: 'https://career.woowahan.com/' },
    { name: 'nexon', nameEn: 'NEXON Korea Corporation', website: 'https://www.nexon.com', careerUrl: 'https://career.nexon.com/user/recruit/member/postList' }
  ]

  const jobTypes = ['프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', '안드로이드 개발자', 'iOS 개발자', 'DevOps 엔지니어', 'AI/ML 엔지니어', 'Data Engineer']
  const locations = ['서울 강남구', '서울 서초구', '경기 성남시 분당구', '서울 송파구']
  const experiences = ['신입', '경력 1-3년', '경력 3-5년', '경력 5년 이상']

  const jobs = []
  const today = new Date()

  for (let i = 0; i < 50; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)]
    const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const experience = experiences[Math.floor(Math.random() * experiences.length)]

    // 마감일은 30-60일 후
    const deadline = new Date(today)
    deadline.setDate(deadline.getDate() + 30 + Math.floor(Math.random() * 30))

    jobs.push({
      title: `${jobType} (${company.nameEn})`,
      description: `${company.nameEn}에서 ${jobType}를 모집합니다.\n\n주요 업무:\n• 웹/앱 서비스 개발 및 운영\n• 신기술 도입 및 시스템 개선\n• 팀 협업 및 코드 리뷰\n\n자격 요건:\n• 관련 기술 스택 경험\n• 협업 능력 및 소통 능력\n• 새로운 기술에 대한 학습 의지`,
      location,
      department: '개발팀',
      jobType: '정규직',
      experience,
      salary: '',
      originalUrl: company.careerUrl,
      companyName: company.name,
      companyNameEn: company.nameEn,
      companyWebsite: company.website,
      deadline
    })
  }

  return jobs
}