'use client'

import { useEffect, useState } from 'react'

import { formatDateTime } from '@/lib/admin/labels'

type NotificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type LicenseNotification = {
  id: number
  full_name: string
  email: string
  tax_number: string
  tax_office: string
  address: string
  status: NotificationStatus
  created_at: string
}

const STATUS_LABELS: Record<NotificationStatus, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
}

export function LicenseNotificationsPanel() {
  const [items, setItems] = useState<LicenseNotification[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const response = await fetch('/api/license-notification', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Havale bildirimleri okunamadı.')
    }
    const payload = (await response.json()) as { notifications: LicenseNotification[] }
    setItems(payload.notifications)
  }

  useEffect(() => {
    let active = true
    load()
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Havale bildirimleri okunamadı.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function updateStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    setBusyId(id)
    setNotice('')
    setError('')
    try {
      const response = await fetch(`/api/license-notification/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Durum güncellenemedi.')
      }
      await load()
      setNotice(status === 'APPROVED' ? 'Bildirim onaylandı.' : 'Bildirim reddedildi.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Durum güncellenemedi.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--ds-color-text-muted)]">Bildirimler yükleniyor.</p>
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-[var(--ds-color-danger)]">{error}</p> : null}
      {notice ? <p className="text-sm text-[var(--ds-color-text)]">{notice}</p> : null}
      <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tarih</th>
              <th className="px-4 py-3 font-semibold">Ad Soyad / Unvan</th>
              <th className="px-4 py-3 font-semibold">TCKN / VKN</th>
              <th className="px-4 py-3 font-semibold">E-posta</th>
              <th className="px-4 py-3 font-semibold">Durum</th>
              <th className="px-4 py-3 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--ds-color-text-muted)]">
                  Henüz havale bildirimi yok.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--ds-color-border)] last:border-b-0">
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{formatDateTime(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.full_name}</div>
                    <div className="text-xs text-[var(--ds-color-text-muted)]">{item.tax_office}</div>
                  </td>
                  <td className="px-4 py-3">{item.tax_number}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{STATUS_LABELS[item.status]}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === item.id || item.status === 'APPROVED'}
                        onClick={() => updateStatus(item.id, 'APPROVED')}
                        className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--ds-color-secondary)] disabled:opacity-50"
                      >
                        Onayla / Aktif Et
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id || item.status === 'REJECTED'}
                        onClick={() => updateStatus(item.id, 'REJECTED')}
                        className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        Reddet
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
