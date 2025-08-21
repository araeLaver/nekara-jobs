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

          {/* 네비게이션 */}
          <nav className="flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              채용공고
            </a>
            <a href="/community" className="text-gray-700 hover:text-gray-900 font-medium">
              커뮤니티
            </a>
          </nav>
        </div>

      </div>
    </header>
  )
}