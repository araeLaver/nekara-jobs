import { NextRequest, NextResponse } from 'next/server'
import { jobService } from '@/services/job.service'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/filters/options
 *
 * 필터링에 사용 가능한 모든 옵션을 동적으로 반환합니다.
 * Service Layer를 통해 DB에 실제로 존재하는 데이터를 기반으로 필터 옵션을 생성합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const options = await jobService.getFilterOptions()

    // 캐시 설정: 1시간
    return NextResponse.json(options, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/filters/options?field=department
 *
 * 특정 필드의 옵션만 반환 (선택적)
 */
export async function GET_FIELD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const field = searchParams.get('field')

    if (!field) {
      return NextResponse.json(
        { error: 'field 파라미터가 필요합니다' },
        { status: 400 }
      )
    }

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
      .map(item => item[field as keyof typeof item])
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

  } catch (error) {
    return handleApiError(error)
  }
}
