/**
 * 환경변수 검증 유틸리티
 * 서버 시작 시 필수 환경변수가 설정되어 있는지 확인
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'CRON_SECRET',
] as const

const optionalEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_API_URL',
  'ALLOWED_ORIGINS',
  'NODE_ENV',
] as const

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  // 필수 환경변수 체크
  requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\n` +
      `Please check your .env file or environment configuration.`
    )
  }

  // 선택적 환경변수 경고
  optionalEnvVars.forEach(key => {
    if (!process.env[key]) {
      warnings.push(key)
    }
  })

  // 프로덕션 환경 추가 검증
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션에서는 NEXTAUTH_SECRET 필수
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error(
        'NEXTAUTH_SECRET is required in production environment'
      )
    }

    // 프로덕션에서 DATABASE_URL이 SSL 사용하는지 확인
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl && !dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
      console.warn(
        '⚠️  WARNING: DATABASE_URL does not include SSL configuration. ' +
        'Consider adding ?sslmode=require for production.'
      )
    }

    // ALLOWED_ORIGINS 체크
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn(
        '⚠️  WARNING: ALLOWED_ORIGINS not set. CORS will use default localhost origins.'
      )
    }
  }

  if (warnings.length > 0) {
    console.log(
      `ℹ️  Optional environment variables not set:\n${warnings.map(k => `  - ${k}`).join('\n')}`
    )
  }

  console.log('✅ Environment variables validated successfully')
}

// 타입 안전한 환경변수 접근
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  CRON_SECRET: process.env.CRON_SECRET!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const
