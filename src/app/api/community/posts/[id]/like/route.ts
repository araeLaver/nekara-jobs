import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, UnauthorizedError } from '@/lib/errors'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

    const userId = user.id

    const result = await prisma.$transaction(async (tx) => {
      const existingLike = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      })

      if (existingLike) {
        // Unlike
        await tx.postLike.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        })
        const updatedPost = await tx.communityPost.update({
          where: { id: postId },
          data: {
            likes: {
              decrement: 1,
            },
          },
        })
        return { liked: false, likes: updatedPost.likes }
      } else {
        // Like
        await tx.postLike.create({
          data: {
            postId,
            userId,
          },
        })
        const updatedPost = await tx.communityPost.update({
          where: { id: postId },
          data: {
            likes: {
              increment: 1,
            },
          },
        })
        return { liked: true, likes: updatedPost.likes }
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
