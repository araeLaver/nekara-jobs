import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 임시로 샘플 채팅방 반환
    const sampleRooms = [
      {
        id: 'room-1',
        name: '네카라쿠배 신입 채용 정보',
        description: '2025년 상반기 신입 채용 정보를 공유하는 채팅방입니다.',
        type: 'open',
        memberCount: 45,
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        creator: {
          id: 'user-1',
          nickname: '취업멘토',
          avatar: null
        }
      },
      {
        id: 'room-2',
        name: '프론트엔드 개발자 모임',
        description: 'React, Vue, Angular 등 프론트엔드 기술 토론방',
        type: 'open',
        memberCount: 32,
        isActive: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        creator: {
          id: 'user-2',
          nickname: '리액트마스터',
          avatar: null
        }
      },
      {
        id: 'room-3',
        name: '백엔드 아키텍처 스터디',
        description: '마이크로서비스, 클라우드, 데이터베이스 설계 등을 다루는 스터디방',
        type: 'group',
        memberCount: 18,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        creator: {
          id: 'user-3',
          nickname: '백엔드구루',
          avatar: null
        }
      },
      {
        id: 'room-4',
        name: '코딩테스트 문제 풀이',
        description: '알고리즘 문제 풀이와 코딩테스트 대비 방',
        type: 'open',
        memberCount: 67,
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        creator: {
          id: 'user-4',
          nickname: '알고리즘천재',
          avatar: null
        }
      }
    ]
    
    return NextResponse.json({
      rooms: sampleRooms,
      pagination: {
        current: page,
        total: sampleRooms.length,
        pages: 1,
        limit
      }
    })

  } catch (error) {
    console.error('Chat Rooms API Error:', error)
    return NextResponse.json(
      { error: '채팅방 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, maxMembers, creatorId } = body

    if (!name || !type || !creatorId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 유효한 타입 검증
    if (!['private', 'group', 'open'].includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 채팅방 타입입니다.' },
        { status: 400 }
      )
    }

    // 임시 응답
    const chatRoom = {
      id: 'temp-' + Date.now(),
      name,
      description,
      type,
      maxMembers,
      creatorId,
      creator: {
        id: creatorId,
        nickname: '임시사용자',
        avatar: null
      }
    }

    return NextResponse.json(chatRoom, { status: 201 })

  } catch (error) {
    console.error('Create Chat Room API Error:', error)
    return NextResponse.json(
      { error: '채팅방 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}