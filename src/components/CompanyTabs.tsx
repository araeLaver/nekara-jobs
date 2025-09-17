'use client'

interface CompanyTabsProps {
  activeCompany: string
  onCompanyChange: (company: string) => void
  companyStats: Array<{ company: string; count: number }>
}

export default function CompanyTabs({ activeCompany, onCompanyChange, companyStats }: CompanyTabsProps) {
  const companies = [
    { id: '', name: '전체', color: 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 border-slate-700' },
    { id: 'naver', name: '네이버', color: 'bg-green-900/30 text-green-300 hover:bg-green-800/40 border-green-700' },
    { id: 'kakao', name: '카카오', color: 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-800/40 border-yellow-700' },
    { id: 'line', name: '라인', color: 'bg-green-900/30 text-green-300 hover:bg-green-800/40 border-green-700' },
    { id: 'coupang', name: '쿠팡', color: 'bg-orange-900/30 text-orange-300 hover:bg-orange-800/40 border-orange-700' },
    { id: 'baemin', name: '배달의민족', color: 'bg-teal-900/30 text-teal-300 hover:bg-teal-800/40 border-teal-700' },
    { id: 'toss', name: '토스', color: 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/40 border-blue-700' },
    { id: 'carrot', name: '당근마켓', color: 'bg-orange-900/30 text-orange-300 hover:bg-orange-800/40 border-orange-700' },
    { id: 'krafton', name: '크래프톤', color: 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 border-purple-700' },
    { id: 'nexon', name: '넥슨', color: 'bg-red-900/30 text-red-300 hover:bg-red-800/40 border-red-700' },
    { id: 'zigbang', name: '직방', color: 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/40 border-indigo-700' },
    { id: 'bucketplace', name: '오늘의집', color: 'bg-pink-900/30 text-pink-300 hover:bg-pink-800/40 border-pink-700' },
  ]

  const getCompanyCount = (companyId: string) => {
    if (companyId === '') {
      return companyStats.reduce((sum, stat) => sum + stat.count, 0)
    }
    const stat = companyStats.find(s => s.company === companyId)
    return stat ? stat.count : 0
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-14 sm:top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {companies.map((company) => {
              const isActive = activeCompany === company.id
              const count = getCompanyCount(company.id)
              
              return (
                <button
                  key={company.id}
                  onClick={() => onCompanyChange(company.id)}
                  className={`
                    px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 backdrop-blur-md flex items-center justify-between w-full
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                      : `${company.color} border`
                    }
                  `}
                >
                  <span className="truncate">{company.name}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${
                    isActive 
                      ? 'bg-white/90 text-purple-700' 
                      : 'bg-slate-800/80 text-slate-200'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}