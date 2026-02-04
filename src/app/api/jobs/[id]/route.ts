import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, NotFoundError, ValidationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await context.params

    if (!jobId) {
      throw new ValidationError('채용공고 ID가 필요합니다.')
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId
      },
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
      }
    })

    if (!job) {
      throw new NotFoundError('채용공고를 찾을 수 없습니다.')
    }

    // 조회수 증가 (비동기로 처리하여 응답 속도에 영향 없음)
    prisma.jobView.create({
      data: {
        jobId: job.id,
        ipAddress: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   '0.0.0.0',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(err => {
      // 조회수 기록 실패는 메인 로직에 영향 없음
      console.error('Failed to record job view:', err)
    })

    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description || '',
      location: job.location || '',
      department: job.department || '',
      jobType: job.jobType || '정규직',
      experience: job.experience || '',
      salary: job.salary || '',
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
    }

    return NextResponse.json(formattedJob)

  } catch (error) {
    return handleApiError(error)
  }
}
