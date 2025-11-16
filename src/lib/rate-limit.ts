import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// 메모리 정리 (5분마다)
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  interval: number // 시간 윈도우 (밀리초)
  limit: number    // 최대 요청 수
}

// 기본 설정: 1분에 60회
export const defaultRateLimit: RateLimitConfig = {
  interval: 60 * 1000,
  limit: 60
}

// API별 설정
export const apiRateLimits = {
  jobs: { interval: 60 * 1000, limit: 100 },        // 1분 100회
  community: { interval: 60 * 1000, limit: 30 },    // 1분 30회
  cron: { interval: 60 * 1000, limit: 1 },          // 1분 1회
}

export function rateLimit(config: RateLimitConfig = defaultRateLimit) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // IP 주소 추출
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.interval
      }
      return null // 통과
    }

    if (store[key].resetTime < now) {
      // 시간 윈도우 리셋
      store[key] = {
        count: 1,
        resetTime: now + config.interval
      }
      return null // 통과
    }

    store[key].count++

    if (store[key].count > config.limit) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000)

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `요청 한도를 초과했습니다. ${retryAfter}초 후 다시 시도해주세요.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString()
          }
        }
      )
    }

    return null // 통과
  }
}
