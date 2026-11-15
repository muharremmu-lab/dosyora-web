'use client'

import { useEffect, useState } from 'react'

import { formatDateTime } from '@/lib/admin/labels'

type PendingDesktopLicense = {
  id: number
  fullName: string
  taxNumber: string
  email: string
  address: string
  hardwareId: string | null
  createdAt: string
}

type BankTransfer = {
  recipientName: string
  iban: string
  relayNote: string
}

export function LicenseNotificationsPanel() {
  const [items, setItems] = useState<PendingDesktopLicense[]>([])
  const [bankTransfer, setBankTransfer] = useState<BankTransfer | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const [pendingResponse, bankResponse] = await Promise.all([
      fetch('/api/admin/licenses/pending', { cache: 'no-store' }),
      fetch('/api/license-notification', { cache: 'no-store' }),
    ])
    if (!pendingResponse.ok) {
      throw new Error('Bekleyen lisans talepleri okunamadı.')
    }
    const pending = (await pendingResponse.json()) as { requests: PendingDesktopLicense[] }
    setItems(pending.requests)
    if (bankResponse.ok) {
      const bank = (await bankResponse.json()) as { bankTransfer?: BankTransfer }
      setBankTransfer(bank.bankTransfer ?? null)
    }
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

  async function setDemo(id: number) {
    setBusyId(id)
    setNotice('')
    setError('')
    try {
      const response = await fetch('/api/admin/licenses/set-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Demo moda alınamadı.')
      }
      await load()
      setNotice('Kullanıcı demo moda alındı. Aktif lisans anahtarı kapatıldı.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Demo moda alınamadı.')
    } finally {
      setBusyId(null)
    }
  }

  async function updateStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    setBusyId(id)
    setNotice('')
    setError('')
    try {
      const response = await fetch(status === 'APPROVED' ? '/api/admin/licenses/approve' : '/api/admin/licenses/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
      {bankTransfer ? (
        <section className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-4">
          <h2 className="text-sm font-semibold text-[var(--ds-color-text)]">Onay sonrası iletilecek havale bilgileri</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--ds-color-text-muted)]">Alıcı</dt>
              <dd className="text-sm font-medium text-[var(--ds-color-text)]">{bankTransfer.recipientName}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ds-color-text-muted)]">IBAN</dt>
              <dd className="font-mono text-sm font-medium text-[var(--ds-color-text)]">{bankTransfer.iban}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-[var(--ds-color-text-muted)]">{bankTransfer.relayNote}</p>
        </section>
      ) : null}
      {error ? <p className="text-sm text-[var(--ds-color-danger)]">{error}</p> : null}
      {notice ? <p className="text-sm text-[var(--ds-color-text)]">{notice}</p> : null}
      <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tarih</th>
              <th className="px-4 py-3 font-semibold">Ad Soyad / Unvan</th>
              <th className="px-4 py-3 font-semibold">TCKN / VKN</th>
              <th className="px-4 py-3 font-semibold">İletişim</th>
              <th className="px-4 py-3 font-semibold">Donanım kimliği</th>
              <th className="px-4 py-3 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--ds-color-text-muted)]">
                  Bekleyen masaüstü lisans talebi yok.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--ds-color-border)] last:border-b-0">
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{formatDateTime(item.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{item.fullName}</td>
                  <td className="px-4 py-3">{item.taxNumber}</td>
                  <td className="px-4 py-3">
                    <div>{item.email}</div>
                    <div className="text-xs text-[var(--ds-color-text-muted)]">{item.address}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{item.hardwareId ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => updateStatus(item.id, 'APPROVED')}
                        className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--ds-color-secondary)] disabled:opacity-50"
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => updateStatus(item.id, 'REJECTED')}
                        className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        Reddet
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => setDemo(item.id)}
                        className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        Demo Moda Al
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
