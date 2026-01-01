import './globals.css'
import { Inter } from 'next/font/google'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { validateEnv } from '@/lib/env'
import { Providers } from './providers' // Import the new Providers component

// 서버 시작 시 환경변수 검증 (서버 컴포넌트에서만 실행)
if (typeof window === 'undefined') {
  validateEnv()
}

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DevLunch | 개발자를 위한 채용 플랫폼',
  description: '개발자 맞춤 채용정보를 한눈에. 네이버, 카카오, 라인, 쿠팡, 배달의민족 등 대기업 개발자 채용공고를 실시간으로 확인하세요',
  keywords: 'DevLunch, 개발자 채용, 개발자 취업, 네이버 채용, 카카오 채용, 라인 채용, 쿠팡 채용, 배달의민족 등 대기업 개발자 채용공고를 실시간으로 확인하세요',
  openGraph: {
    title: 'DevLunch | 개발자를 위한 채용 플랫폼',
    description: '개발자 맞춤 채용정보를 한눈에. 대기업 개발자 채용공고를 실시간으로 확인하세요',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevLunch | 개발자를 위한 채용 플랫폼',
    description: '개발자 맞춤 채용정보를 한눈에',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://devlunch.co.kr',
  },
  metadataBase: new URL('https://devlunch.co.kr')
}

import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="ko">
      {/* ... (keep head content) */}
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
