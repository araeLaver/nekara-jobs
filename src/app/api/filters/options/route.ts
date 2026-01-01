import { NextRequest, NextResponse } from 'next/server'
import { jobService } from '@/services/job.service'
import { handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Added to prevent static rendering warnings

/**
 * GET /api/filters/options
 * GET /api/filters/options?field=department
 *
 * 필터링에 사용 가능한 모든 옵션을 동적으로 반환합니다.
 * Service Layer를 통해 DB에 실제로 존재하는 데이터를 기반으로 필터 옵션을 생성합니다.
 * 'field' 쿼리 파라미터가 있으면 특정 필드의 옵션만 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const field = searchParams.get('field')

    if (field) {
      // 특정 필드의 옵션만 반환하는 로직
      const validFields = ['department', 'location', 'jobType', 'experience']
      if (!validFields.includes(field)) {
        return NextResponse.json(
          { error: `유효하지 않은 필드입니다. 가능한 값: ${validFields.join(', ')}` },
          { status: 400 }
        )
      }

      const options = await prisma.job.findMany({
        where: { isActive: true, [field]: { not: null } },
        select: { [field]: true },
        distinct: [field as any],
        orderBy: { [field]: 'asc' }
      })

      const cleanedOptions = options
        .map(item => (item as any)[field]) // Explicitly cast to 'any' for the intermediate step to avoid type complexity
        .filter((value): value is string =>
          value !== null &&
          value !== undefined &&
          typeof value === 'string' &&
          value.trim() !== ''
        )
        .sort()

      return NextResponse.json({
        field,
        options: ['전체', ...cleanedOptions]
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      })
    } else {
      // 모든 필터 옵션을 반환하는 기존 로직
      const options = await jobService.getFilterOptions()

      // 캐시 설정: 1시간
      return NextResponse.json(options, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      })
    }

  } catch (error) {
    return handleApiError(error)
  }
}
