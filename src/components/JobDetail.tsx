'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ExternalLink, Building2, Clock, Calendar } from 'lucide-react'

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
      baemin: '배달의민족',
      carrot: '당근',
      nexon: '넥슨',
      krafton: '크래프톤',
      toss: '토스',
      bucketplace: '오늘의집',
      zigbang: '직방'
    }
    return nameMap[companyName] || companyName
  }

  const handleApplyClick = () => {
    const careerUrls: { [key: string]: string } = {
      naver: 'https://recruit.navercorp.com/rcrt/list.do',
      kakao: 'https://careers.kakao.com/jobs',
      line: 'https://careers.linecorp.com/ko',
      coupang: 'https://www.coupang.jobs/kr/',
      baemin: 'https://career.woowahan.com/',
      nexon: 'https://www.jobkorea.co.kr/company/1882711/recruit'
    }

    const careerUrl = job?.originalUrl || careerUrls[job?.company.name || '']
    if (careerUrl) {
      const companyDisplayName = getCompanyDisplayName(job.company.name)
      if (confirm(`${companyDisplayName} 채용 페이지로 이동하여 지원하시겠습니까?`)) {
        window.open(careerUrl, '_blank')
      }
    }
  }

  const handleCompanyClick = () => {
    const companyWebsites: { [key: string]: string } = {
      naver: 'https://www.navercorp.com',
      kakao: 'https://www.kakaocorp.com',
      line: 'https://linecorp.com',
      coupang: 'https://www.coupang.com',
      baemin: 'https://www.woowahan.com',
      nexon: 'https://www.nexon.com'
    }

    const careerUrls: { [key: string]: string } = {
      naver: 'https://recruit.navercorp.com/rcrt/list.do',
      kakao: 'https://careers.kakao.com/jobs',
      line: 'https://careers.linecorp.com/ko',
      coupang: 'https://www.coupang.jobs/kr/',
      baemin: 'https://career.woowahan.com/',
      nexon: 'https://www.jobkorea.co.kr/company/1882711/recruit'
    }

    const website = job?.company.website || companyWebsites[job?.company.name || '']
    if (website) {
      window.open(website, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
              <div className="h-24 bg-slate-800/50 rounded-2xl"></div>
            </div>
            <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-slate-500 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-white mb-2">
            채용공고를 찾을 수 없습니다
          </h3>
          <p className="text-slate-400 mb-4">
            {error || '요청하신 채용공고가 존재하지 않거나 삭제되었습니다.'}
          </p>
          <motion.button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            뒤로 가기
          </motion.button>
        </div>
      </div>
    )
  }

  // Schema Markup for Job Posting
  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    employmentType: job.jobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: getCompanyDisplayName(job.company.name),
      sameAs: job.company.website
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'KR'
      }
    },
    baseSalary: job.salary ? {
      '@type': 'MonetaryAmount',
      currency: 'KRW',
      value: job.salary
    } : undefined,
    qualifications: job.experience,
    workHours: job.jobType,
    url: `https://devlunch.co.kr/jobs/${job.id}`,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Job ID',
      value: job.id
    }
  }

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />

      <motion.div
        className="max-w-4xl mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      {/* 헤더 */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {job.title}
        </motion.h1>
        <motion.div 
          className="flex flex-wrap items-center gap-4 text-slate-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span 
            className={`company-badge ${job.company.name.toLowerCase()} cursor-pointer hover:scale-105 transition-transform`}
            onClick={handleCompanyClick}
          >
            {getCompanyDisplayName(job.company.name)}
          </span>
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              {job.location}
            </span>
          )}
          <span className="bg-slate-700/50 text-slate-200 px-3 py-1 rounded-full text-sm border border-slate-600/50">
            {job.jobType}
          </span>
          <span className="text-sm flex items-center gap-1">
            <Calendar className="w-4 h-4 text-emerald-400" />
            {formatDate(job.postedAt)} 게시
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 직무 설명 */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              직무 설명
            </h2>
            <div className="text-slate-200">
              <div className="prose prose-slate prose-invert max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
                  {job.description}
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <p className="text-slate-300 leading-relaxed">
                  💼 <strong className="text-white">{getCompanyDisplayName(job.company.name)}</strong>에서 <strong className="text-purple-300">{job.title}</strong> 포지션을 담당할 인재를 모집합니다.
                  <br />
                  📋 자세한 직무 내용과 지원 자격은 아래 '지원하기' 버튼을 통해 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 태그 */}
          {job.tags && job.tags.length > 0 && (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">관련 기술/태그</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    className="bg-slate-700/50 text-slate-200 px-3 py-1.5 rounded-full text-sm hover:bg-purple-600/30 hover:text-purple-200 transition-all duration-300 backdrop-blur-sm border border-slate-600/50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 지원하기 카드 */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={handleApplyClick}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 mb-4 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              지원하기
            </motion.button>
            <p className="text-xs text-slate-400 text-center">
              {getCompanyDisplayName(job.company.name)} 채용 사이트로 이동합니다
            </p>
          </motion.div>

          {/* 기본 정보 */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              기본 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">회사명</span>
                <span className="font-medium text-slate-200">{job.company.nameEn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">부서</span>
                <span className="font-medium text-slate-200">{job.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">고용형태</span>
                <span className="font-medium text-slate-200">{job.jobType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">경력</span>
                <span className="font-medium text-slate-200">{job.experience}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">급여</span>
                <span className="font-medium text-slate-200">{job.salary}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">근무지역</span>
                <span className="font-medium text-slate-200">{job.location}</span>
              </div>
            </div>
          </motion.div>

          {/* 회사 정보 */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-pink-400" />
              회사 정보
            </h3>
            <div className="text-center">
              <h4 className="font-medium text-white mb-2">{job.company.nameEn}</h4>
              <p className="text-sm text-slate-300 mb-4">
                {getCompanyDisplayName(job.company.name)}
              </p>
              {job.company.website && (
                <motion.button
                  onClick={handleCompanyClick}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mx-auto transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-3 h-3" />
                  회사 홈페이지 방문
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </motion.div>
    </>
  )
}