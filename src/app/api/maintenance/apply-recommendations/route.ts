import { NextRequest, NextResponse } from 'next/server'
import { applyRecommendations } from '@/scripts/apply-quality-recommendations'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

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

    const result = await applyRecommendations()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    return handleApiError(error)
  }
}
