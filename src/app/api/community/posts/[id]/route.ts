import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 임시로 샘플 게시글 반환
    const post = {
      id: postId,
      title: '샘플 게시글 제목',
      content: '이것은 샘플 게시글 내용입니다.\n\n게시글 작성이 정상적으로 작동하는지 확인하기 위한 임시 내용입니다.',
      category: 'general',
      tags: ['샘플', '테스트'],
      likes: 0,
      views: 1,
      createdAt: new Date().toISOString(),
      author: {
        id: 'cm5bm25d20000y6o81xgdvgm0',
        nickname: '김개발자',
        avatar: null
      },
      _count: {
        comments: 0
      }
    }

    return NextResponse.json(post)

  } catch (error) {
    console.error('Post Detail API Error:', error)
    return NextResponse.json(
      { error: '게시글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const body = await request.json()
    const { title, content, category, tags } = body

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      )
    }

    // 임시로 업데이트된 게시글 반환
    const updatedPost = {
      id: postId,
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      likes: 0,
      views: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: 'cm5bm25d20000y6o81xgdvgm0',
        nickname: '김개발자',
        avatar: null
      },
      _count: {
        comments: 0
      }
    }

    return NextResponse.json(updatedPost)

  } catch (error) {
    console.error('Update Post API Error:', error)
    return NextResponse.json(
      { error: '게시글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 임시로 성공 응답 반환
    return NextResponse.json({ message: '게시글이 삭제되었습니다.' })

  } catch (error) {
    console.error('Delete Post API Error:', error)
    return NextResponse.json(
      { error: '게시글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}