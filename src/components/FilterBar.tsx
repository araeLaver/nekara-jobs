'use client'

import { useState } from 'react'

interface FilterBarProps {
  filters: {
    company: string
    location: string
    jobType: string
    search: string
  }
  onFilterChange: (filters: any) => void
  companies: Array<{ company: string; count: number }>
}

export default function FilterBar({ filters, onFilterChange, companies }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleInputChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { company: '', location: '', jobType: '', search: '' }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const jobTypes = ['정규직', '계약직', '인턴', '신입', '경력']
  const locations = ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '제주']

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {/* 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            검색
          </label>
          <input
            type="text"
            placeholder="직무, 회사, 키워드 검색"
            value={localFilters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* 회사 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            회사
          </label>
          <select
            value={localFilters.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 회사</option>
            {companies.map((company) => (
              <option key={company.company} value={company.company}>
                {company.company} ({company.count}개)
              </option>
            ))}
          </select>
        </div>

        {/* 지역 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지역
          </label>
          <select
            value={localFilters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 지역</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* 고용형태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            고용형태
          </label>
          <select
            value={localFilters.jobType}
            onChange={(e) => handleInputChange('jobType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 형태</option>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 회사 필터 버튼들 */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        <span className="text-xs sm:text-sm font-medium text-gray-700">빠른 필터:</span>
        {['naver', 'kakao', 'line', 'coupang', 'baemin'].map((company) => (
          <button
            key={company}
            onClick={() => handleInputChange('company', localFilters.company === company ? '' : company)}
            className={`company-badge ${company} ${
              localFilters.company === company ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {company.charAt(0).toUpperCase() + company.slice(1)}
          </button>
        ))}
      </div>

      {/* 필터 초기화 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {Object.values(localFilters).some(v => v) && (
            <span>활성 필터: {Object.values(localFilters).filter(v => v).length}개</span>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          필터 초기화
        </button>
      </div>
    </div>
  )
}