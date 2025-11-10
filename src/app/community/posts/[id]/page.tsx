'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { User, CommunityPost, CommunityComment } from '@prisma/client'

// Define more specific types for the page
type CommentWithAuthor = CommunityComment & { author: User }
type PostLikeInfo = { userId: string }
type PostWithDetails = CommunityPost & {
  author: User
  comments: CommentWithAuthor[]
  likedBy: PostLikeInfo[]
}

export default function PostDetailPage() {
  const params = useParams()
  const { id: postId } = params
  const { currentUser, loading: authLoading } = useAuth()

  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  
  // Like state
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const fetchPost = async () => {
    if (!postId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/community/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setLikeCount(data.post.likes)
        if (currentUser) {
          setIsLiked(data.post.likedBy.some((like: PostLikeInfo) => like.userId === currentUser.id))
        }
      } else {
        setPost(null)
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [postId, currentUser]) // Re-fetch if user logs in/out

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !currentUser) return

    setCommentLoading(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, authorId: currentUser.id }),
      })
      if (response.ok) {
        setComment('')
        fetchPost()
      } else {
        alert('댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleLike = async () => {
    if (!currentUser) {
      alert('좋아요를 누르려면 로그인이 필요합니다.')
      return
    }
    if (likeLoading) return

    setLikeLoading(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likes)
        setIsLiked(data.liked)
      }
    } catch (error) {
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setLikeLoading(false)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ko-KR')
  const getCategoryName = (category: string) => ({
    general: '자유게시판',
    job_discussion: '채용토론',
    company_review: '회사리뷰',
    career_advice: '커리어조언'
  }[category] || category)

  if (loading || authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">게시글을 불러오는 중...</div>
  }

  if (!post) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="border-b pb-4 mb-4">
            <p>작성자: {post.author.nickname}</p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            <p className="text-sm text-gray-500">조회수: {post.views}</p>
          </div>
          <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
          <div className="p-6 border-t flex justify-center mt-6">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className={`px-6 py-2 border rounded-full flex items-center gap-2 transition-colors ${
                isLiked 
                ? 'bg-red-500 text-white border-red-500' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>좋아요 {likeCount}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mt-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">댓글 ({post.comments.length})</h3>
          
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="w-full p-2 border rounded-lg"
                rows={3}
                disabled={commentLoading}
              />
              <button type="submit" disabled={commentLoading || !comment.trim()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">
                {commentLoading ? '등록 중...' : '댓글 등록'}
              </button>
            </form>
          ) : (
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <p>댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link href="/login" className="text-blue-500 hover:underline">로그인하기</Link>
            </div>
          )}

          <div className="space-y-4">
            {post.comments.map((c) => (
              <div key={c.id} className="border-t pt-4">
                <p className="font-semibold">{c.author.nickname}</p>
                <p className="text-sm text-gray-500">{formatDate(c.createdAt)}</p>
                <p className="mt-2">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}