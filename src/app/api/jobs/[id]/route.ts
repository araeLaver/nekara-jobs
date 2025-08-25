import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Express 서버의 API를 프록시
    const response = await fetch(`http://localhost:3001/api/jobs/${params.id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: '채용공고를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      throw new Error('Failed to fetch job')
    }
    
    const job = await response.json()
    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}