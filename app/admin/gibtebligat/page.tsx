'use client'

import { FormEvent, useEffect, useState } from 'react'

const STORAGE_KEY = 'gibtebligat-admin-key'

type TelemetryRow = {
  id: number
  createdAt: string
  appVersion: string
  errorCode: string
  step: string
  detail: string
  osVersion: string | null
  criticalAlert: boolean
}

type Report = {
  downloads: { today: number; last7Days: number; total: number }
  demos: { computers: number; firms: number }
  telemetry: TelemetryRow[]
}

async function loadReport(key: string): Promise<Report> {
  const response = await fetch('/api/gibtebligat/admin-report', {
    headers: { authorization: `Bearer ${key}` },
    cache: 'no-store',
  })
  if (response.status === 401) {
    throw new Error('Anahtar geçersiz.')
  }
  if (!response.ok) {
    throw new Error('Rapor okunamadı.')
  }
  return response.json() as Promise<Report>
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-4">
      <p className="text-sm text-[var(--ds-color-text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--ds-color-text)]">{value}</p>
    </div>
  )
}

export default function GibTebligatAdminPage() {
  const [key, setKey] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return
    setKey(saved)
    setLoading(true)
    loadReport(saved)
      .then(setReport)
      .catch((reason: Error) => {
        sessionStorage.removeItem(STORAGE_KEY)
        setError(reason.message)
      })
      .finally(() => setLoading(false))
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = key.trim()
    if (!next) return
    setLoading(true)
    setError('')
    try {
      const data = await loadReport(next)
      sessionStorage.setItem(STORAGE_KEY, next)
      setReport(data)
    } catch (reason) {
      sessionStorage.removeItem(STORAGE_KEY)
      setReport(null)
      setError(reason instanceof Error ? reason.message : 'Rapor okunamadı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 text-[var(--ds-color-text)]">
      <h1 className="text-2xl font-bold tracking-tight">GibTebligat raporları</h1>
      <p className="mt-2 text-sm text-[var(--ds-color-text-muted)]">
        TELEMETRY_ADMIN_KEY veya ADMIN_KEY ile açılır.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="admin-key">
          Yönetici anahtarı
        </label>
        <input
          id="admin-key"
          type="password"
          autoComplete="current-password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="Yönetici anahtarı"
          className="min-w-0 flex-1 rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Yükleniyor' : 'Giriş'}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-[#9F2D2D]">{error}</p> : null}

      {report ? (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold">Toplam kurulum indirme sayısı</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Metric label="Bugün" value={report.downloads.today} />
              <Metric label="Son 7 gün" value={report.downloads.last7Days} />
              <Metric label="Toplam" value={report.downloads.total} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Aktif demo kurulumları</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Metric label="Tekil bilgisayar" value={report.demos.computers} />
              <Metric label="Demo başlayan firma" value={report.demos.firms} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">GİB hata telemetri kayıtları</h2>
            <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">Kritik uyarılar üstte.</p>
            <div className="mt-3 overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--ds-color-surface-alt)] text-[var(--ds-color-text-muted)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Zaman</th>
                    <th className="px-3 py-2 font-medium">Kod</th>
                    <th className="px-3 py-2 font-medium">Adım</th>
                    <th className="px-3 py-2 font-medium">Ayrıntı</th>
                    <th className="px-3 py-2 font-medium">Sürüm</th>
                  </tr>
                </thead>
                <tbody>
                  {report.telemetry.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-[var(--ds-color-text-muted)]" colSpan={5}>
                        Kayıt yok.
                      </td>
                    </tr>
                  ) : (
                    report.telemetry.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          row.criticalAlert
                            ? 'bg-[color:color-mix(in_srgb,#9F2D2D_8%,white)]'
                            : 'border-t border-[var(--ds-color-border)]'
                        }
                      >
                        <td className="whitespace-nowrap px-3 py-2">{row.createdAt.replace('T', ' ').slice(0, 19)}</td>
                        <td className="px-3 py-2 font-medium">
                          {row.errorCode}
                          {row.criticalAlert ? ' · kritik' : ''}
                        </td>
                        <td className="px-3 py-2">{row.step}</td>
                        <td className="max-w-md px-3 py-2">{row.detail}</td>
                        <td className="whitespace-nowrap px-3 py-2">{row.appVersion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
