'use client'

import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <h1 className="responsive-title font-bold text-gray-900">
              <span className="text-green-600">네</span>
              <span className="text-yellow-500">카</span>
              <span className="text-green-500">라</span>
              <span className="text-orange-500">쿠</span>
              <span className="text-teal-500">배</span>
              <span className="ml-1 sm:ml-2 text-gray-700 hidden-mobile">채용정보</span>
              <span className="ml-1 text-gray-700 show-mobile">채용</span>
            </h1>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium responsive-text">
              채용공고
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium responsive-text">
              기업정보
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium responsive-text">
              통계
            </a>
            <button className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base">
              알림 설정
            </button>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <a href="#" className="block text-gray-700 hover:text-gray-900 font-medium py-2">
                채용공고
              </a>
              <a href="#" className="block text-gray-700 hover:text-gray-900 font-medium py-2">
                기업정보
              </a>
              <a href="#" className="block text-gray-700 hover:text-gray-900 font-medium py-2">
                통계
              </a>
              <button className="w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                알림 설정
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}