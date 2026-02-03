'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'

type Rule = {
  id: string
  company: string
  minValidRatio: number
  minDescriptionLength: number
}

export default function MonitoringSettingsPage() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company: '',
    minValidRatio: '0.7',
    minDescriptionLength: '50'
  })

  async function loadRules() {
    if (!token) {
      setError('token ????? ?????.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/monitoring/quality-rules', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('?? ?? ??')
      const data = await res.json()
      setRules(data.rules || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '?? ??')
    } finally {
      setLoading(false)
    }
  }

  async function createRule() {
    try {
      const res = await fetch('/api/monitoring/quality-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company: form.company,
          minValidRatio: Number(form.minValidRatio),
          minDescriptionLength: Number(form.minDescriptionLength)
        })
      })
      if (!res.ok) throw new Error('?? ??')
      setForm({ company: '', minValidRatio: '0.7', minDescriptionLength: '50' })
      await loadRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : '?? ??')
    }
  }

  async function updateRule(rule: Rule) {
    try {
      const res = await fetch(`/api/monitoring/quality-rules/${rule.id}` , {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rule)
      })
      if (!res.ok) throw new Error('?? ??')
      await loadRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : '?? ??')
    }
  }

  async function deleteRule(id: string) {
    try {
      const res = await fetch(`/api/monitoring/quality-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('?? ??')
      await loadRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : '?? ??')
    }
  }

  useEffect(() => {
    loadRules()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
          <h1 className="text-2xl font-semibold">??? ?? ?? ??</h1>
          <p className="mt-2 text-sm text-slate-400">token ????? ?? ? ??? ??/?????.</p>

          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:grid-cols-3">
            <input
              value={form.company}
              onChange={event => setForm(prev => ({ ...prev, company: event.target.value }))}
              placeholder="??? (?: Kakao)"
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            />
            <input
              value={form.minValidRatio}
              onChange={event => setForm(prev => ({ ...prev, minValidRatio: event.target.value }))}
              placeholder="?? ?? (?: 0.8)"
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            />
            <input
              value={form.minDescriptionLength}
              onChange={event => setForm(prev => ({ ...prev, minDescriptionLength: event.target.value }))}
              placeholder="?? ?? ?? (?: 80)"
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
            />
            <button
              onClick={createRule}
              className="md:col-span-3 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
            >
              ?? ??
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-slate-800">
                  <th className="pb-3">??</th>
                  <th className="pb-3">?? ??</th>
                  <th className="pb-3">?? ??</th>
                  <th className="pb-3">??</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={4}>?? ?...</td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={4}>??? ??? ????.</td>
                  </tr>
                ) : (
                  rules.map(rule => (
                    <tr key={rule.id}>
                      <td className="py-4">
                        <input
                          value={rule.company}
                          onChange={event => setRules(prev => prev.map(item => item.id === rule.id ? { ...item, company: event.target.value } : item))}
                          className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          value={rule.minValidRatio}
                          onChange={event => setRules(prev => prev.map(item => item.id === rule.id ? { ...item, minValidRatio: Number(event.target.value) } : item))}
                          className="w-24 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          value={rule.minDescriptionLength}
                          onChange={event => setRules(prev => prev.map(item => item.id === rule.id ? { ...item, minDescriptionLength: Number(event.target.value) } : item))}
                          className="w-28 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="py-4 space-x-2">
                        <button
                          onClick={() => updateRule(rule)}
                          className="rounded-lg border border-emerald-500/40 px-3 py-1 text-xs text-emerald-200 hover:border-emerald-300"
                        >
                          ??
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:border-red-300"
                        >
                          ??
                        </button>
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
