'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  description: string
  location: string
  department: string
  jobType: string
  experience: string
  postedAt: string
  deadline?: string
  originalUrl: string
  isActive: boolean
  company: {
    id: string
    name: string
    nameEn: string
    logo?: string
  }
  tags: string[]
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchJobDetail(params.id as string)
    }
  }, [params.id])

  const fetchJobDetail = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      
      if (!response.ok) {
        throw new Error('채용공고를 찾을 수 없습니다')
      }
      
      const jobData = await response.json()
      setJob(jobData)
    } catch (error) {
      console.error('Error fetching job detail:', error)
      setError(error instanceof Error ? error.message : '채용공고를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const getCompanyDisplayName = (companyName: string) => {
    const nameMap: { [key: string]: string } = {
      naver: '네이버',
      kakao: '카카오',
      line: '라인',
      coupang: '쿠팡',
      baemin: '배달의민족'
    }
    return nameMap[companyName] || companyName
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">채용공고를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || '채용공고를 찾을 수 없습니다'}
          </h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`company-badge ${job.company.name.toLowerCase()} text-sm`}>
                  {getCompanyDisplayName(job.company.name)}
                </span>
                {job.department && (
                  <span className="text-sm text-gray-500">
                    {job.department}
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {job.location && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                )}
                {job.experience && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                    </svg>
                    {job.experience}
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2m-6 0h4" />
                  </svg>
                  {formatDate(job.postedAt)} 게시
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 채용공고 상세 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">채용공고 상세</h2>
              {job.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              )}
              
              {job.tags && job.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">관련 기술</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 지원하기 & 회사 정보 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={() => window.open(job.originalUrl, '_blank')}
                className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-4"
              >
                원본 채용공고 보기
              </button>
              
              <div className="text-xs text-gray-500 text-center">
                실제 지원은 해당 회사 채용 사이트에서 가능합니다
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">채용 정보</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">회사</dt>
                  <dd className="text-sm text-gray-900">{getCompanyDisplayName(job.company.name)}</dd>
                </div>
                {job.department && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">부서</dt>
                    <dd className="text-sm text-gray-900">{job.department}</dd>
                  </div>
                )}
                {job.jobType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">고용 형태</dt>
                    <dd className="text-sm text-gray-900">{job.jobType}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">게시일</dt>
                  <dd className="text-sm text-gray-900">{formatDate(job.postedAt)}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 지원 안내 */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">지원 방법</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getCompanyDisplayName(job.company.name)} 공식 채용 사이트에서 지원하세요
            </h3>
            <p className="text-gray-600 mb-6">
              정확한 정보와 최신 공고는 해당 회사의 공식 채용 페이지에서 확인할 수 있습니다.
            </p>
            <a
              href={job.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {getCompanyDisplayName(job.company.name)} 채용 사이트 방문
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}