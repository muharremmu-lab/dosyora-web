'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, Card } from '@/components/ui'
import { ACCOUNT_STATUSES, type AccountStatus, type DemoLead } from '@/lib/db/types'
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
  ACTIVATION_STATUS_LABELS,
  PROVISION_STATUS_LABELS,
  formatDocumentQuotaLabel,
} from '@/lib/admin/labels'
import { formInputClassName } from '@/lib/form-styles'

const DOCUMENT_LIMIT_PRESETS = [100, 250, 500, 1000]

type DemoLeadDetailFormProps = {
  lead: DemoLead
}

export function DemoLeadDetailForm({ lead }: DemoLeadDetailFormProps) {
  const router = useRouter()
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(
    lead.account_status ?? 'ACTIVE',
  )
  const [documentLimit, setDocumentLimit] = useState(String(lead.document_limit ?? 100))
  const [loading, setLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const quota = formatDocumentQuotaLabel(lead)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const parsedLimit = Number.parseInt(documentLimit, 10)
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      setError('Geçerli bir belge limiti girin.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/demo-leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_status: accountStatus,
          document_limit: parsedLimit,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        setError(payload.error ?? 'Kayıt güncellenemedi.')
        return
      }

      setMessage('Kayıt güncellendi.')
      router.refresh()
    } catch {
      setError('Bağlantı hatası.')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!window.confirm('Bu demo kaydını arşivlemek istediğinize emin misiniz?')) {
      return
    }

    setArchiveLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/demo-leads/${lead.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        setError(payload.error ?? 'Arşivleme başarısız.')
        return
      }

      setMessage('Kayıt arşivlendi.')
      router.refresh()
    } catch {
      setError('Bağlantı hatası.')
    } finally {
      setArchiveLoading(false)
    }
  }

  return (    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Demo Hesap Bilgileri</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Firma</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.company_name}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Yetkili</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.contact_name}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">E-posta</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Telefon</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.phone}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Hesap Türü</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">
              {lead.account_type ? ACCOUNT_TYPE_LABELS[lead.account_type] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Aktivasyon Durumu</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">
              {lead.activation_status ? ACTIVATION_STATUS_LABELS[lead.activation_status] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Belge Limiti</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{quota.limit}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Kullanılan Belge</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.used_documents}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Kalan Belge</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{quota.remaining}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Provisioning Durumu</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">
              {lead.provision_status ? PROVISION_STATUS_LABELS[lead.provision_status] ?? lead.provision_status : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">BelgeOkumaWeb User ID</dt>
            <dd className="break-all font-medium text-[var(--ds-color-text)]">{lead.customer_user_id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">BelgeOkumaWeb Company ID</dt>
            <dd className="break-all font-medium text-[var(--ds-color-text)]">{lead.customer_company_id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Provisioned At</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.provisioned_at ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">IP</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.ip_address ?? '—'}</dd>
          </div>
        </dl>
        {lead.message ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--ds-color-text)]">Mesaj</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              {lead.message}
            </p>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Yönetim</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" aria-label="Demo hesabı güncelleme formu">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Belge Limiti</span>
            <input
              type="number"
              min={1}
              required
              className={formInputClassName}
              value={documentLimit}
              onChange={(event) => setDocumentLimit(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {DOCUMENT_LIMIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-1.5 text-xs font-medium text-[var(--ds-color-text)] ds-transition-hover hover:bg-[var(--ds-color-surface-alt)]"
                onClick={() => setDocumentLimit(String(preset))}
              >
                {preset}
              </button>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Durum</span>
            <select
              className={formInputClassName}
              value={accountStatus}
              onChange={(event) => setAccountStatus(event.target.value as AccountStatus)}
            >
              {ACCOUNT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {ACCOUNT_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>

          {message ? (
            <p role="status" className="text-sm text-[var(--ds-color-success)]">
              {message}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-[var(--ds-color-danger)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" loading={loading}>
            Kaydet
          </Button>

          {lead.account_type === 'DEMO' ? (
            <Button type="button" variant="secondary" loading={archiveLoading} onClick={handleArchive}>
              Arşivle
            </Button>
          ) : null}
        </form>      </Card>
    </div>
  )
}
