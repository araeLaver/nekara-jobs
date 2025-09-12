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
      toss: '토스',
      carrot: '당근마켓',
      krafton: '크래프톤',
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
            {/* 주요 정보 섹션 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">채용공고 개요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">근무지</h3>
                  <p className="text-gray-900">{job.location || '정보 없음'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">고용 형태</h3>
                  <p className="text-gray-900">{job.jobType || '정보 없음'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">경력</h3>
                  <p className="text-gray-900">{job.experience || '경력 무관'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">게시일</h3>
                  <p className="text-gray-900">{formatDate(job.postedAt)}</p>
                </div>
              </div>
            </div>

            {/* 상세 설명 섹션 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">채용공고 상세</h2>
              {job.description ? (
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium mb-2">상세 정보가 없습니다</p>
                  <p className="text-sm">더 자세한 정보는 원본 채용공고를 확인해주세요.</p>
                </div>
              )}
              
              {job.tags && job.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">관련 기술 스택</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 지원하기 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">지원하기</h3>
                <p className="text-sm text-gray-600">공식 채용 사이트에서 지원하세요</p>
              </div>
              
              <button
                onClick={() => window.open(job.originalUrl, '_blank')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>🚀</span>
                <span>{getCompanyDisplayName(job.company.name)} 지원하러 가기</span>
              </button>
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
                <div>
                  <dt className="text-sm font-medium text-gray-500">게시일</dt>
                  <dd className="text-sm text-gray-900">{formatDate(job.postedAt)}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}