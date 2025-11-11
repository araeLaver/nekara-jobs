/**
 * Job Service
 *
 * 채용공고 관련 비즈니스 로직을 담당합니다.
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NotFoundError, ValidationError } from '@/lib/errors'

export interface JobFilters {
  company?: string
  location?: string
  department?: string
  jobType?: string
  search?: string
  isActive?: boolean
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  pages: number
}

export class JobService {
  /**
   * 채용공고 목록 조회
   */
  async getJobs(filters: JobFilters = {}, pagination: PaginationOptions = {}) {
    const page = Math.max(1, pagination.page || 1)
    const limit = Math.min(100, Math.max(1, pagination.limit || 20))
    const skip = (page - 1) * limit

    const whereClause = this.buildWhereClause(filters)

    // 병렬로 데이터와 총 개수 조회
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              logo: true
            }
          }
        },
        orderBy: [
          { postedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.job.count({ where: whereClause })
    ])

    const paginationInfo: PaginationResult = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }

    return {
      jobs,
      pagination: paginationInfo
    }
  }

  /**
   * 채용공고 상세 조회
   */
  async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            logo: true,
            website: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!job) {
      throw new NotFoundError('채용공고를 찾을 수 없습니다')
    }

    // 조회수 증가 (비동기, 에러 무시)
    this.incrementViewCount(id).catch(err =>
      console.error(`Failed to increment view count for job ${id}:`, err)
    )

    return job
  }

  /**
   * 회사별 통계 조회
   */
  async getCompanyStats() {
    const stats = await prisma.job.groupBy({
      by: ['companyId'],
      where: { isActive: true },
      _count: {
        id: true
      }
    })

    // 회사 정보 조회
    const companyIds = stats.map(s => s.companyId)
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true }
    })

    const companyMap = new Map(companies.map(c => [c.id, c.name]))

    return stats.map(stat => ({
      company: companyMap.get(stat.companyId) || stat.companyId,
      count: stat._count.id
    }))
  }

  /**
   * 전체 통계 조회
   */
  async getOverallStats() {
    const [totalJobs, jobsByCompany, recentJobs] = await Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      this.getCompanyStats(),
      prisma.job.count({
        where: {
          isActive: true,
          postedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
          }
        }
      })
    ])

    return {
      totalJobs,
      jobsByCompany,
      recentJobs
    }
  }

  /**
   * WHERE 절 생성
   */
  private buildWhereClause(filters: JobFilters): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true
    }

    // 회사 필터
    if (filters.company) {
      where.company = {
        name: {
          equals: filters.company,
          mode: 'insensitive'
        }
      }
    }

    // 지역 필터
    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive'
      }
    }

    // 부서 필터
    if (filters.department) {
      where.department = {
        contains: filters.department,
        mode: 'insensitive'
      }
    }

    // 고용 형태 필터
    if (filters.jobType) {
      where.jobType = {
        contains: filters.jobType,
        mode: 'insensitive'
      }
    }

    // 검색어 필터 (제목 또는 설명)
    if (filters.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    return where
  }

  /**
   * 조회수 증가
   */
  private async incrementViewCount(jobId: string) {
    // JobView 레코드 생성 (익명)
    await prisma.jobView.create({
      data: {
        jobId,
        ipAddress: '0.0.0.0', // 실제로는 요청 IP를 사용
        userAgent: 'web'
      }
    })
  }

  /**
   * 필터 옵션 조회
   */
  async getFilterOptions() {
    const [departments, locations, jobTypes, experiences] = await Promise.all([
      prisma.job.findMany({
        where: { isActive: true, department: { not: null } },
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' }
      }),
      prisma.job.findMany({
        where: { isActive: true, location: { not: null } },
        select: { location: true },
        distinct: ['location'],
        orderBy: { location: 'asc' }
      }),
      prisma.job.findMany({
        where: { isActive: true, jobType: { not: null } },
        select: { jobType: true },
        distinct: ['jobType'],
        orderBy: { jobType: 'asc' }
      }),
      prisma.job.findMany({
        where: { isActive: true, experience: { not: null } },
        select: { experience: true },
        distinct: ['experience'],
        orderBy: { experience: 'asc' }
      })
    ])

    return {
      departments: this.cleanOptions(departments, 'department'),
      locations: this.cleanOptions(locations, 'location'),
      jobTypes: this.cleanOptions(jobTypes, 'jobType'),
      experiences: this.cleanOptions(experiences, 'experience')
    }
  }

  /**
   * 옵션 정리 헬퍼
   */
  private cleanOptions(items: Array<Record<string, string | null>>, key: string): string[] {
    return ['전체', ...items
      .map(item => item[key])
      .filter((value): value is string =>
        value !== null &&
        value !== undefined &&
        value.trim() !== ''
      )
      .sort()]
  }
}

// 싱글톤 인스턴스 export
export const jobService = new JobService()
