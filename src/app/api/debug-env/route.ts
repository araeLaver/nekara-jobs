import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cronSecret = process.env.CRON_SECRET || ''
  return NextResponse.json({
    cronSecretLength: cronSecret.length,
    cronSecretPrefix: cronSecret.substring(0, 8),
    cronSecretSuffix: cronSecret.substring(cronSecret.length - 4),
    hasWhitespace: cronSecret !== cronSecret.trim(),
  })
}
