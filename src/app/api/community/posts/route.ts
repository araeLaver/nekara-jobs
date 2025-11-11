import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, ValidationError } from '@/lib/errors'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// 1. GET: Fetch all community posts
export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.communityPost.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Add pagination later if needed
    })
    return NextResponse.json({ posts })
  } catch (error) {
    return handleApiError(error)
  }
}

// 2. POST: Create a new community post
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category, tags } = body

    // 유효성 검사
    if (!title || !content || !category) {
      throw new ValidationError('제목, 내용, 카테고리는 필수입니다.')
    }

    if (title.length > 200) {
      throw new ValidationError('제목은 200자를 초과할 수 없습니다.')
    }

    if (content.length > 10000) {
      throw new ValidationError('내용은 10,000자를 초과할 수 없습니다.')
    }

    const validCategories = ['general', 'job_discussion', 'company_review', 'career_advice']
    if (!validCategories.includes(category)) {
      throw new ValidationError('유효하지 않은 카테고리입니다.')
    }

    // 인증된 사용자 ID로 게시글 생성 (클라이언트의 authorId 무시)
    const newPost = await prisma.communityPost.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        authorId: user.id, // 인증된 사용자 ID 사용
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
