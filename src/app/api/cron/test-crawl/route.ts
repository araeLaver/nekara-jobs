import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timings: Record<string, number> = {}
  const results: Record<string, number> = {}
  const errors: Record<string, string> = {}

  // 1) Naver (API only, no browser)
  try {
    const t0 = Date.now()
    const { crawlNaver } = require('../../../../../crawler/naver')
    const naverJobs = await crawlNaver()
    timings.naver = Date.now() - t0
    results.naver = naverJobs.length
  } catch (e: any) {
    errors.naver = e.message
  }

  // 2) Browser launch timing
  try {
    const t0 = Date.now()
    const { getBrowser } = require('../../../../../crawler/browser')
    const browser = await getBrowser()
    timings.browserLaunch = Date.now() - t0

    // 3) Line (lightest browser crawler)
    try {
      const t1 = Date.now()
      const { crawlLine } = require('../../../../../crawler/line')
      const lineJobs = await crawlLine(browser)
      timings.line = Date.now() - t1
      results.line = lineJobs.length
    } catch (e: any) {
      errors.line = e.message
    }

    await browser.close()
  } catch (e: any) {
    errors.browser = e.message
    timings.browserLaunch = -1
  }

  return NextResponse.json({
    timings,
    results,
    errors,
    totalMs: Object.values(timings).reduce((a, b) => a + Math.max(0, b), 0),
  })
}
