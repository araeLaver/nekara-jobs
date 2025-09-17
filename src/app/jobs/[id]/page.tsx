'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import JobDetail from '@/components/JobDetail'

export default function JobDetailPage() {
  const params = useParams()

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <JobDetail jobId={params.id as string} />
    </div>
  )
}