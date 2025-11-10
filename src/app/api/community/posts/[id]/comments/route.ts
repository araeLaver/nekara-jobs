import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// 4. POST: Create a new comment on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params
    const body = await request.json()
    const { content, authorId } = body

    if (!content || !authorId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // Check if post and user exist in parallel
    const [postExists, userExists] = await Promise.all([
      prisma.communityPost.findUnique({ where: { id: postId } }),
      prisma.user.findUnique({ where: { id: authorId } })
    ]);

    if (!postExists) {
      return NextResponse.json({ error: '존재하지 않는 게시글입니다.' }, { status: 404 })
    }
    if (!userExists) {
      return NextResponse.json({ error: '존재하지 않는 사용자입니다.' }, { status: 404 })
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
    console.error(`Error creating comment for post ${params.id}:`, error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
