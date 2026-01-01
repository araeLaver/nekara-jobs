'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { User, CommunityPost, CommunityComment } from '@prisma/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // Import TanStack Query hooks

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
  const { id: postId } = params as { id: string } // Ensure postId is string
  const { currentUser } = useAuth()
  const queryClient = useQueryClient() // Get QueryClient instance

  const [comment, setComment] = useState('')
  
  // Fetch post details using useQuery
  const { data: post, isLoading, isError } = useQuery<PostWithDetails>({
    queryKey: ['communityPost', postId],
    queryFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }
      const data = await response.json()
      return data.post
    },
    enabled: !!postId, // Only run query if postId is available
  })

  // Prepare initial like state based on fetched post
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (post) {
      setLikeCount(post.likedBy.length)
      if (currentUser) {
        setIsLiked(post.likedBy.some((like: PostLikeInfo) => like.userId === currentUser.id))
      }
    }
  }, [post, currentUser])

  // Mutation for adding a comment
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, authorId }: { content: string; authorId: string }) => {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorId }),
      })
      if (!response.ok) {
        throw new Error('Failed to add comment')
      }
      return response.json()
    },
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['communityPost', postId] }) // Invalidate to refetch post with new comment
    },
    onError: () => {
      alert('댓글 작성에 실패했습니다.')
    },
  })

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !currentUser || addCommentMutation.isPending) return

    addCommentMutation.mutate({ content: comment, authorId: currentUser.id })
  }

  // Mutation for liking/unliking a post with optimistic update
  const likeMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }
      return response.json()
    },
    onMutate: async () => {
      // Optimistically update the UI
      const previousPost = queryClient.getQueryData<PostWithDetails>(['communityPost', postId])
      if (previousPost) {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({ queryKey: ['communityPost', postId] })

        // Snapshot the previous value
        const snapshot = previousPost

        // Optimistically update to the new value
        const newLikedBy = isLiked
          ? previousPost.likedBy.filter(like => like.userId !== currentUser?.id)
          : [...previousPost.likedBy, { userId: currentUser!.id }]
        
        queryClient.setQueryData<PostWithDetails>(['communityPost', postId], {
          ...previousPost,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
        })
        setLikeCount(newLikedBy.length)
        setIsLiked(!isLiked)

        return { snapshot }
      }
      return { snapshot: undefined }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context for a rollback
      alert('좋아요 처리 중 오류가 발생했습니다.')
      if (context?.snapshot) {
        queryClient.setQueryData<PostWithDetails>(['communityPost', postId], context.snapshot)
        setLikeCount(context.snapshot.likedBy.length)
        setIsLiked(context.snapshot.likedBy.some(like => like.userId === currentUser?.id))
      }
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ['communityPost', postId] })
    },
  })

  const handleLike = () => {
    if (!currentUser) {
      alert('좋아요를 누르려면 로그인이 필요합니다.')
      return
    }
    likeMutation.mutate({ userId: currentUser.id })
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ko-KR')
  const getCategoryName = (category: string) => ({
    general: '자유게시판',
    job_discussion: '채용토론',
    company_review: '회사리뷰',
    career_advice: '커리어조언'
  }[category] || category)

  if (isLoading || likeMutation.isPending) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">게시글을 불러오는 중...</div>
  }

  if (isError || !post) {
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
            <p className="text-sm text-gray-500">{formatDate(post.createdAt.toISOString())}</p>
            <p className="text-sm text-gray-500">조회수: {post.views}</p>
          </div>
          <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
          <div className="p-6 border-t flex justify-center mt-6">
            <button 
              onClick={handleLike}
              disabled={likeMutation.isPending}
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
                disabled={addCommentMutation.isPending}
              />
              <button type="submit" disabled={addCommentMutation.isPending || !comment.trim()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">
                {addCommentMutation.isPending ? '등록 중...' : '댓글 등록'}
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
                <p className="text-sm text-gray-500">{formatDate(c.createdAt.toISOString())}</p>
                <p className="mt-2">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}