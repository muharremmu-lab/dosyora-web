'use client'

import { useState } from 'react'

import { Button } from '@/components/ui'

type DemoFormData = {
  fullName: string
  company: string
  phone: string
  email: string
  accountingProgram: string
  monthlyDocuments: string
  note: string
}

const initialFormData: DemoFormData = {
  fullName: '',
  company: '',
  phone: '',
  email: '',
  accountingProgram: '',
  monthlyDocuments: '',
  note: '',
}

const inputClassName =
  'w-full rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-2.5 text-sm text-[var(--ds-color-text)] outline-none transition-shadow focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ds-color-accent)_25%,transparent)]'

export function DemoForm() {
  const [formData, setFormData] = useState<DemoFormData>(initialFormData)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: keyof DemoFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-8 text-center">
        <h2 className="text-xl font-semibold text-[var(--ds-color-text)]">Teşekkür ederiz.</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
          Başvurunuz alınmıştır.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
          Onaylanan kullanıcılara 100 belge okuma hakkı tanımlanacaktır.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Ad Soyad</span>
          <input
            type="text"
            name="fullName"
            required
            autoComplete="name"
            className={inputClassName}
            value={formData.fullName}
            onChange={(event) => handleChange('fullName', event.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Firma</span>
          <input
            type="text"
            name="company"
            required
            autoComplete="organization"
            className={inputClassName}
            value={formData.company}
            onChange={(event) => handleChange('company', event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Telefon</span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            className={inputClassName}
            value={formData.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">E-Posta</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClassName}
            value={formData.email}
            onChange={(event) => handleChange('email', event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">
            Kullandığı Muhasebe Programı
          </span>
          <input
            type="text"
            name="accountingProgram"
            required
            className={inputClassName}
            value={formData.accountingProgram}
            onChange={(event) => handleChange('accountingProgram', event.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Aylık Belge Sayısı</span>
          <input
            type="text"
            name="monthlyDocuments"
            required
            className={inputClassName}
            value={formData.monthlyDocuments}
            onChange={(event) => handleChange('monthlyDocuments', event.target.value)}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Not</span>
        <textarea
          name="note"
          rows={4}
          className={inputClassName}
          value={formData.note}
          onChange={(event) => handleChange('note', event.target.value)}
        />
      </label>

      <Button type="submit" variant="primary" className="w-full px-5 py-2.5 sm:w-auto">
        Gönder
      </Button>
    </form>
  )
}
