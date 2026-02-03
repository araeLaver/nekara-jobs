'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import JobList from '@/components/JobList'
import FilterBar from '@/components/FilterBar'
import CompanyTabs from '@/components/CompanyTabs'
import HeroSection from './HeroSection'

// Types need to be defined here as well for props
interface Job {
  id: string;
  title: string;
  description: string | null; // Added
  location: string | null;
  department: string | null;
  jobType: string | null;
  experience: string | null;
  postedAt: string;
  deadline?: string | null;
  isActive: boolean; // Added
  originalUrl: string;
  company: {
    id: string;
    name: string;
    nameEn: string | null;
    logo?: string | null;
  };
  tags: string[];
}

interface Stats {
  totalJobs: number;
  jobsByCompany: Array<{ company: string; count: number }>;
}

interface JobSearchContainerProps {
  initialJobs: Job[];
  initialTotalPages: number;
  initialStats: Stats;
}

export default function JobSearchContainer({ initialJobs, initialTotalPages, initialStats }: JobSearchContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [stats] = useState<Stats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // Added error state

  // URL에서 필터 초기값 가져오기
  const [filters, setFilters] = useState({
    company: searchParams.get('company') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || ''
  })

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(initialTotalPages)

  // Effect for handling filter changes
  useEffect(() => {
    const isInitialState = currentPage === 1 && !filters.company && !filters.location && !filters.jobType && !filters.search && !filters.department;
    
    if (!isInitialState) {
       const timer = setTimeout(() => {
        fetchJobs(1, filters);
      }, 300); // Debounce filter changes
      return () => clearTimeout(timer);
    }
  }, [filters])

  // URL 업데이트 함수
  const updateURL = useCallback((newFilters: typeof filters, page: number = 1) => {
    const params = new URLSearchParams()

    // 비어있지 않은 필터만 URL에 추가
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    if (page > 1) {
      params.set('page', page.toString())
    }

    const newURL = params.toString() ? `/?${params.toString()}` : '/'
    router.push(newURL, { scroll: false })
  }, [router])

  const fetchJobs = useCallback(async (page: number, currentFilters: typeof filters) => {
    try {
      setLoading(true)
      setError(null) // Reset error on new fetch
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v))
      })

      const response = await fetch(`/api/jobs?${queryParams}`)
      
      if (response.status === 429) {
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.')
      }
      
      if (!response.ok) {
        throw new Error('데이터를 불러오는 중 오류가 발생했습니다.')
      }
      
      const data = await response.json()
      setJobs(data.jobs || [])
      setTotalPages(data.pagination?.pages || 1)
      setCurrentPage(page)
    } catch (error: any) {
      console.error('채용공고 조회 실패:', error)
      setError(error.message || '오류가 발생했습니다.')
      setJobs([]) // Clear jobs on error to avoid stale data display
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setCurrentPage(1)
    setFilters(newFilters)
    updateURL(newFilters, 1)
    fetchJobs(1, newFilters)
  }, [updateURL, fetchJobs])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    updateURL(filters, page)
    fetchJobs(page, filters)
  }, [filters, updateURL, fetchJobs])

  const handleCompanyChange = useCallback((company: string) => {
    const newFilters = { ...filters, company }
    setFilters(newFilters)
    setCurrentPage(1)
    updateURL(newFilters, 1)
    fetchJobs(1, newFilters)
  }, [filters, updateURL, fetchJobs])

  const handleHeroSearch = useCallback((query: string) => {
    const newFilters = {
      company: '',
      location: '',
      jobType: '',
      search: query,
      department: ''
    }
    setFilters(newFilters)
    setCurrentPage(1)
    updateURL(newFilters, 1)
    fetchJobs(1, newFilters)
  }, [updateURL, fetchJobs])

  return (
    <>
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

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <p className="font-semibold">오류 발생</p>
            <p>{error}</p>
          </div>
        )}

        {/* 채용공고 리스트 */}
        <JobList
          jobs={jobs}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </>
  )
}
