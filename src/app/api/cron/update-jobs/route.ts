import { NextRequest, NextResponse } from 'next/server'
// We will import the main function from the working crawler
import { main as runCrawlers } from '../../../../crawler/main-crawler'

export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job authentication
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Starting scheduled job update via Vercel Cron...')

    // The main-crawler.js script already contains all the logic for
    // crawling, saving, and updating jobs. We just need to invoke it.
    // It also handles its own prisma connection.
    await runCrawlers();

    console.log('✅ Scheduled job update completed successfully.')

    return NextResponse.json({
      success: true,
      message: `Job update completed successfully.`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job execution error:', error)
    return NextResponse.json(
      {
        error: 'Failed to run crawler job',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
