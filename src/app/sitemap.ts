import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nekara-jobs.com'
  
  // 기본 페이지들
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }
  ]

  // 동적으로 채용공고 페이지들 추가
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jobs?limit=1000`)
    const data = await response.json()
    
    if (data.jobs && Array.isArray(data.jobs)) {
      const jobRoutes = data.jobs.map((job: any) => ({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: new Date(job.postedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
      
      routes.push(...jobRoutes)
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}