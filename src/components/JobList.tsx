'use client'

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
  isActive: boolean
  originalUrl: string
  company: {
    id: string
    name: string
    nameEn: string
    logo?: string
  }
  tags: string[]
}

interface JobListProps {
  jobs: Job[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function JobList({ jobs, loading, currentPage, totalPages, onPageChange }: JobListProps) {
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

  const formatDeadline = (deadlineString?: string) => {
    if (!deadlineString) return null
    
    const deadline = new Date(deadlineString)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return 'D-Day'
    if (diffDays <= 7) return `D-${diffDays}`
    return deadline.toLocaleDateString('ko-KR')
  }

  const getDeadlineColor = (deadlineString?: string) => {
    if (!deadlineString) return 'text-gray-500'
    
    const deadline = new Date(deadlineString)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-gray-400'
    if (diffDays <= 3) return 'text-red-600'
    if (diffDays <= 7) return 'text-orange-600'
    return 'text-green-600'
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

  const handleJobClick = (job: Job) => {
    // 내 사이트 상세페이지로 이동
    window.location.href = `/jobs/${job.id}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="job-card animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💼</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-gray-500">
          다른 검색어나 필터를 시도해보세요
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* 결과 개수 */}
      <div className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{jobs.length}</span>개의 채용공고
        </p>
      </div>

      {/* 채용공고 카드들 */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="job-card"
            onClick={() => handleJobClick(job)}
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="responsive-subtitle font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                    {job.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span className={`company-badge ${job.company.name.toLowerCase()}`}>
                    {getCompanyDisplayName(job.company.name)}
                  </span>
                  {job.department && (
                    <span className="flex items-center hidden-mobile">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate">{job.department}</span>
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                  )}
                  {job.experience && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {job.experience}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">
                  {formatDate(job.postedAt)}
                </p>
                {job.deadline && (
                  <p className={`text-sm font-medium mb-1 ${getDeadlineColor(job.deadline)}`}>
                    {formatDeadline(job.deadline)}
                  </p>
                )}
                <svg className="w-5 h-5 text-gray-400 mt-1 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>

            {job.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>
            )}

            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
            if (page > totalPages) return null
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-lg border ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}