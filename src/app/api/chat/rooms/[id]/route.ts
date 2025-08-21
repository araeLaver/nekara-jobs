import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id

    if (!roomId) {
      return NextResponse.json(
        { error: '채팅방 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 임시로 샘플 채팅방 정보 반환
    const sampleRooms: { [key: string]: any } = {
      'room-1': {
        id: 'room-1',
        name: '네카라쿠배 신입 채용 정보',
        description: '2025년 상반기 신입 채용 정보를 공유하는 채팅방입니다.',
        type: 'open',
        memberCount: 45,
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        members: [
          {
            id: 'member-1',
            user: {
              id: 'user-1',
              nickname: '취업멘토',
              avatar: null,
              isOnline: true
            },
            role: 'admin'
          }
        ]
      },
      'room-2': {
        id: 'room-2',
        name: '프론트엔드 개발자 모임',
        description: 'React, Vue, Angular 등 프론트엔드 기술 토론방',
        type: 'open',
        memberCount: 32,
        isActive: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        members: [
          {
            id: 'member-2',
            user: {
              id: 'user-2',
              nickname: '리액트마스터',
              avatar: null,
              isOnline: false
            },
            role: 'admin'
          }
        ]
      },
      'room-3': {
        id: 'room-3',
        name: '백엔드 아키텍처 스터디',
        description: '마이크로서비스, 클라우드, 데이터베이스 설계 등을 다루는 스터디방',
        type: 'group',
        memberCount: 18,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        members: [
          {
            id: 'member-3',
            user: {
              id: 'user-3',
              nickname: '백엔드구루',
              avatar: null,
              isOnline: true
            },
            role: 'admin'
          }
        ]
      },
      'room-4': {
        id: 'room-4',
        name: '코딩테스트 문제 풀이',
        description: '알고리즘 문제 풀이와 코딩테스트 대비 방',
        type: 'open',
        memberCount: 67,
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        members: [
          {
            id: 'member-4',
            user: {
              id: 'user-4',
              nickname: '알고리즘천재',
              avatar: null,
              isOnline: false
            },
            role: 'admin'
          }
        ]
      }
    }

    // 새로 생성된 채팅방 (temp-로 시작하는 ID)
    if (roomId.startsWith('temp-')) {
      const newRoom = {
        id: roomId,
        name: '새로 생성된 채팅방',
        description: '채팅방에 오신 것을 환영합니다!',
        type: 'open',
        memberCount: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 'member-temp',
            user: {
              id: 'cm5bm25d20000y6o81xgdvgm0',
              nickname: '김개발자',
              avatar: null,
              isOnline: true
            },
            role: 'admin'
          }
        ]
      }
      return NextResponse.json(newRoom)
    }

    const room = sampleRooms[roomId]
    if (!room) {
      return NextResponse.json(
        { error: '채팅방을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)

  } catch (error) {
    console.error('Chat Room Detail API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}