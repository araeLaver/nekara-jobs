import { NextRequest } from 'next/server'
import { User } from '@prisma/client'
import { prisma } from './prisma'

// JWT 대신 간단한 세션 토큰 방식 사용 (향후 JWT로 업그레이드 가능)
export interface AuthSession {
  userId: string
  username: string
  email?: string | null
}

/**
 * 요청에서 인증 토큰을 추출하고 검증
 */
export async function authenticateRequest(request: NextRequest): Promise<User | null> {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // "Bearer " 제거

    // 토큰이 userId 형태라고 가정 (실제로는 JWT 검증 필요)
    // TODO: JWT 라이브러리로 업그레이드 (jsonwebtoken, jose 등)
    const userId = token

    // DB에서 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * 쿠키에서 사용자 ID 추출 (클라이언트 사이드)
 */
export function getUserFromCookie(cookieString?: string): string | null {
  if (!cookieString) return null

  const match = cookieString.match(/user_id=([^;]+)/)
  return match ? match[1] : null
}

/**
 * 요청 본문에서 사용자 ID를 제거하고 인증된 사용자 ID 반환
 * (클라이언트가 임의로 userId/authorId를 전송하는 것을 방지)
 */
export function sanitizeUserInput<T extends { authorId?: string; userId?: string }>(
  body: T,
  authenticatedUserId: string
): Omit<T, 'authorId' | 'userId'> & { authorId: string } {
  const { authorId, userId, ...rest } = body
  return {
    ...rest,
    authorId: authenticatedUserId
  }
}

/**
 * API 라우트 핸들러를 인증으로 감싸는 헬퍼 함수
 */
export function withAuth<T>(
  handler: (request: NextRequest, user: User) => Promise<T>
) {
  return async (request: NextRequest): Promise<T | Response> => {
    const user = await authenticateRequest(request)

    if (!user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ) as any
    }

    return handler(request, user)
  }
}
