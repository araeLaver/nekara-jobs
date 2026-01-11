'use client'

import { memo } from 'react'
import { COMPANIES, getCompanyColor } from '@/config/companies'

interface CompanyTabsProps {
  activeCompany: string
  onCompanyChange: (company: string) => void
  companyStats: Array<{ company: string; count: number }>
}

function CompanyTabs({ activeCompany, onCompanyChange, companyStats }: CompanyTabsProps) {
  const companies = [
    { id: '', name: '전체', color: 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 border-slate-700' },
    ...COMPANIES.map(c => ({ id: c.id, name: c.name, color: c.color }))
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
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(CompanyTabs)