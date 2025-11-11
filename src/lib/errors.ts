import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다.') {
    super(401, message, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '권한이 없습니다.') {
    super(403, message, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(message = '리소스를 찾을 수 없습니다.') {
    super(404, message, 'NOT_FOUND')
  }
}

/**
 * API 에러를 일관된 형식의 Response로 변환
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // AppError 계열
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  // Prisma 에러
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: '중복된 데이터가 존재합니다.', code: 'DUPLICATE_ERROR' },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: '데이터를 찾을 수 없습니다.', code: 'NOT_FOUND' },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          { error: '잘못된 참조입니다.', code: 'INVALID_REFERENCE' },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          { error: '데이터베이스 오류가 발생했습니다.', code: 'DATABASE_ERROR' },
          { status: 500 }
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: '입력 데이터가 유효하지 않습니다.', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // 일반 에러
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'production'
          ? '서버 오류가 발생했습니다.'
          : error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }

  // 알 수 없는 에러
  return NextResponse.json(
    { error: '알 수 없는 오류가 발생했습니다.', code: 'UNKNOWN_ERROR' },
    { status: 500 }
  )
}

/**
 * API 핸들러를 에러 처리로 감싸는 헬퍼 함수
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
