import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { handleApiError, ValidationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nickname } = body

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      throw new ValidationError('닉네임을 입력해주세요.')
    }

    if (nickname.length > 20) {
      throw new ValidationError('닉네임은 20자를 초과할 수 없습니다.')
    }

    // 닉네임으로 사용자 조회 또는 생성 (임시 익명 로그인 로직)
    // 실제 서비스에서는 이메일/비밀번호 또는 소셜 로그인을 사용해야 함
    
    // username은 유니크해야 하므로 난수 추가
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const username = `user_${Date.now()}_${randomSuffix}`

    // 기존에 같은 닉네임을 가진 사용자가 있는지 확인하는 로직은 생략 (익명 로그인이므로 매번 새로 생성하거나, 닉네임 중복 허용 정책에 따름)
    // 여기서는 간단히 "닉네임 기반 계정 생성"으로 처리하되, 
    // 실제로는 "동일 닉네임 재로그인"이 불가능하므로 매번 새로운 유저가 생성됨.
    // 이를 방지하려면 클라이언트가 'deviceId' 같은 것을 보내거나 해야 하지만, 
    // 현재 요구사항상 '익명 게시판' 성격이 강하므로 매번 생성으로 둠.
    
    // 단, 너무 많은 유저 생성을 막기 위해 IP 기반 Rate Limit가 필요하지만 상위 미들웨어에서 처리됨.

    const user = await prisma.user.create({
      data: {
        nickname: nickname,
        username: username,
        isOnline: true
      }
    })

    // 보안 토큰 발급
    const token = signToken(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar
      },
      token: token
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error)
  }
}
