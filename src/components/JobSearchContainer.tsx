'use client'

import { useState, useEffect } from 'react'
import JobList from '@/components/JobList'
import FilterBar from '@/components/FilterBar'
import CompanyTabs from '@/components/CompanyTabs'
import HeroSection from './HeroSection'

// Types need to be defined here as well for props
interface Job {
  id: string;
  title: string;
  location: string;
  department: string;
  jobType: string;
  experience: string;
  postedAt: string;
  deadline?: string | null;
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
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [stats] = useState<Stats>(initialStats)
  const [loading, setLoading] = useState(false) // Initial load is done by server
  const [filters, setFilters] = useState({
    company: '',
    location: '',
    jobType: '',
    search: '',
    department: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)

  const fetchJobs = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v))
      })

      const response = await fetch(`/api/jobs?${queryParams}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
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

  const handleFilterChange = (newFilters: typeof filters) => {
    setCurrentPage(1)
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchJobs(page)
  }
  
  const handleCompanyChange = (company: string) => {
    const newFilters = { ...filters, company };
    setFilters(newFilters);
    setCurrentPage(1);
  }

  const handleHeroSearch = (query: string) => {
    setFilters({
      company: '',
      location: '',
      jobType: '',
      search: query,
      department: ''
    })
    setCurrentPage(1)
  }

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
