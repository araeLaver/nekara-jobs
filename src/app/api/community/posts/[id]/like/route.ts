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
      const post = await tx.communityPost.findUnique({
        where: { id: postId },
        select: { id: true }
      })

      if (!post) {
        return { notFound: true as const }
      }

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
      } else {
        // Like
        await tx.postLike.create({
          data: {
            postId,
            userId,
          },
        })
      }

      const likesCount = await tx.postLike.count({ where: { postId } })
      const updatedPost = await tx.communityPost.update({
        where: { id: postId },
        data: { likes: likesCount }
      })

      return { liked: !existingLike, likes: updatedPost.likes }
    })

    if ('notFound' in result) {
      return NextResponse.json({ error: '寃뚯떆湲??李얠쓣 ???놁뒿?덈떎.' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
