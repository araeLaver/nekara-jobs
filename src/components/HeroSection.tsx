'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, Zap, Users } from 'lucide-react'

interface HeroSectionProps {
  onSearch: (query: string) => void
  totalJobs: number
}

export default function HeroSection({ onSearch, totalJobs }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 lg:py-8 overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* 메인 타이틀 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* <Sparkles className="w-6 h-6 text-purple-400" /> */}
              {/* <span className="text-purple-400 text-sm font-medium">개발자를 위한</span> */}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                DevLunch
              </span>
              <br />
              <span className="text-lg sm:text-xl lg:text-2xl text-slate-200 font-light">
                채용의 새로운 경험
              </span>
            </h1>
          </motion.div>
          
          {/* 서브 타이틀 */}
          <motion.p 
            className="text-sm sm:text-base text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            네이버, 카카오, 라인, 쿠팡, 배달의민족 등 
            <span className="text-purple-400 font-semibold"> 대기업 개발자 채용공고</span>를 
            한눈에 확인하고 당신의 커리어를 시작하세요
          </motion.p>

          {/* 검색창 */}
          <motion.form 
            onSubmit={handleSearch} 
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="프론트엔드, 백엔드, AI, DevOps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 text-base bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
              <motion.button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-4 h-4" />
                검색
              </motion.button>
            </div>
          </motion.form>


        </div>
      </div>
    </div>
  )
}