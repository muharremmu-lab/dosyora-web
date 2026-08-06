'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'

type ContactFormData = {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
  kvkkConsent: boolean
}

const initialFormData: ContactFormData = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  kvkkConsent: false,
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { submitContactMessage } = await import('@/services/leads-api')
      await submitContactMessage({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      })

      setFormData(initialFormData)
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gönderim başarısız.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[var(--ds-radius-lg)] border border-[color:color-mix(in_srgb,var(--ds-color-success)_35%,var(--ds-color-border))] bg-[color:color-mix(in_srgb,var(--ds-color-success)_6%,var(--ds-color-surface))] p-8 text-center"
      >
        <h2 className="text-xl font-semibold text-[var(--ds-color-text)]">Mesajınız alındı.</h2>
        <p className="mt-3 text-sm text-[var(--ds-color-text-muted)]">
          En kısa sürede sizinle iletişime geçeceğiz.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="İletişim formu">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Ad Soyad</span>
          <input
            type="text"
            name="fullName"
            required
            autoComplete="name"
            aria-required="true"
            className={formInputClassName}
            value={formData.fullName}
            onChange={(event) => handleChange('fullName', event.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">E-posta</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            aria-required="true"
            className={formInputClassName}
            value={formData.email}
            onChange={(event) => handleChange('email', event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Telefon</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className={formInputClassName}
            value={formData.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Konu</span>
          <input
            type="text"
            name="subject"
            required
            aria-required="true"
            className={formInputClassName}
            value={formData.subject}
            onChange={(event) => handleChange('subject', event.target.value)}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Mesaj</span>
        <textarea
          name="message"
          rows={5}
          required
          aria-required="true"
          className={formInputClassName}
          value={formData.message}
          onChange={(event) => handleChange('message', event.target.value)}
        />
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="kvkkConsent"
          required
          aria-required="true"
          checked={formData.kvkkConsent}
          onChange={(event) => handleChange('kvkkConsent', event.target.checked)}
          className="mt-1 size-4 rounded border-[var(--ds-color-border)]"
        />
        <span className="text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
          <Link href="/kvkk" className="font-medium text-[var(--ds-color-primary)] hover:underline">
            Kişisel Verilerin Korunması Aydınlatma Metni
          </Link>
          &apos;ni okudum ve onaylıyorum.
        </span>
      </label>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="w-full px-5 py-2.5 sm:w-auto"
        aria-label="İletişim mesajını gönder"
      >
        Gönder
      </Button>

      {error ? (
        <p role="alert" className="text-sm text-[var(--ds-color-danger)]">
          {error}
        </p>
      ) : null}
    </form>
  )
}
