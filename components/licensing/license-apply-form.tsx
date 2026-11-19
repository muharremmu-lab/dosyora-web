'use client'

import { FormEvent, useMemo, useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'

const PACKAGES = [
  { code: 'F1', label: 'Firma Paketi', price: '200 TL', detail: '1 firma' },
  { code: 'MM50', label: 'Mali Müşavir 50', price: '500 TL', detail: '50 müşteri' },
  { code: 'MM100', label: 'Mali Müşavir 100', price: '750 TL', detail: '100 müşteri' },
  { code: 'MM200', label: 'Mali Müşavir 200', price: '1.000 TL', detail: '200 müşteri' },
] as const

type ApplyResult = {
  status: 'provisional' | 'pending'
  reused?: boolean
  orderId: number
  packageTitle: string
  priceTl: number
  licenseKey: string | null
  expiresAt: string | null
  bank: { iban: string; accountName: string; descriptionCode: string | null }
}

function formatIban(value: string): string {
  return value.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim()
}

export function LicenseApplyForm({ initialHwid }: { initialHwid: string }) {
  const [hwid, setHwid] = useState(initialHwid.trim().toUpperCase())
  const [packageCode, setPackageCode] = useState<(typeof PACKAGES)[number]['code']>('F1')
  const [fullName, setFullName] = useState('')
  const [vkn, setVkn] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApplyResult | null>(null)
  const hwidFromLink = useMemo(() => /^[0-9A-F]{64}$/i.test(initialHwid.trim()), [initialHwid])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/gibtebligat/license-apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hwid, packageCode, fullName, vkn, email, phone }),
      })
      const payload = (await response.json()) as ApplyResult & { error?: string }
      if (!response.ok) {
        throw new Error(payload.error || 'Başvuru kaydedilemedi.')
      }
      setResult(payload)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Başvuru kaydedilemedi.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
        {result.status === 'provisional' && !result.reused ? (
          <p className="text-base font-medium text-[var(--ds-color-text)]">
            24 saatlik geçici tam yetkiniz tanımlandı. Programı hemen kullanabilirsiniz. Ödeme açıklamasına firma unvanı ve vergi numaranızı yazın; dekont göndermeniz gerekmez.
          </p>
        ) : result.reused ? (
          <p className="text-base font-medium text-[var(--ds-color-text)]">
            Bu donanım kimliği için 24 saatlik geçici yetki zaten tanımlı. Yeni bir süre açılmadı.
          </p>
        ) : (
          <p className="text-base font-medium text-[var(--ds-color-text)]">
            Bu donanım kimliği, IP adresi veya e-posta için 24 saatlik geçici yetki daha önce kullanılmıştır. Başvurunuz kayda alındı.
          </p>
        )}

        {result.licenseKey ? (
          <div>
            <p className="text-sm font-medium text-[var(--ds-color-text)]">Lisans anahtarı</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={result.licenseKey} className={`${formInputClassName} font-mono text-xs`} />
              <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(result.licenseKey || '')}>
                Kopyala
              </Button>
            </div>
            {result.expiresAt ? (
              <p className="mt-2 text-sm text-[var(--ds-color-text-muted)]">
                Geçici bitiş: {new Date(result.expiresAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Info label="IBAN" value={formatIban(result.bank.iban || 'TR170006200118100006594293')} />
          <Info label="Alıcı unvanı" value={result.bank.accountName && result.bank.accountName !== 'DOSYORA' ? result.bank.accountName : 'Ege Mutlu'} />
          <Info label="Açıklama kodu" value={result.bank.descriptionCode || '—'} />
        </div>
        <p className="text-sm text-[var(--ds-color-text-muted)]">
          {result.packageTitle} · {result.priceTl.toLocaleString('tr-TR')} TL (KDV Dahil). Havale açıklaması: {result.bank.descriptionCode}. Dekont göndermeniz gerekmez.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Donanım kimliği (HWID)</span>
        <input
          required
          value={hwid}
          onChange={(event) => setHwid(event.target.value.toUpperCase())}
          readOnly={hwidFromLink}
          spellCheck={false}
          className={`${formInputClassName} font-mono text-xs`}
          placeholder="64 haneli donanım kimliği"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Paket</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PACKAGES.map((item) => (
            <label key={item.code} className="flex cursor-pointer items-start gap-3 rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] p-3">
              <input
                type="radio"
                name="package"
                value={item.code}
                checked={packageCode === item.code}
                onChange={() => setPackageCode(item.code)}
              />
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-sm text-[var(--ds-color-text-muted)]">{item.price} · {item.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Ad soyad / unvan</span>
        <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className={formInputClassName} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">VKN / TCKN</span>
          <input required inputMode="numeric" value={vkn} onChange={(event) => setVkn(event.target.value.replace(/\D/g, '').slice(0, 11))} className={formInputClassName} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Telefon</span>
          <input required value={phone} onChange={(event) => setPhone(event.target.value)} className={formInputClassName} />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">E-posta</span>
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={formInputClassName} />
      </label>
      {error ? <p className="text-sm text-[#9F2D2D]">{error}</p> : null}
      <Button type="submit" loading={loading}>Başvuruyu tamamla</Button>
    </form>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-surface-alt)] p-3">
      <p className="text-xs text-[var(--ds-color-text-muted)]">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold">{value}</p>
    </div>
  )
}
