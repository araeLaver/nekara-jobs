'use client'

import { motion } from 'framer-motion'
import { ExternalLink, MapPin, Clock, Briefcase } from 'lucide-react'
import { getCompanyDisplayName } from '@/config/companies'

interface Job {
  id: string
  title: string
  description: string | null // Modified
  location: string | null // Modified
  department: string | null // Modified
  jobType: string | null // Modified
  experience: string | null // Modified
  postedAt: string
  deadline?: string | null
  isActive: boolean
  originalUrl: string
  company: {
    id: string
    name: string
    nameEn: string | null // Modified
    logo?: string | null // Modified
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

  // getCompanyDisplayName은 이제 @/config/companies에서 import

  const handleJobClick = (job: Job) => {
    window.location.href = `/jobs/${job.id}`
  }

  const handleApplyClick = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation()
    
    if (job.originalUrl && job.originalUrl !== '#') {
      const companyDisplayName = getCompanyDisplayName(job.company.name)
      
      if (confirm(`${companyDisplayName} 채용 페이지로 이동하시겠습니까?\n\n"${job.title}" 공고를 확인할 수 있습니다.`)) {
        window.open(job.originalUrl, '_blank')
      }
    } else {
      const fallbackUrls: { [key: string]: string } = {
        naver: 'https://recruit.navercorp.com/',
        kakao: 'https://careers.kakao.com/jobs',
        line: 'https://careers.linecorp.com/ko/jobs',
        coupang: 'https://www.coupang.jobs/',
        baemin: 'https://www.woowahan.com/jobs',
        nexon: 'https://www.saramin.co.kr/zf_user/company-info/view-inner-recruit/csn/eFN2TGwybFErZHBza0Nkb09ld1B6UT09',
        krafton: 'https://krafton.com/kr/careers/',
        carrot: 'https://team.daangn.com/jobs/',
        toss: 'https://toss.im/career',
        zigbang: 'https://careers.zigbang.com/',
        bucketplace: 'https://careers.bucketplace.co.kr/'
      }
      
      const fallbackUrl = fallbackUrls[job.company.name]
      if (fallbackUrl) {
        const companyDisplayName = getCompanyDisplayName(job.company.name)
        if (confirm(`${companyDisplayName} 채용 사이트로 이동하시겠습니까?`)) {
          window.open(fallbackUrl, '_blank')
        }
      } else {
        alert('채용 페이지 정보를 찾을 수 없습니다.')
      }
    }
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
        <div className="text-slate-500 text-6xl mb-4">💼</div>
        <h3 className="text-lg font-medium text-white mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-slate-400">
          다른 검색어나 필터를 시도해보세요
        </p>
      </div>
    )
  }

  return (
    <div>

      {/* 채용공고 카드들 */}
      <div className="space-y-6 mb-6 sm:mb-8">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all duration-500 cursor-pointer group"
            onClick={() => handleJobClick(job)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            {/* 상단: 회사 정보와 날짜 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1">
                  <div className={`company-badge ${job.company.name.toLowerCase()} mb-1 text-sm font-medium px-3 py-1 rounded-full inline-block`}>
                    {getCompanyDisplayName(job.company.name)}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {job.department && `${job.department} • `}{formatDate(job.postedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={(e) => handleApplyClick(e, job)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>지원하기</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            {/* 중간: 제목과 정보 */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors line-clamp-2">
                {job.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{job.location}</span>
                  </div>
                )}
                
                {job.experience && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-pink-400" />
                    <span>{job.experience}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>정규직</span>
                </div>
              </div>
            </div>

            {/* 하단: 태그들 */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-600/30">
                {job.tags.slice(0, 6).map((tag, index) => (
                  <motion.span
                    key={index}
                    className="bg-slate-700/50 text-slate-200 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-purple-600/30 hover:text-purple-200 transition-all duration-300 backdrop-blur-sm border border-slate-600/50"
                    whileHover={{ scale: 1.05, y: -1 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {tag}
                  </motion.span>
                ))}
                {job.tags.length > 6 && (
                  <span className="text-slate-400 text-xs px-3 py-1.5 bg-slate-700/30 rounded-full border border-slate-600/50">
                    +{job.tags.length - 6}개 더
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <motion.div 
          className="flex justify-center items-center space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-slate-600 bg-slate-800/50 backdrop-blur-md text-slate-300 hover:bg-slate-700/70 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            이전
          </motion.button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
            if (page > totalPages) return null
            
            return (
              <motion.button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 rounded-xl border transition-all duration-300 font-medium ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                    : 'border-slate-600 bg-slate-800/50 backdrop-blur-md text-slate-300 hover:bg-slate-700/70 hover:border-purple-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {page}
              </motion.button>
            )
          })}
          
          <motion.button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-600 bg-slate-800/50 backdrop-blur-md text-slate-300 hover:bg-slate-700/70 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            다음
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}