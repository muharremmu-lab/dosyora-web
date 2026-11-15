'use client'

import { useEffect, useState } from 'react'

import { formatDateTime } from '@/lib/admin/labels'
import type { FeedbackKind, FeedbackStatus, SiteFeedback } from '@/lib/db/types'

const KIND_LABELS: Record<FeedbackKind, string> = {
  oneri: 'Öneri',
  istek: 'İstek',
  sikayet: 'Şikayet',
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: 'Yeni',
  READ: 'Okundu',
  ARCHIVED: 'Arşiv',
}

export function FeedbackPanel() {
  const [items, setItems] = useState<SiteFeedback[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const response = await fetch('/api/feedback', { cache: 'no-store' })
    if (!response.ok) throw new Error('Bildirimler okunamadı.')
    const payload = (await response.json()) as { items: SiteFeedback[] }
    setItems(payload.items)
  }

  useEffect(() => {
    let active = true
    load()
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Bildirimler okunamadı.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function setStatus(id: number, status: FeedbackStatus) {
    setBusyId(id)
    setError('')
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Durum güncellenemedi.')
      }
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Durum güncellenemedi.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="text-sm text-[var(--ds-color-text-muted)]">Bildirimler yükleniyor.</p>

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-[#9F2D2D]">{error}</p> : null}
      <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tarih</th>
              <th className="px-4 py-3 font-semibold">Tür</th>
              <th className="px-4 py-3 font-semibold">İletişim</th>
              <th className="px-4 py-3 font-semibold">Mesaj</th>
              <th className="px-4 py-3 font-semibold">Durum</th>
              <th className="px-4 py-3 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--ds-color-text-muted)]">Henüz bildirim yok.</td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--ds-color-border)] align-top last:border-b-0">
                <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{formatDateTime(item.created_at)}</td>
                <td className="px-4 py-3">{KIND_LABELS[item.kind]}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.contact_name}</div>
                  <div>{item.contact_email}</div>
                  {item.contact_phone ? <div className="text-xs text-[var(--ds-color-text-muted)]">{item.contact_phone}</div> : null}
                </td>
                <td className="max-w-sm px-4 py-3 whitespace-pre-wrap">{item.message}</td>
                <td className="px-4 py-3">{STATUS_LABELS[item.status]}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busyId === item.id || item.status === 'READ'} onClick={() => setStatus(item.id, 'READ')} className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
                      Okundu
                    </button>
                    <button type="button" disabled={busyId === item.id || item.status === 'ARCHIVED'} onClick={() => setStatus(item.id, 'ARCHIVED')} className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-50">
                      Arşivle
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
