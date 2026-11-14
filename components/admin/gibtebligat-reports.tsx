'use client'

import { useEffect, useState } from 'react'

import { LicenseOrdersPanel } from './license-orders-panel'

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

type HeartbeatRow = {
  hwid: string
  appVersion: string
  licenseStatus: string
  osUser: string
  lastSeenAt: string
  seenCount: number
}

type Report = {
  downloads: { today: number; last7Days: number; total: number }
  demos: { computers: number; firms: number }
  telemetry: TelemetryRow[]
  heartbeats?: HeartbeatRow[]
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-4">
      <p className="text-sm text-[var(--ds-color-text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--ds-color-text)]">{value}</p>
    </div>
  )
}

export function GibTebligatReports() {
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/gibtebligat/admin-report', { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          throw new Error('Oturum gerekli.')
        }
        if (!response.ok) {
          throw new Error('Rapor okunamadı.')
        }
        return response.json() as Promise<Report>
      })
      .then((data) => {
        if (active) setReport(data)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Rapor okunamadı.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-[var(--ds-color-text-muted)]">Rapor yükleniyor…</p>
  }

  if (error || !report) {
    return <p className="text-sm text-[#9F2D2D]">{error || 'Rapor okunamadı.'}</p>
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Toplam kurulum indirme sayısı</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Metric label="Bugün" value={report.downloads.today} />
          <Metric label="Son 7 gün" value={report.downloads.last7Days} />
          <Metric label="Toplam" value={report.downloads.total} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Aktif demo kurulumları</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Metric label="Tekil bilgisayar" value={report.demos.computers} />
          <Metric label="Demo başlayan firma" value={report.demos.firms} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Cihaz sinyalleri</h2>
        <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
          Uygulama her açılışta ve günde bir kez sinyal gönderir.
        </p>
        <div className="mt-3 overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--ds-color-surface-alt)] text-[var(--ds-color-text-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Son görülme</th>
                <th className="px-3 py-2 font-medium">Durum</th>
                <th className="px-3 py-2 font-medium">Kullanıcı</th>
                <th className="px-3 py-2 font-medium">Sürüm</th>
                <th className="px-3 py-2 font-medium">Cihaz</th>
                <th className="px-3 py-2 font-medium">Açılış</th>
              </tr>
            </thead>
            <tbody>
              {(report.heartbeats ?? []).length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-[var(--ds-color-text-muted)]" colSpan={6}>
                    Sinyal yok.
                  </td>
                </tr>
              ) : (
                report.heartbeats?.map((row) => (
                  <tr key={row.hwid} className="border-t border-[var(--ds-color-border)]">
                    <td className="whitespace-nowrap px-3 py-2">{row.lastSeenAt.replace('T', ' ').slice(0, 19)}</td>
                    <td className="px-3 py-2 font-medium">{row.licenseStatus}</td>
                    <td className="px-3 py-2">{row.osUser}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.appVersion}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono">{row.hwid.slice(0, 12)}</td>
                    <td className="px-3 py-2">{row.seenCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">GİB hata telemetri kayıtları</h2>
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

      <LicenseOrdersPanel />
    </div>
  )
}
