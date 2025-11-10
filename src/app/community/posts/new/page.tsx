'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function NewPostPage() {
  const router = useRouter()
  const { currentUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: tagsArray,
          authorId: currentUser.id
        })
      })

      if (response.ok) {
        alert('게시글이 작성되었습니다!')
        router.push('/community')
      } else {
        const error = await response.json()
        alert(error.error || '게시글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      alert('게시글 작성 중 오류가 발생했습니다.')
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

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">게시글을 작성하려면 먼저 로그인해주세요.</p>
          <Link href="/login" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is in layout */}
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
              <h1 className="text-2xl font-bold text-gray-900">새 게시글 작성</h1>
              <p className="text-gray-600 mt-1">커뮤니티에 새로운 글을 작성해보세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (form fields remain the same) ... */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="general">일반</option>
                <option value="job_discussion">취업 토론</option>
                <option value="company_review">회사 리뷰</option>
                <option value="career_advice">커리어 조언</option>
              </select>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="게시글 제목을 입력해주세요" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
              <textarea id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="게시글 내용을 입력해주세요" rows={12} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">태그</label>
              <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="태그를 쉼표로 구분하여 입력해주세요 (예: 네이버, 신입, 면접)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" disabled={loading}>
                취소
              </button>
              <button type="submit" disabled={loading || !formData.title.trim() || !formData.content.trim()} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                {loading ? '작성 중...' : '게시글 작성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
