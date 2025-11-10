import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    console.error('Error fetching community posts:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 2. POST: Create a new community post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category, tags, authorId } = body

    if (!title || !content || !category || !authorId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { id: authorId } })
    if (!userExists) {
      return NextResponse.json({ error: '존재하지 않는 사용자입니다.' }, { status: 404 })
    }

    const newPost = await prisma.communityPost.create({
      data: {
        title,
        content,
        category,
        tags,
        authorId,
      },
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating community post:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
