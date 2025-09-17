'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'

interface FilterBarProps {
  filters: {
    company: string
    location: string
    jobType: string
    search: string
    department: string
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
    const clearedFilters = { company: '', location: '', jobType: '', search: '', department: '' }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const jobTypes = ['정규직', '계약직', '인턴', '신입', '경력']
  const locations = ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '제주']
  const departments = ['개발', '프론트엔드', '백엔드', '풀스택', 'iOS', 'Android', '데이터', 'AI/ML', '인프라/DevOps', 'QA', '보안', '게임', '블록체인']

  return (
    <motion.div 
      className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-4 sm:p-6 mb-6 sm:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
        {/* 검색 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            검색
          </label>
          <input
            type="text"
            placeholder="직무, 회사, 키워드 검색"
            value={localFilters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base text-white placeholder-slate-400 transition-all duration-300"
          />
        </div>

        {/* 회사 선택 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            회사
          </label>
          <select
            value={localFilters.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
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
          <label className="block text-sm font-medium text-slate-300 mb-2">
            지역
          </label>
          <select
            value={localFilters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">전체 지역</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* 직무 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            직무
          </label>
          <select
            value={localFilters.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">전체 직무</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 고용형태 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            고용형태
          </label>
          <select
            value={localFilters.jobType}
            onChange={(e) => handleInputChange('jobType', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
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

      {/* 회사 필터 버튼들 - 숨김 */}
      <div className="hidden flex flex-wrap gap-2 sm:gap-3 mb-4">
        <span className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          빠른 필터:
        </span>
        {['naver', 'kakao', 'line', 'coupang', 'baemin', 'carrot', 'nexon', 'krafton', 'toss', 'bucketplace', 'zigbang'].map((company, index) => {
          const companyNames: { [key: string]: string } = {
            naver: '네이버',
            kakao: '카카오',
            line: '라인',
            coupang: '쿠팡',
            baemin: '배민',
            carrot: '당근',
            nexon: '넥슨',
            krafton: '크래프톤',
            toss: '토스',
            bucketplace: '오늘의집',
            zigbang: '직방'
          }
          
          return (
            <motion.button
              key={company}
              onClick={() => handleInputChange('company', localFilters.company === company ? '' : company)}
              className={`company-badge ${company} ${
                localFilters.company === company ? 'ring-2 ring-purple-500 bg-purple-600/20' : ''
              } hover:scale-105 transition-all duration-300`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {companyNames[company] || company}
            </motion.button>
          )
        })}
      </div>

      {/* 필터 초기화 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-400">
          {Object.values(localFilters).some(v => v) && (
            <span>활성 필터: {Object.values(localFilters).filter(v => v).length}개</span>
          )}
        </div>
        <motion.button
          onClick={clearFilters}
          className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-4 h-4" />
          필터 초기화
        </motion.button>
      </div>
    </motion.div>
  )
}