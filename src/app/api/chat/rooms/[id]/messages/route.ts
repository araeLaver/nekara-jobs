import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!roomId) {
      return NextResponse.json(
        { error: '채팅방 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // 임시로 샘플 메시지 반환
    const sampleMessages = [
      {
        id: 'msg-1',
        content: '안녕하세요! 채팅방에 오신 것을 환영합니다 👋',
        type: 'text',
        chatRoomId: roomId,
        senderId: 'user-1',
        createdAt: new Date(Date.now() - 60000).toISOString(),
        sender: {
          id: 'user-1',
          nickname: '방장',
          avatar: null
        }
      },
      {
        id: 'msg-2',
        content: '자유롭게 대화해주세요!',
        type: 'text',
        chatRoomId: roomId,
        senderId: 'user-1',
        createdAt: new Date(Date.now() - 30000).toISOString(),
        sender: {
          id: 'user-1',
          nickname: '방장',
          avatar: null
        }
      }
    ]

    return NextResponse.json({
      messages: sampleMessages,
      pagination: {
        current: page,
        total: sampleMessages.length,
        pages: 1,
        limit
      }
    })

  } catch (error) {
    console.error('Messages API Error:', error)
    return NextResponse.json(
      { error: '메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id
    const body = await request.json()
    const { content, senderId, type = 'text' } = body

    if (!roomId || !content || !senderId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 임시로 메시지 생성 응답
    const message = {
      id: 'msg-' + Date.now(),
      content,
      type,
      chatRoomId: roomId,
      senderId,
      createdAt: new Date().toISOString(),
      sender: {
        id: senderId,
        nickname: senderId === 'cm5bm25d20000y6o81xgdvgm0' ? '김개발자' : '사용자',
        avatar: null
      }
    }

    return NextResponse.json(message, { status: 201 })

  } catch (error) {
    console.error('Send Message API Error:', error)
    return NextResponse.json(
      { error: '메시지 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}