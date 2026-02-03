import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

async function deactivateExpiredJobs() {
  const now = new Date()
  const result = await prisma.job.updateMany({
    where: {
      isActive: true,
      deadline: { not: null, lt: now }
    },
    data: { isActive: false, updatedAt: new Date() }
  })

  return result.count
}

async function removeInactiveOldJobs() {
  const days = Number(process.env.DATA_CLEANUP_INACTIVE_DAYS || 90)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const result = await prisma.job.deleteMany({
    where: {
      isActive: false,
      updatedAt: { lt: cutoff }
    }
  })

  return result.count
}

async function normalizeCompanyNames() {
  const mapping: Record<string, string> = {
    naver: 'NAVER',
    kakao: 'Kakao',
    line: 'LINE',
    toss: 'Toss',
    baemin: 'Woowa Brothers',
    nexon: 'NEXON',
    coupang: 'Coupang',
    krafton: 'KRAFTON',
    zigbang: 'Zigbang',
    bucketplace: 'Bucketplace',
    carrot: 'Karrot'
  }

  const companies = await prisma.company.findMany()
  let updated = 0

  for (const company of companies) {
    const key = company.name.toLowerCase()
    const normalized = mapping[key]
    if (normalized && normalized !== company.name) {
      await prisma.company.update({
        where: { id: company.id },
        data: { name: normalized }
      })
      updated += 1
    }
  }

  return updated
}

export async function GET(request: NextRequest) {
  try {
    const authSecret = process.env.MAINTENANCE_SECRET
    if (!authSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (authHeader !== `Bearer ${authSecret}` && token !== authSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expiredCount = await deactivateExpiredJobs()
    const removedCount = await removeInactiveOldJobs()
    const companyUpdated = await normalizeCompanyNames()

    return NextResponse.json({
      success: true,
      deactivated: expiredCount,
      removed: removedCount,
      companyUpdated
    })
  } catch (error) {
    return handleApiError(error)
  }
}
