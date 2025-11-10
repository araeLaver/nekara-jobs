'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { currentUser, logout, loading } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/') // Redirect to home after logout
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-md shadow-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  DevLunch
                </span>
              </h1>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-slate-300 hover:text-white font-medium transition-colors">
              채용공고
            </Link>
            <Link href="/community" className="text-slate-300 hover:text-white font-medium transition-colors">
              커뮤니티
            </Link>
            
            <div className="w-px h-5 bg-slate-700"></div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-20 bg-slate-700 rounded-lg animate-pulse"></div>
              ) : currentUser ? (
                <>
                  <span className="text-white font-semibold">{currentUser.nickname}님</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  로그인
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
