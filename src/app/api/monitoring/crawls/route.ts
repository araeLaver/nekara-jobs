import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'
export const revalidate = 300

function parseNumber(value: string | null, fallback: number) {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: NextRequest) {
  try {
    const authSecret = process.env.MONITORING_SECRET
    if (authSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${authSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { searchParams } = new URL(request.url)
    const days = Math.max(1, parseNumber(searchParams.get('days'), 7))
    const limit = Math.min(500, Math.max(20, parseNumber(searchParams.get('limit'), 100)))

    const since = new Date()
    since.setDate(since.getDate() - days)

    const [summaryRows, lastRuns] = await Promise.all([
      prisma.$queryRaw<Array<{ total: number; success: number; failed: number; warning: number; avg_duration_sec: number | null }>>`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'success')::int AS success,
          COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
          COUNT(*) FILTER (WHERE status = 'warning')::int AS warning,
          AVG(EXTRACT(EPOCH FROM (end_time - start_time))) AS avg_duration_sec
        FROM crawl_logs
        WHERE created_at >= ${since}
      `,
      prisma.$queryRaw<Array<{ company: string; status: string; start_time: Date; end_time: Date | null; job_count: number | null; error_msg: string | null; created_at: Date }>>`
        SELECT DISTINCT ON (company)
          company,
          status,
          start_time,
          end_time,
          job_count,
          error_msg,
          created_at
        FROM crawl_logs
        ORDER BY company, created_at DESC
        LIMIT ${limit}
      `
    ])

    const summary = summaryRows[0] || {
      total: 0,
      success: 0,
      failed: 0,
      warning: 0,
      avg_duration_sec: null
    }

    const successRate = summary.total > 0 ? summary.success / summary.total : 0

    return NextResponse.json({
      windowDays: days,
      summary: {
        total: summary.total,
        success: summary.success,
        failed: summary.failed,
        warning: summary.warning,
        successRate: Number(successRate.toFixed(3)),
        avgDurationSec: summary.avg_duration_sec ? Number(summary.avg_duration_sec.toFixed(2)) : null
      },
      lastRuns: lastRuns.map(row => ({
        company: row.company,
        status: row.status,
        startTime: row.start_time,
        endTime: row.end_time,
        jobCount: row.job_count,
        errorMsg: row.error_msg,
        createdAt: row.created_at
      }))
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
