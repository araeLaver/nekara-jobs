'use client'

import { useState, useEffect } from 'react'

interface Job {
  id: string
  title: string
  description: string
  location: string
  department: string
  jobType: string
  experience: string
  salary: string
  postedAt: string
  originalUrl: string
  company: {
    id: string
    name: string
    nameEn: string
    logo?: string
    website?: string
  }
  tags: string[]
}

interface JobDetailProps {
  jobId: string
}

export default function JobDetail({ jobId }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          throw new Error('채용공고를 찾을 수 없습니다.')
        }
        const data = await response.json()
        setJob(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const handleApplyClick = () => {
    if (job?.originalUrl) {
      const companyDisplayName = getCompanyDisplayName(job.company.name)
      if (confirm(`${companyDisplayName} 채용 페이지로 이동하여 지원하시겠습니까?`)) {
        window.open(job.originalUrl, '_blank')
      }
    }
  }

  const handleCompanyClick = () => {
    if (job?.company.website) {
      window.open(job.company.website, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            채용공고를 찾을 수 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            {error || '요청하신 채용공고가 존재하지 않거나 삭제되었습니다.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          <span 
            className={`company-badge ${job.company.name.toLowerCase()} cursor-pointer`}
            onClick={handleCompanyClick}
          >
            {getCompanyDisplayName(job.company.name)}
          </span>
          {job.location && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
          )}
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
            {job.jobType}
          </span>
          <span className="text-sm">
            {formatDate(job.postedAt)} 게시
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 직무 설명 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">직무 설명</h2>
            <div className="text-gray-700">
              <p className="mb-4">{job.description}</p>
              <p className="text-gray-600">
                {getCompanyDisplayName(job.company.name)}에서 {job.title} 포지션을 담당할 인재를 모집합니다.
                자세한 직무 내용과 지원 자격은 아래 '지원하기' 버튼을 통해 확인하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 태그 */}
          {job.tags && job.tags.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">관련 기술/태그</h2>
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

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 지원하기 카드 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <button
              onClick={handleApplyClick}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors mb-4"
            >
              지원하기
            </button>
            <p className="text-xs text-gray-500 text-center">
              {getCompanyDisplayName(job.company.name)} 채용 사이트로 이동합니다
            </p>
          </div>

          {/* 기본 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">회사명</span>
                <span className="font-medium">{job.company.nameEn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">부서</span>
                <span className="font-medium">{job.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">고용형태</span>
                <span className="font-medium">{job.jobType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">경력</span>
                <span className="font-medium">{job.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">급여</span>
                <span className="font-medium">{job.salary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">근무지역</span>
                <span className="font-medium">{job.location}</span>
              </div>
            </div>
          </div>

          {/* 회사 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">회사 정보</h3>
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">{job.company.nameEn}</h4>
              <p className="text-sm text-gray-600 mb-4">
                {getCompanyDisplayName(job.company.name)}
              </p>
              {job.company.website && (
                <button
                  onClick={handleCompanyClick}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  회사 홈페이지 방문
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}