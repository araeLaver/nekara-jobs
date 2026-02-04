import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/errors'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// 4. POST: Create a new comment on a post
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params

    const user = await authenticateRequest(request)
    if (!user) {
      throw new UnauthorizedError()
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      throw new ValidationError('댓글 내용이 필수입니다.')
    }

    const authorId = user.id

    // Check if post exists
    const postExists = await prisma.communityPost.findUnique({ where: { id: postId } })

    if (!postExists) {
      throw new ValidationError('존재하지 않는 게시글입니다.')
    }

    const newComment = await prisma.communityComment.create({
      data: {
        content,
        authorId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
