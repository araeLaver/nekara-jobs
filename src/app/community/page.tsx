'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CommunityPost {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  likes: number
  views: number
  createdAt: string
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  _count: {
    comments: number
  }
}

interface ChatRoom {
  id: string
  name: string
  description?: string
  type: string
  memberCount: number
  isActive: boolean
  createdAt: string
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts')

  useEffect(() => {
    fetchPosts()
    fetchChatRooms()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/community/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms')
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data.rooms || [])
      }
    } catch (error) {
      console.error('채팅방 조회 실패:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '오늘'
    if (diffDays === 2) return '어제'
    if (diffDays <= 7) return `${diffDays - 1}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      general: '자유게시판',
      job_discussion: '채용토론',
      company_review: '회사리뷰',
      career_advice: '커리어조언'
    }
    return categoryMap[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      general: 'bg-gray-100 text-gray-800',
      job_discussion: 'bg-blue-100 text-blue-800',
      company_review: 'bg-green-100 text-green-800',
      career_advice: 'bg-purple-100 text-purple-800'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">커뮤니티를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
              <p className="text-gray-600 mt-2">네카라쿠배 취업준비생들의 소통 공간</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                채용공고 보기
              </Link>
              <Link
                href="/community/posts/new"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                새 글 작성
              </Link>
              <Link
                href="/chat/rooms/new"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                채팅방 만들기
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            게시판
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            채팅방
          </button>
        </div>

        {/* 게시판 탭 */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">최근 게시글</h2>
              </div>
              
              {posts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 게시글이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    첫 번째 게시글을 작성해보세요!
                  </p>
                  <Link
                    href="/community/posts/new"
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    글 작성하기
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/posts/${post.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                              {getCategoryName(post.category)}
                            </span>
                            {post.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>by {post.author.nickname}</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <span>👍 {post.likes}</span>
                            <span>💬 {post._count.comments}</span>
                            <span>👀 {post.views}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 채팅방 탭 */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">활성 채팅방</h2>
              </div>
              
              {chatRooms.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 채팅방이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    첫 번째 채팅방을 만들어보세요!
                  </p>
                  <Link
                    href="/chat/rooms/new"
                    className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    채팅방 만들기
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {chatRooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/chat/rooms/${room.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {room.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              room.type === 'open' 
                                ? 'bg-green-100 text-green-800'
                                : room.type === 'private'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {room.type === 'open' ? '오픈채팅' : room.type === 'private' ? '개인채팅' : '그룹채팅'}
                            </span>
                          </div>
                          
                          {room.description && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                              {room.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>👥 {room.memberCount}명</span>
                            <span>{formatDate(room.createdAt)} 개설</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}