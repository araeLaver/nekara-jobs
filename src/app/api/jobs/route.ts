import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const company = searchParams.get('company') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('jobType') || ''
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      isActive: true
    }

    if (company) {
      where.company = {
        name: company
      }
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    if (jobType) {
      where.jobType = {
        contains: jobType,
        mode: 'insensitive'
      }
    }

    if (department) {
      where.department = {
        contains: department,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // 채용공고 조회
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              logo: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          postedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.job.count({
        where
      })
    ])

    // 회사 순서 정의
    const companyOrder = ['naver', 'kakao', 'line', 'coupang', 'baemin', 'nexon', 'toss', 'carrot', 'krafton', 'zigbang', 'bucketplace']

    // 데이터 형식 변환
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description || '',
      location: job.location || '',
      department: job.department || '',
      jobType: job.jobType || '',
      experience: job.experience || '',
      postedAt: job.postedAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : null,
      isActive: job.isActive,
      originalUrl: job.originalUrl,
      company: {
        id: job.company.id,
        name: job.company.name,
        nameEn: job.company.nameEn,
        logo: job.company.logo
      },
      tags: job.tags.map(t => t.tag.name)
    }))

    // 회사 순서에 따라 정렬 (naver, kakao, line 순)
    formattedJobs.sort((a, b) => {
      const aIndex = companyOrder.indexOf(a.company.name)
      const bIndex = companyOrder.indexOf(b.company.name)

      // 둘 다 정의된 순서에 있는 경우
      if (aIndex !== -1 && bIndex !== -1) {
        if (aIndex !== bIndex) {
          return aIndex - bIndex
        }
        // 같은 회사면 최신 날짜 순
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      }

      // 하나만 정의된 순서에 있는 경우
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1

      // 둘 다 정의되지 않은 경우 최신 날짜 순
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        current: page,
        total,
        pages: totalPages,
        limit
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}