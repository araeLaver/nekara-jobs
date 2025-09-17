import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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