'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nickname: string
}

export default function NewChatRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser] = useState<User>({ id: 'cm5bm25d20000y6o81xgdvgm0', nickname: '김개발자' }) // 임시 사용자
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'open',
    maxMembers: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('채팅방 이름을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          type: formData.type,
          maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
          creatorId: currentUser.id
        })
      })

      if (response.ok) {
        const chatRoom = await response.json()
        alert('채팅방이 생성되었습니다!')
        router.push('/community')
      } else {
        const error = await response.json()
        alert(error.error || '채팅방 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('채팅방 생성 오류:', error)
      alert('채팅방 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 채팅방 만들기</h1>
              <p className="text-gray-600 mt-1">새로운 채팅방을 생성하고 다른 사람들과 소통해보세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* 폼 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 채팅방 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                채팅방 이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="예: 네카라쿠배 신입 채팅방"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 채팅방 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                채팅방 설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="채팅방에 대한 간단한 설명을 입력해주세요"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 채팅방 타입 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                채팅방 타입 *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="open">오픈 채팅방 - 누구나 참여 가능</option>
                <option value="group">그룹 채팅방 - 초대로만 참여 가능</option>
                <option value="private">개인 채팅방 - 1:1 채팅</option>
              </select>
            </div>

            {/* 최대 멤버 수 */}
            {formData.type !== 'private' && (
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                  최대 멤버 수
                </label>
                <input
                  type="number"
                  id="maxMembers"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  placeholder="빈칸으로 두면 무제한"
                  min="2"
                  max="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  빈칸으로 두면 무제한으로 설정됩니다
                </p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '생성 중...' : '채팅방 만들기'}
              </button>
            </div>
          </form>

          {/* 안내 사항 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">채팅방 생성 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 오픈 채팅방: 커뮤니티에서 누구나 검색하고 참여할 수 있습니다</li>
              <li>• 그룹 채팅방: 초대 링크나 관리자 승인으로만 참여 가능합니다</li>
              <li>• 개인 채팅방: 1:1 대화를 위한 채팅방입니다</li>
              <li>• 채팅방 생성 후 언제든지 설정을 변경할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}