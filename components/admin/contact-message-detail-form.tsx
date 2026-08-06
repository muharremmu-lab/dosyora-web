'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, Card } from '@/components/ui'
import { CONTACT_MESSAGE_STATUSES, type ContactMessage, type ContactMessageStatus } from '@/lib/db/types'
import { CONTACT_STATUS_LABELS } from '@/lib/admin/labels'
import { formInputClassName } from '@/lib/form-styles'

type ContactMessageDetailFormProps = {
  message: ContactMessage
}

export function ContactMessageDetailForm({ message }: ContactMessageDetailFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<ContactMessageStatus>(message.status)
  const [notes, setNotes] = useState(message.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)
    setError(null)

    try {
      const response = await fetch(`/api/contact-messages/${message.id}`, {
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
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Mesaj Bilgileri</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Ad Soyad</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{message.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">E-posta</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{message.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Telefon</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{message.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--ds-color-text-muted)]">Konu</dt>
            <dd className="font-medium text-[var(--ds-color-text)]">{message.subject}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--ds-color-text)]">Mesaj</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            {message.message}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">Yönetim</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" aria-label="İletişim mesajı güncelleme formu">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Durum</span>
            <select
              className={formInputClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value as ContactMessageStatus)}
            >
              {CONTACT_MESSAGE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {CONTACT_STATUS_LABELS[item]}
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
