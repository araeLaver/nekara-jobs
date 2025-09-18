import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://devlunch.co.kr'
  
  // 기본 페이지들
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    }
  ]

  // 동적으로 채용공고 페이지들 추가
  try {
    const jobs = await prisma.job.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        updatedAt: true,
        postedAt: true
      },
      orderBy: {
        postedAt: 'desc'
      },
      take: 1000
    })

    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt || job.postedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    routes.push(...jobRoutes)
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}