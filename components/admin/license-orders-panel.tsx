'use client'

import { FormEvent, useEffect, useState } from 'react'

import { formInputClassName } from '@/lib/form-styles'

type DisplayStatus = 'provisional' | 'pending' | 'approved' | 'expired' | 'demo'

type Order = {
  id: number
  createdAt: string
  fullName: string
  vkn: string
  email: string
  phone: string
  hwid: string
  packageCode: string
  priceTl: number
  status: string
  displayStatus: DisplayStatus
  licenseKey: string | null
  expiresAt: string | null
  paymentCode: string | null
}

type BankSettings = {
  iban: string
  accountName: string
  notePrefix: string
}

const PACKAGE_LABELS: Record<string, string> = {
  F1: 'Firma Paketi',
  MM50: 'Mali Müşavir 50',
  MM100: 'Mali Müşavir 100',
  MM200: 'Mali Müşavir 200',
}

const BADGES: Record<DisplayStatus, string> = {
  provisional: 'Geçici Aktif (24 Saat) - Ödeme Bekliyor',
  pending: 'Onay Bekliyor',
  approved: 'Onaylı (1 Yıl)',
  expired: 'İptal / Süresi Doldu',
  demo: 'Demo',
}

export function LicenseOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [bank, setBank] = useState<BankSettings>({ iban: '', accountName: 'DOSYORA', notePrefix: 'GT' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const response = await fetch('/api/gibtebligat/license-orders', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Lisans başvuruları okunamadı.')
    }
    const payload = (await response.json()) as { orders: Order[]; bank: BankSettings }
    setOrders(payload.orders)
    setBank(payload.bank)
  }

  useEffect(() => {
    let active = true
    load()
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Lisans başvuruları okunamadı.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function setDemo(order: Order) {
    setBusyId(order.id)
    setNotice('')
    setError('')
    try {
      const response = await fetch('/api/admin/licenses/set-demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hardwareId: order.hwid }),
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

  async function act(id: number, action: 'approve' | 'revoke') {
    setBusyId(id)
    setNotice('')
    setError('')
    try {
      const response = await fetch(`/api/gibtebligat/license-orders/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'İşlem kaydedilemedi.')
      }
      await load()
      setNotice(action === 'approve' ? 'Yıllık lisans üretildi.' : 'Başvuru iptal edildi.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'İşlem kaydedilemedi.')
    } finally {
      setBusyId(null)
    }
  }

  async function saveBank(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    setError('')
    try {
      const response = await fetch('/api/gibtebligat/license-settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(bank),
      })
      const payload = (await response.json()) as BankSettings & { error?: string }
      if (!response.ok) throw new Error(payload.error || 'Banka bilgileri kaydedilemedi.')
      setBank(payload)
      setNotice('Banka bilgileri kaydedildi.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Banka bilgileri kaydedilemedi.')
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Lisans başvuruları</h2>
      <form onSubmit={saveBank} className="grid gap-3 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-4 md:grid-cols-4">
        <label className="space-y-1 text-sm">
          <span>IBAN</span>
          <input value={bank.iban} onChange={(event) => setBank({ ...bank, iban: event.target.value })} className={formInputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Alıcı unvanı</span>
          <input value={bank.accountName} onChange={(event) => setBank({ ...bank, accountName: event.target.value })} className={formInputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Açıklama öneki</span>
          <input value={bank.notePrefix} onChange={(event) => setBank({ ...bank, notePrefix: event.target.value })} className={formInputClassName} />
        </label>
        <button type="submit" className="self-end rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2 text-sm font-semibold text-white">
          Banka bilgisini kaydet
        </button>
      </form>
      {notice ? <p className="text-sm text-[var(--ds-color-text)]">{notice}</p> : null}
      {error ? <p className="text-sm text-[#9F2D2D]">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--ds-color-text-muted)]">Başvurular yükleniyor…</p> : null}
      <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--ds-color-surface-alt)] text-[var(--ds-color-text-muted)]">
            <tr>
              <th className="px-3 py-2 font-medium">Başvuru</th>
              <th className="px-3 py-2 font-medium">Paket</th>
              <th className="px-3 py-2 font-medium">Durum</th>
              <th className="px-3 py-2 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-[var(--ds-color-text-muted)]" colSpan={4}>Başvuru yok.</td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-t border-[var(--ds-color-border)] align-top">
                <td className="px-3 py-2">
                  <p className="font-medium">{order.fullName}</p>
                  <p>{order.vkn} · {order.email}</p>
                  <p className="text-[var(--ds-color-text-muted)]">{order.phone} · {order.paymentCode}</p>
                  <p className="max-w-xs truncate font-mono text-xs">{order.hwid}</p>
                </td>
                <td className="px-3 py-2">{PACKAGE_LABELS[order.packageCode] ?? order.packageCode} · {order.priceTl.toLocaleString('tr-TR')} TL</td>
                <td className="px-3 py-2">{BADGES[order.displayStatus]}</td>
                <td className="space-y-2 px-3 py-2">
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => act(order.id, 'approve')}
                    className="block rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Ödeme Onaylandı (1 Yıla Uzat)
                  </button>
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => act(order.id, 'revoke')}
                    className="block rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                  >
                    İptal Et (Demoya Döndür)
                  </button>
                  {order.status !== 'demo' ? (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => setDemo(order)}
                      className="block rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                    >
                      Demo Moda Al
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
