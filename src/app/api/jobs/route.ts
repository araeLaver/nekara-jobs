import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// 타입 정의를 통해 Raw Query 결과의 형태를 명시
interface JobResult {
  id: string
  title: string
  location: string | null
  department: string | null
  jobType: string | null
  experience: string | null
  postedAt: Date
  deadline: Date | null
  originalUrl: string
  companyId: string
  companyName: string
  companyNameEn: string | null
  companyLogo: string | null
  // tags는 성능을 위해 이 쿼리에서 제외됨. 필요시 별도 쿼리 필요.
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const company = searchParams.get('company') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('jobType') || ''
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''

    const offset = (page - 1) * limit

    // 동적 WHERE 절 생성
    const whereConditions: Prisma.Sql[] = [Prisma.sql`j."isActive" = true`]
    if (company) {
      whereConditions.push(Prisma.sql`c.name = ${company}`)
    }
    if (location) {
      whereConditions.push(Prisma.sql`j.location ILIKE ${'%' + location + '%'}`)
    }
    if (jobType) {
      whereConditions.push(Prisma.sql`j."jobType" ILIKE ${'%' + jobType + '%'}`)
    }
    if (department) {
      whereConditions.push(Prisma.sql`j.department ILIKE ${'%' + department + '%'}`)
    }
    if (search) {
      whereConditions.push(
        Prisma.sql`(j.title ILIKE ${'%' + search + '%'} OR j.description ILIKE ${'%' + search + '%'})`
      )
    }
    const whereClause = Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`

    // 회사 순서 정의
    const companyOrder = ['naver', 'kakao', 'line', 'coupang', 'baemin', 'nexon', 'toss', 'carrot', 'krafton', 'zigbang', 'bucketplace']
    const caseStatement = Prisma.sql`CASE ${Prisma.join(
      companyOrder.map((c, i) => Prisma.sql`WHEN c.name = ${c} THEN ${i}`),
      ' '
    )} ELSE ${companyOrder.length} END`

    // 데이터 조회 및 전체 카운트를 병렬로 실행
    const [jobs, totalResult] = await Promise.all([
      prisma.$queryRaw<JobResult[]>`
        SELECT
          j.id, j.title, j.location, j.department, j."jobType", j.experience, j."postedAt", j.deadline, j."originalUrl",
          c.id as "companyId", c.name as "companyName", c."nameEn" as "companyNameEn", c.logo as "companyLogo"
        FROM jobs j
        INNER JOIN companies c ON j."companyId" = c.id
        ${whereClause}
        ORDER BY ${caseStatement}, j."postedAt" DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) FROM jobs j
        INNER JOIN companies c ON j."companyId" = c.id
        ${whereClause}
      `
    ])
    
    const total = Number(totalResult[0].count)

    // 데이터 형식 변환
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      location: job.location || '',
      department: job.department || '',
      jobType: job.jobType || '',
      experience: job.experience || '',
      postedAt: job.postedAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : null,
      originalUrl: job.originalUrl,
      company: {
        id: job.companyId,
        name: job.companyName,
        nameEn: job.companyNameEn,
        logo: job.companyLogo
      },
      tags: [] // 성능을 위해 tags는 포함하지 않음
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        current: page,
        total,
        pages: totalPages,
        limit
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
