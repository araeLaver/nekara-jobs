import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

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
    console.error(`Error liking post ${params.id}:`, error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
