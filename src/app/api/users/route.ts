import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 민감한 정보 제외하고 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    return handleApiError(error)
  }
}
