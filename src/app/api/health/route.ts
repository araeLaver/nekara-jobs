import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 데이터베이스 연결 체크
    await prisma.$queryRaw`SELECT 1`

    // 추가 health 체크 정보
    const activeJobsCount = await prisma.job.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        jobs: activeJobsCount > 0 ? 'ok' : 'warning'
      }
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production'
        ? 'Database connection failed'
        : error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
