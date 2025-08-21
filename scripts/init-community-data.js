const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initCommunityData() {
  console.log('🏗️ 커뮤니티 샘플 데이터 생성 중...')
  
  try {
    // 샘플 사용자 생성
    const users = [
      {
        username: 'developer_kim',
        nickname: '김개발자',
        email: 'kim@example.com',
        avatar: null
      },
      {
        username: 'frontend_lee',
        nickname: '이프론트',
        email: 'lee@example.com',
        avatar: null
      },
      {
        username: 'backend_park',
        nickname: '박백엔드',
        email: 'park@example.com',
        avatar: null
      },
      {
        username: 'fullstack_choi',
        nickname: '최풀스택',
        email: 'choi@example.com',
        avatar: null
      },
      {
        username: 'designer_jung',
        nickname: '정디자이너',
        email: 'jung@example.com',
        avatar: null
      }
    ]
    
    console.log('👤 사용자 생성 중...')
    const createdUsers = []
    
    for (const userData of users) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { username: userData.username }
        })
        
        if (!existingUser) {
          const user = await prisma.user.create({
            data: userData
          })
          createdUsers.push(user)
          console.log(`✅ 사용자 생성: ${user.nickname}`)
        } else {
          createdUsers.push(existingUser)
          console.log(`⚠️  사용자 이미 존재: ${existingUser.nickname}`)
        }
      } catch (error) {
        console.error(`❌ 사용자 생성 실패: ${userData.nickname}`, error.message)
      }
    }
    
    if (createdUsers.length === 0) {
      console.log('❌ 생성된 사용자가 없습니다.')
      return
    }
    
    // 샘플 커뮤니티 게시글 생성
    console.log('\n📝 커뮤니티 게시글 생성 중...')
    
    const samplePosts = [
      {
        title: '네이버 신입 개발자 면접 후기',
        content: '네이버 프론트엔드 개발자 포지션으로 면접을 봤습니다. 1차는 코딩 테스트, 2차는 기술면접, 3차는 임원면접이었어요. 코딩테스트는 알고리즘 2문제와 프론트엔드 실무 문제 1개가 나왔습니다. 기술면접에서는 React, JavaScript, CS 기초를 물어봤고, 임원면접에서는 지원동기와 장래계획을 주로 물어봤네요.',
        category: 'job_discussion',
        tags: ['네이버', '면접후기', '신입', '프론트엔드'],
        authorId: createdUsers[0].id,
        likes: 15,
        views: 234
      },
      {
        title: '카카오 인턴십 지원하신 분 계신가요?',
        content: '카카오 여름 인턴십에 지원했는데, 다른 분들은 어떤 포지션으로 지원하셨나요? 백엔드로 지원했는데 경쟁률이 어느 정도 될지 궁금하네요. 혹시 작년에 참여하신 분이 계시다면 후기도 들려주세요!',
        category: 'job_discussion',
        tags: ['카카오', '인턴십', '백엔드'],
        authorId: createdUsers[1].id,
        likes: 8,
        views: 156
      },
      {
        title: '라인 코딩테스트 문제 유형 정리',
        content: '라인 코딩테스트를 준비하고 있는데, 기출문제를 분석해서 유형을 정리해봤습니다.\n\n1. 알고리즘: BFS/DFS, 동적계획법, 그리디\n2. 자료구조: 스택, 큐, 해시맵\n3. 문자열 처리\n4. 수학/구현\n\n특히 그래프 문제가 자주 나오는 것 같네요. 다들 준비 잘하세요!',
        category: 'career_advice',
        tags: ['라인', '코딩테스트', '알고리즘'],
        authorId: createdUsers[2].id,
        likes: 23,
        views: 387
      },
      {
        title: '쿠팡 다니고 계신 분들, 회사 분위기 어떤가요?',
        content: '쿠팡 최종면접까지 통과해서 입사를 고민 중인데, 실제로 다니고 계신 분들의 솔직한 후기가 궁금합니다. 업무 강도, 복지, 성장 가능성 등에 대해서 알려주세요. 특히 신입 개발자로 입사했을 때 어떤 느낌인지 궁금해요.',
        category: 'company_review',
        tags: ['쿠팡', '회사후기', '신입'],
        authorId: createdUsers[3].id,
        likes: 12,
        views: 298
      },
      {
        title: '개발자 포트폴리오 피드백 부탁드려요!',
        content: '취업준비하면서 포트폴리오를 만들었는데, 피드백을 받고 싶어요. React로 만든 프로젝트 3개와 Node.js 백엔드 프로젝트 2개가 있습니다. 어떤 부분을 더 보완하면 좋을까요? 특히 기술 스택이나 프로젝트 구성에 대한 조언 부탁드립니다.',
        category: 'career_advice',
        tags: ['포트폴리오', 'React', 'Node.js'],
        authorId: createdUsers[4].id,
        likes: 18,
        views: 445
      },
      {
        title: '신입 개발자 연봉 협상 팁',
        content: '신입 개발자도 연봉 협상이 가능할까요? 여러 회사에서 오퍼를 받았는데, 어떻게 협상을 진행해야 할지 막막하네요. 경험 있으신 분들의 조언 부탁드립니다.',
        category: 'career_advice',
        tags: ['신입개발자', '연봉협상', '취업'],
        authorId: createdUsers[0].id,
        likes: 31,
        views: 612
      }
    ]
    
    for (const postData of samplePosts) {
      try {
        const post = await prisma.communityPost.create({
          data: postData
        })
        console.log(`✅ 게시글 생성: ${post.title}`)
      } catch (error) {
        console.error(`❌ 게시글 생성 실패: ${postData.title}`, error.message)
      }
    }
    
    // 샘플 채팅방 생성
    console.log('\n💬 채팅방 생성 중...')
    
    const sampleChatRooms = [
      {
        name: '네카라쿠배 신입 채팅방',
        description: '네이버, 카카오, 라인, 쿠팡, 배달의민족 신입 지원자들의 정보 공유방',
        type: 'open',
        maxMembers: 100,
        creatorId: createdUsers[0].id
      },
      {
        name: '프론트엔드 개발자 모임',
        description: 'React, Vue, Angular 등 프론트엔드 기술 토론방',
        type: 'open',
        maxMembers: 50,
        creatorId: createdUsers[1].id
      },
      {
        name: '백엔드 개발자 스터디',
        description: 'Spring, Node.js, Django 등 백엔드 기술 스터디방',
        type: 'open',
        maxMembers: 50,
        creatorId: createdUsers[2].id
      },
      {
        name: '코딩테스트 준비방',
        description: '알고리즘 문제 풀이 및 코딩테스트 정보 공유',
        type: 'open',
        maxMembers: 200,
        creatorId: createdUsers[3].id
      },
      {
        name: '취업 고민 상담방',
        description: '취업 관련 고민과 조언을 나누는 공간',
        type: 'open',
        maxMembers: null,
        creatorId: createdUsers[4].id
      }
    ]
    
    for (const roomData of sampleChatRooms) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // 채팅방 생성
          const chatRoom = await tx.chatRoom.create({
            data: roomData
          })
          
          // 생성자를 관리자로 멤버에 추가
          await tx.chatRoomMember.create({
            data: {
              userId: roomData.creatorId,
              chatRoomId: chatRoom.id,
              role: 'admin'
            }
          })
          
          // 시스템 메시지 추가
          await tx.message.create({
            data: {
              content: `채팅방이 개설되었습니다. 환영합니다!`,
              type: 'system',
              chatRoomId: chatRoom.id,
              senderId: roomData.creatorId
            }
          })
          
          // 다른 사용자들도 랜덤하게 일부 방에 참여
          if (Math.random() > 0.3) { // 70% 확률로 다른 사용자들 참여
            const otherUsers = createdUsers.filter(u => u.id !== roomData.creatorId)
            const participantCount = Math.floor(Math.random() * 3) + 1 // 1-3명 참여
            
            for (let i = 0; i < Math.min(participantCount, otherUsers.length); i++) {
              await tx.chatRoomMember.create({
                data: {
                  userId: otherUsers[i].id,
                  chatRoomId: chatRoom.id,
                  role: 'member'
                }
              })
            }
          }
          
          return chatRoom
        })
        
        console.log(`✅ 채팅방 생성: ${result.name}`)
      } catch (error) {
        console.error(`❌ 채팅방 생성 실패: ${roomData.name}`, error.message)
      }
    }
    
    // 샘플 댓글 생성
    console.log('\n💬 댓글 생성 중...')
    
    const posts = await prisma.communityPost.findMany({
      take: 3 // 처음 3개 게시글에만 댓글 추가
    })
    
    const sampleComments = [
      {
        content: '정말 유용한 정보 감사합니다! 저도 네이버 지원 예정인데 많은 도움이 되었어요.',
        authorId: createdUsers[1].id,
        postId: posts[0]?.id
      },
      {
        content: '면접 준비할 때 어떤 자료를 참고하셨나요?',
        authorId: createdUsers[2].id,
        postId: posts[0]?.id
      },
      {
        content: '카카오 인턴십 작년에 했었는데, 정말 좋은 경험이었어요. 화이팅!',
        authorId: createdUsers[3].id,
        postId: posts[1]?.id
      }
    ]
    
    for (const commentData of sampleComments) {
      if (commentData.postId) {
        try {
          await prisma.communityComment.create({
            data: commentData
          })
          console.log(`✅ 댓글 생성 완료`)
        } catch (error) {
          console.error(`❌ 댓글 생성 실패:`, error.message)
        }
      }
    }
    
    console.log('\n🎉 커뮤니티 샘플 데이터 생성 완료!')
    
    // 최종 통계
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.communityPost.count(),
      prisma.chatRoom.count(),
      prisma.communityComment.count()
    ])
    
    console.log(`\n📊 생성된 데이터:`)
    console.log(`   사용자: ${stats[0]}명`)
    console.log(`   게시글: ${stats[1]}개`)
    console.log(`   채팅방: ${stats[2]}개`)
    console.log(`   댓글: ${stats[3]}개`)
    
  } catch (error) {
    console.error('❌ 커뮤니티 데이터 생성 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  initCommunityData().catch(console.error)
}

module.exports = { initCommunityData }