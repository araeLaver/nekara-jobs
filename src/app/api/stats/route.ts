import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    // 7일 전 날짜
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [totalJobs, totalCompanies, recentJobs, jobsByCompany] = await Promise.all([
      // 전체 채용공고 수
      prisma.job.count({
        where: { isActive: true }
      }),
      
      // 전체 회사 수
      prisma.company.count(),
      
      // 최근 7일 채용공고 수
      prisma.job.count({
        where: {
          isActive: true,
          postedAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      
      // 회사별 채용공고 수
      prisma.company.findMany({
        include: {
          _count: {
            select: {
              jobs: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: {
          jobs: {
            _count: 'desc'
          }
        }
      })
    ])

    const companiesWithJobs = jobsByCompany
      .filter(company => company._count.jobs > 0)
      .map(company => ({
        company: company.name,
        count: company._count.jobs
      }))

    return NextResponse.json({
      totalJobs,
      totalCompanies,
      recentJobs,
      jobsByCompany: companiesWithJobs
    })

  } catch (error) {
    return handleApiError(error)
  }
}