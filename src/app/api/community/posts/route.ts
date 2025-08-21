import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // 임시로 샘플 게시글 반환
    const samplePosts = [
      {
        id: 'sample-1',
        title: '네이버 신입 공채 면접 후기 공유합니다',
        content: '안녕하세요! 최근 네이버 신입 공채 면접을 봤는데 경험을 공유하고 싶어서 글 올립니다. 1차 코딩테스트부터 최종 면접까지의 과정을 상세히 적어봤어요.',
        category: 'job_discussion',
        tags: ['네이버', '신입공채', '면접후기', '코딩테스트'],
        likes: 42,
        views: 156,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user-1',
          nickname: '개발자지망생',
          avatar: null
        },
        _count: {
          comments: 8
        }
      },
      {
        id: 'sample-2',
        title: '카카오 백엔드 개발자 업무 후기',
        content: '카카오에서 백엔드 개발자로 6개월 근무한 후기입니다. 회사 분위기, 업무 강도, 성장 기회 등에 대해 솔직하게 적어봤어요.',
        category: 'company_review',
        tags: ['카카오', '백엔드', '회사후기', '신입'],
        likes: 67,
        views: 234,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user-2',
          nickname: '카카오직장인',
          avatar: null
        },
        _count: {
          comments: 15
        }
      },
      {
        id: 'sample-3',
        title: '비전공자에서 개발자로 취업 성공기',
        content: '문과 출신에서 독학으로 개발 공부해서 네카라쿠배 취업에 성공한 경험을 공유합니다. 어떻게 공부했는지, 어떤 어려움이 있었는지 솔직하게 말씀드릴게요.',
        category: 'career_advice',
        tags: ['비전공자', '독학', '취업성공', '경험공유'],
        likes: 89,
        views: 312,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user-3',
          nickname: '코딩성공러',
          avatar: null
        },
        _count: {
          comments: 23
        }
      },
      {
        id: 'sample-4',
        title: '라인 프론트엔드 인턴 지원 질문있어요!',
        content: '라인 프론트엔드 인턴에 지원하려고 하는데, 포트폴리오는 어떻게 준비해야 할까요? 경험 있으신 분들 조언 부탁드려요.',
        category: 'general',
        tags: ['라인', '프론트엔드', '인턴', '포트폴리오'],
        likes: 12,
        views: 78,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user-4',
          nickname: '프론트지망생',
          avatar: null
        },
        _count: {
          comments: 5
        }
      },
      {
        id: 'sample-5',
        title: '쿠팡 개발자 연봉 정보 공유',
        content: '쿠팡 신입 개발자 연봉 정보를 공유합니다. 면접에서 받은 오퍼 내용과 실제 급여 구조에 대해 알려드릴게요.',
        category: 'company_review',
        tags: ['쿠팡', '연봉', '신입개발자', '급여정보'],
        likes: 156,
        views: 445,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          id: 'user-5',
          nickname: '쿠팡개발자',
          avatar: null
        },
        _count: {
          comments: 31
        }
      }
    ]
    
    return NextResponse.json({
      posts: samplePosts,
      pagination: {
        current: page,
        total: samplePosts.length,
        pages: 1,
        limit
      }
    })

  } catch (error) {
    console.error('Community Posts API Error:', error)
    return NextResponse.json(
      { error: '게시글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category, tags, authorId } = body

    if (!title || !content || !category || !authorId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 새 게시글을 기존 목록에 추가하기 위해 localStorage나 전역 상태에 저장
    const post = {
      id: 'user-post-' + Date.now(),
      title,
      content,
      category,
      tags: tags || [],
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      author: {
        id: authorId,
        nickname: '김개발자',
        avatar: null
      },
      _count: {
        comments: 0
      }
    }

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error('Create Post API Error:', error)
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}