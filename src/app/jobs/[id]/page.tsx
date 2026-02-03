import { jobService } from '@/services/job.service' // Import singleton
import Header from '@/components/Header'
import JobDetail from '@/components/JobDetail'
import { Metadata } from 'next'

interface JobDetailPageProps {
  params: { id: string }
}

// Generate dynamic metadata for each job post
export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const jobId = params.id
  
  try {
    const job = await jobService.getJobById(jobId)

    if (!job) {
      return {
        title: '채용공고를 찾을 수 없습니다 | DevLunch',
        description: '요청하신 채용공고를 찾을 수 없습니다.',
      }
    }

    const title = `${job.title} - ${job.company.name} | DevLunch`
    const description = job.description ? job.description.substring(0, 150) + '...' : `${job.company.name}에서 ${job.title} 포지션을 채용합니다. 개발자 채용 정보를 DevLunch에서 확인하세요.`
    const keywords = `${job.title}, ${job.company.name}, ${job.department}, ${job.location}, 개발자 채용, ${job.jobType}, ${job.experience}, DevLunch`

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: `https://devlunch.co.kr/jobs/${job.id}`,
        type: 'article',
        images: [
          {
            url: job.company.logo || 'https://devlunch.co.kr/default-og-image.jpg',
            alt: `${job.company.name} 로고`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [job.company.logo || 'https://devlunch.co.kr/default-twitter-image.jpg'],
      },
    }
  } catch (error) {
    console.error('Failed to generate metadata for job', jobId, error)
    return {
      title: '채용공고 | DevLunch',
      description: '개발자 채용 정보를 DevLunch에서 확인하세요.',
    }
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  let initialJob = null

  try {
    const jobData = await jobService.getJobById(params.id)
    
    if (jobData) {
      // Serialize Date objects to strings for Client Component
      initialJob = {
        id: jobData.id,
        title: jobData.title,
        description: jobData.description ?? '',
        location: jobData.location ?? '',
        department: jobData.department ?? '',
        jobType: jobData.jobType ?? '',
        experience: jobData.experience ?? '',
        salary: jobData.salary ?? '',
        postedAt: jobData.postedAt.toISOString(),
        deadline: jobData.deadline ? jobData.deadline.toISOString() : null,
        originalUrl: jobData.originalUrl,
        company: {
          id: jobData.company.id,
          name: jobData.company.name,
          nameEn: jobData.company.nameEn,
          logo: jobData.company.logo,
          website: jobData.company.website
        },
        tags: jobData.tags.map(tag => tag.tag.name)
      }
    }
  } catch (error) {
    console.error('Failed to fetch job details:', error)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <JobDetail jobId={params.id} initialJob={initialJob} />
    </div>
  )
}
