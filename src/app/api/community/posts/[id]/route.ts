import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

// GET: Fetch a single post by ID, including like info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const post = await prisma.$transaction(async (tx) => {
      const postToUpdate = await tx.communityPost.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          // Include the list of users who liked the post
          likedBy: {
            select: {
              userId: true,
            }
          }
        },
      })

      if (!postToUpdate) {
        return null;
      }

      // Increment view count
      await tx.communityPost.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      })

      return postToUpdate;
    })

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    return handleApiError(error)
  }
}
