'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import JobList from '@/components/JobList'
import FilterBar from '@/components/FilterBar'
import StatsCard from '@/components/StatsCard'
import HeroSection from '@/components/HeroSection'
import CompanyTabs from '@/components/CompanyTabs'

interface Job {
  id: string
  title: string
  description: string
  location: string
  department: string
  jobType: string
  postedAt: string
  deadline?: string
  originalUrl: string
  company: {
    id: string
    name: string
    logo?: string
  }
  tags: string[]
}

interface Stats {
  totalJobs: number
  totalCompanies: number
  recentJobs: number
  jobsByCompany: Array<{ company: string; count: number }>
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    company: '',
    location: '',
    jobType: '',
    search: '',
    department: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })

      console.log('API 요청:', `/api/jobs?${queryParams}`)
      const response = await fetch(`/api/jobs?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API 응답:', data)
      
      setJobs(data.jobs || [])
      setTotalPages(data.pagination?.pages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error('채용공고 조회 실패:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('통계 API 요청')
      const response = await fetch('/api/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('통계 API 응답:', data)
      setStats(data)
    } catch (error) {
      console.error('통계 조회 실패:', error)
      setStats({
        totalJobs: 0,
        totalCompanies: 0,
        recentJobs: 0,
        jobsByCompany: []
      })
    }
  }

  useEffect(() => {
    console.log('컴포넌트 마운트됨 - API 호출 시작')
    fetchStats()
    fetchJobs(1)
  }, [])

  useEffect(() => {
    console.log('필터 변경됨:', filters)
    fetchJobs(1)
  }, [filters.company, filters.location, filters.jobType, filters.search])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    fetchJobs(page)
  }

  const handleHeroSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
    setCurrentPage(1)
  }

  const handleCompanyChange = (company: string) => {
    setFilters(prev => ({ ...prev, company }))
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      {/* 히어로 섹션 */}
      <HeroSection 
        onSearch={handleHeroSearch}
        totalJobs={stats?.totalJobs || 0}
      />

      {/* 회사별 탭 */}
      <CompanyTabs 
        activeCompany={filters.company}
        onCompanyChange={handleCompanyChange}
        companyStats={stats?.jobsByCompany || []}
      />
      
      <main className="max-w-7xl mx-auto container-mobile sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* 필터 바 */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          companies={stats?.jobsByCompany || []}
        />

        {/* 채용공고 리스트 */}
        <JobList
          jobs={jobs}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  )
}