import { NextRequest } from 'next/server'
import { User } from '@prisma/client'
import { prisma } from './prisma'
import { createHmac, timingSafeEqual } from 'crypto'

// Secret key for signing tokens. In production, this MUST be set in environment variables.
const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-this-in-prod'

export interface AuthSession {
  userId: string
  username: string
  email?: string | null
}

/**
 * Generates a secure token with HMAC signature.
 * Format: base64(userId).timestamp.signature
 */
export function signToken(userId: string): string {
  const timestamp = Date.now().toString()
  const userIdB64 = Buffer.from(userId).toString('base64')
  const payload = `${userIdB64}.${timestamp}`
  
  const signature = createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('base64url') // Use base64url for URL safety

  return `${payload}.${signature}`
}

/**
 * Verifies the token signature and expiration.
 * Returns userId if valid, null otherwise.
 */
export function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [userIdB64, timestamp, signature] = parts
    const payload = `${userIdB64}.${timestamp}`

    // 1. Verify Signature
    const expectedSignature = createHmac('sha256', SECRET_KEY)
      .update(payload)
      .digest('base64url')

    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (signatureBuffer.length !== expectedBuffer.length || 
        !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null
    }

    // 2. Verify Expiration (e.g., 7 days)
    const tokenTime = parseInt(timestamp, 10)
    const now = Date.now()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

    if (isNaN(tokenTime) || now - tokenTime > maxAge) {
      return null
    }

    // 3. Decode userId
    const userId = Buffer.from(userIdB64, 'base64').toString('utf-8')
    return userId
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
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

    // Verify the secure token
    const userId = verifyToken(token)
    
    if (!userId) {
      return null
    }

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
