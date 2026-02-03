import Header from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 300

type SummaryRow = {
  total: number
  success: number
  failed: number
  warning: number
  avg_duration_sec: number | null
}

type CompanySummaryRow = {
  company: string
  total: number
  success: number
  failed: number
  warning: number
  avg_duration_sec: number | null
  last_at: Date | null
}

type TrendRow = {
  day: Date
  total: number
  success: number
  failed: number
  warning: number
}

type ErrorSummaryRow = {
  error_msg: string | null
  count: number
}

type RecommendationRow = {
  company: string
  avg_valid_ratio: number | null
  runs: number
}

type LastRunRow = {
  company: string
  status: string
  start_time: Date
  end_time: Date | null
  job_count: number | null
  error_msg: string | null
  created_at: Date
}

function parseNumber(value: string | string[] | undefined, fallback: number) {
  if (!value) return fallback
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatDate(value: Date | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(value)
}


function buildSparkline(values: number[], width: number, height: number) {
  if (values.length === 0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatDuration(start: Date | null, end: Date | null) {
  if (!start || !end) return '-'
  const seconds = Math.max(0, (end.getTime() - start.getTime()) / 1000)
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const rem = Math.round(seconds % 60)
  return `${minutes}m ${rem}s`
}

function statusBadge(status: string) {
  if (status === 'success') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  if (status === 'failed') return 'bg-red-500/15 text-red-300 border-red-500/30'
  return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
}

export default async function MonitoringPage({
  searchParams
}: {
  searchParams?: { days?: string | string[] }
}) {
  const days = Math.max(1, parseNumber(searchParams?.days, 7))
  const limit = 200

  const since = new Date()
  since.setDate(since.getDate() - days)

  const [summaryRows, lastRuns, companySummary, trendRows, errorSummary, recommendations, qualityRules] = await Promise.all([
    prisma.$queryRaw<SummaryRow[]>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'success')::int AS success,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
        COUNT(*) FILTER (WHERE status = 'warning')::int AS warning,
        AVG(EXTRACT(EPOCH FROM (end_time - start_time))) AS avg_duration_sec
      FROM crawl_logs
      WHERE created_at >= ${since}
    `,
    prisma.$queryRaw<LastRunRow[]>`
      SELECT DISTINCT ON (company)
        company,
        status,
        start_time,
        end_time,
        job_count,
        error_msg,
        created_at
      FROM crawl_logs
      ORDER BY company, created_at DESC
      LIMIT ${limit}
    `,
    prisma.$queryRaw<CompanySummaryRow[]>`
      SELECT
        company,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'success')::int AS success,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
        COUNT(*) FILTER (WHERE status = 'warning')::int AS warning,
        AVG(EXTRACT(EPOCH FROM (end_time - start_time))) AS avg_duration_sec,
        MAX(created_at) AS last_at
      FROM crawl_logs
      WHERE created_at >= ${since}
      GROUP BY company
      ORDER BY total DESC, company
    `,
    prisma.$queryRaw<TrendRow[]>`
      SELECT
        DATE_TRUNC('day', created_at) AS day,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'success')::int AS success,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
        COUNT(*) FILTER (WHERE status = 'warning')::int AS warning
      FROM crawl_logs
      WHERE created_at >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<ErrorSummaryRow[]>`
      SELECT
        error_msg,
        COUNT(*)::int AS count
      FROM crawl_logs
      WHERE created_at >= ${since}
        AND status IN ('failed', 'warning')
        AND error_msg IS NOT NULL
      GROUP BY error_msg
      ORDER BY count DESC
      LIMIT 8
    `,
    prisma.$queryRaw<RecommendationRow[]>`
      SELECT
        company,
        AVG(valid_ratio) AS avg_valid_ratio,
        COUNT(*)::int AS runs
      FROM crawl_logs
      WHERE created_at >= ${since}
        AND valid_ratio IS NOT NULL
      GROUP BY company
      ORDER BY runs DESC
    `,
    prisma.companyQualityRule.findMany({ orderBy: { company: 'asc' } })
  ])

  const summary = summaryRows[0] || {
    total: 0,
    success: 0,
    failed: 0,
    warning: 0,
    avg_duration_sec: null
  }

  const successRate = summary.total > 0 ? summary.success / summary.total : 0

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-6 py-8 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Monitoring</p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">??? ?? ????</h1>
              <p className="mt-2 text-slate-400">?? {days}? ?? ?? ??? ???? ?????.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {[1, 3, 7, 14, 30].map(value => (
                <Link
                  key={value}
                  href={`/monitoring?days=${value}`}
                  className={`rounded-full border px-3 py-1 transition ${
                    value === days
                      ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {value}?
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">? ?? ??</p>
              <p className="mt-2 text-3xl font-semibold">{summary.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">???</p>
              <p className="mt-2 text-3xl font-semibold">{(successRate * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">??</p>
              <p className="mt-2 text-3xl font-semibold text-red-300">{summary.failed}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">?? ??</p>
              <p className="mt-2 text-3xl font-semibold">{summary.avg_duration_sec ? `${summary.avg_duration_sec.toFixed(1)}s` : '-'}</p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">??? ?? ??</h2>
              <p className="mt-1 text-sm text-slate-400">??? ?? ??? ??? ?????.</p>
            </div>
            <div className="text-sm text-slate-500">?? ?? {limit}?</div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-slate-800">
                  <th className="pb-3">??</th>
                  <th className="pb-3">??</th>
                  <th className="pb-3">??</th>
                  <th className="pb-3">??</th>
                  <th className="pb-3">??</th>
                  <th className="pb-3">??</th>
                  <th className="pb-3">??</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lastRuns.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={7}>
                      ?? ?? ??? ????.
                    </td>
                  </tr>
                ) : (
                  lastRuns.map(run => (
                    <tr key={run.company} className="text-slate-200">
                      <td className="py-4 font-semibold">{run.company}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusBadge(run.status)}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{formatDate(run.start_time)}</td>
                      <td className="py-4 text-slate-400">{formatDate(run.end_time)}</td>
                      <td className="py-4 text-slate-400">{formatDuration(run.start_time, run.end_time)}</td>
                      <td className="py-4 text-slate-400">{run.job_count ?? '-'}</td>
                      <td className="py-4 text-slate-500">
                        <span className="line-clamp-2 block max-w-xs">{run.error_msg ?? '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
