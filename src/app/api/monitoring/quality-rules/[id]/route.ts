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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const updated = await prisma.companyQualityRule.update({
      where: { id: params.id },
      data: {
        company: String(body.company),
        minValidRatio: Number(body.minValidRatio ?? 0.7),
        minDescriptionLength: Number(body.minDescriptionLength ?? 50)
      }
    })

    return NextResponse.json({ rule: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.companyQualityRule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
