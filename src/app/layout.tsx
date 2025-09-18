import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DevLunch | 개발자를 위한 채용 플랫폼',
  description: '개발자 맞춤 채용정보를 한눈에. 네이버, 카카오, 라인, 쿠팡, 배달의민족 등 대기업 개발자 채용공고를 실시간으로 확인하세요',
  keywords: 'DevLunch, 개발자 채용, 개발자 취업, 네이버 채용, 카카오 채용, 라인 채용, 쿠팡 채용, 배달의민족 채용, IT 채용, 프론트엔드, 백엔드, 풀스택',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevLunch',
    description: '개발자를 위한 채용 플랫폼',
    url: 'https://devlunch.co.kr',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://devlunch.co.kr/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'DevLunch',
      url: 'https://devlunch.co.kr'
    }
  }

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="네카라쿠배 채용" />
        <meta name="geo.region" content="KR" />
        <meta name="geo.country" content="Korea" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="1 days" />
        <link rel="canonical" href="https://devlunch.co.kr" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}