import JobDetail from '@/components/JobDetail'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  return <JobDetail jobId={params.id} />
}