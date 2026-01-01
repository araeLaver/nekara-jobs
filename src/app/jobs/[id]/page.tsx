import { JobService } from '@/services/job.service' // Import JobService
import Header from '@/components/Header'
import JobDetail from '@/components/JobDetail'
import { Metadata } from 'next' // Import Metadata type

interface JobDetailPageProps {
  params: { id: string }
}

// Generate dynamic metadata for each job post
export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const jobId = params.id
  const jobService = new JobService() // Instantiate JobService

  try {
    const job = await jobService.getJobById(jobId) // Fetch job details

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
            url: job.company.logo || 'https://devlunch.co.kr/default-og-image.jpg', // Default OG image
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

export default function JobDetailPage({ params }: JobDetailPageProps) {

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <JobDetail jobId={params.id as string} />
    </div>
  )
}