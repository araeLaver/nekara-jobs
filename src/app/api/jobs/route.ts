import { NextRequest, NextResponse } from 'next/server'
import { jobService, JobWithCompany } from '@/services/job.service' // JobWithCompany import
import { handleApiError } from '@/lib/errors'
import { rateLimit, apiRateLimits } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs
 *
 * 채용공고 목록 조회 API
 * Service Layer를 사용하여 비즈니스 로직을 분리했습니다.
 */
export async function GET(request: NextRequest) {
  // Rate limiting 적용
  const rateLimitResult = await rateLimit(apiRateLimits.jobs)(request)
  if (rateLimitResult) return rateLimitResult
  try {
    const searchParams = request.nextUrl.searchParams

    // 쿼리 파라미터 파싱
    const filters = {
      company: searchParams.get('company') || undefined,
      location: searchParams.get('location') || undefined,
      department: searchParams.get('department') || undefined,
      jobType: searchParams.get('jobType') || undefined,
      search: searchParams.get('search') || undefined
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    // Service Layer를 통해 데이터 조회
    const result = await jobService.getJobs(filters, pagination)

    // 응답 형식 변환
    const formattedJobs = result.jobs.map((job: JobWithCompany) => ({ // Explicitly cast job
      id: job.id,
      title: job.title,
      location: job.location || '',
      department: job.department || '',
      jobType: job.jobType || '',
      experience: job.experience || '',
      postedAt: job.postedAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : null,
      originalUrl: job.originalUrl,
      company: {
        id: job.company.id,
        name: job.company.name,
        nameEn: job.company.nameEn,
        logo: job.company.logo
      },
      tags: [] // 성능을 위해 tags는 포함하지 않음
    }))

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        current: result.pagination.page,
        total: result.pagination.total,
        pages: result.pagination.pages,
        limit: result.pagination.limit
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
