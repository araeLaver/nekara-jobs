import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.MONITORING_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rules = await prisma.companyQualityRule.findMany({
      orderBy: { company: 'asc' }
    })

    return NextResponse.json({ rules })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const created = await prisma.companyQualityRule.create({
      data: {
        company: String(body.company),
        minValidRatio: Number(body.minValidRatio ?? 0.7),
        minDescriptionLength: Number(body.minDescriptionLength ?? 50)
      }
    })

    return NextResponse.json({ rule: created })
  } catch (error) {
    return handleApiError(error)
  }
}
