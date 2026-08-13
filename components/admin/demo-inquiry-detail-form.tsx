'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, Card } from '@/components/ui'
import { LEAD_STATUS_LABELS } from '@/lib/admin/labels'
import { LEAD_STATUSES, type DemoLead, type LeadStatus } from '@/lib/db/types'
import { formInputClassName } from '@/lib/form-styles'

type DemoInquiryDetailFormProps = {
  lead: DemoLead
}

export function DemoInquiryDetailForm({ lead }: DemoInquiryDetailFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)
    setError(null)

    try {
      const response = await fetch(`/api/demo-leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        setError(payload.error ?? 'Kayıt güncellenemedi.')
        return
      }

      setFeedback('Kayıt güncellendi.')
      router.refresh()
    } catch {
      setError('Bağlantı hatası.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Demo Talebi</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Ad Soyad</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.contact_name}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Firma</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.company_name}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Telefon</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.phone}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">E-posta</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Çalışan Sayısı</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{lead.employee_count ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Aylık Belge Sayısı</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">
              {lead.monthly_document_count ?? '—'}
            </dd>
          </div>
        </dl>
        {lead.message ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--ds-color-text)]">Mesaj / Ek Bilgiler</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              {lead.message}
            </p>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Yönetim</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" aria-label="Demo talebi güncelleme formu">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Durum</span>
            <select
              className={formInputClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value as LeadStatus)}
            >
              {LEAD_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {LEAD_STATUS_LABELS[item] ?? item}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Notlar</span>
            <textarea
              rows={6}
              className={formInputClassName}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          {feedback ? (
            <p role="status" className="text-sm text-[var(--ds-color-success)]">
              {feedback}
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
        </form>
      </Card>
    </div>
  )
}
