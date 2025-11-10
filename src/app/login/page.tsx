'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { User } from '@prisma/client'

export default function LoginPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Failed to fetch users', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleLogin = (user: User) => {
    login(user)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">로그인</h1>
          <p className="mt-2 text-slate-400">테스트 계정을 선택하여 로그인하세요.</p>
        </div>
        {loading ? (
          <div className="text-center text-slate-300">사용자 목록을 불러오는 중...</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-slate-600 flex-shrink-0 mr-4">
                  {/* Avatar can be added here if available */}
                </div>
                <span className="text-lg font-medium text-white">{user.nickname}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
