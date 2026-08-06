'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'

type DemoFormData = {
  fullName: string
  company: string
  phone: string
  email: string
  employeeCount: string
  monthlyDocuments: string
  accountingProgram: string
  message: string
  kvkkConsent: boolean
}

const initialFormData: DemoFormData = {
  fullName: '',
  company: '',
  phone: '',
  email: '',
  employeeCount: '',
  monthlyDocuments: '',
  accountingProgram: '',
  message: '',
  kvkkConsent: false,
}

export function DemoForm() {
  const [formData, setFormData] = useState<DemoFormData>(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const [documentLimit, setDocumentLimit] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof DemoFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { submitDemoLead } = await import('@/services/leads-api')
      const result = await submitDemoLead({
        company: formData.company,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        employeeCount: formData.employeeCount,
        monthlyDocuments: formData.monthlyDocuments,
        accountingProgram: formData.accountingProgram,
        message: formData.message,
        source: 'website',
      })

      setFormData(initialFormData)
      setDocumentLimit(result.documentLimit)
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
        <h2 className="text-xl font-semibold text-[var(--ds-color-text)]">Teşekkür ederiz.</h2>
        <ul className="mt-4 space-y-2 text-left text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="text-[var(--ds-color-success)]">
              ✓
            </span>
            <span>Demo hesabınız oluşturuldu.</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="text-[var(--ds-color-success)]">
              ✓
            </span>
            <span>
              {documentLimit
                ? `Belge hakkınız tanımlandı (${documentLimit} belge).`
                : 'Belge hakkınız tanımlandı.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="text-[var(--ds-color-success)]">
              ✓
            </span>
            <span>Müşteri Girişi üzerinden hesabınıza erişebilirsiniz.</span>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Demo talep formu">
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
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Firma</span>
          <input
            type="text"
            name="company"
            required
            autoComplete="organization"
            aria-required="true"
            className={formInputClassName}
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
            aria-required="true"
            className={formInputClassName}
            value={formData.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
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
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Çalışan Sayısı</span>
          <input
            type="text"
            name="employeeCount"
            required
            aria-required="true"
            className={formInputClassName}
            value={formData.employeeCount}
            onChange={(event) => handleChange('employeeCount', event.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ds-color-text)]">Aylık Belge Sayısı</span>
          <input
            type="text"
            name="monthlyDocuments"
            required
            aria-required="true"
            className={formInputClassName}
            value={formData.monthlyDocuments}
            onChange={(event) => handleChange('monthlyDocuments', event.target.value)}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">
          Kullandığı Muhasebe Programı
        </span>
        <input
          type="text"
          name="accountingProgram"
          required
          aria-required="true"
          className={formInputClassName}
          value={formData.accountingProgram}
          onChange={(event) => handleChange('accountingProgram', event.target.value)}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Mesaj</span>
        <textarea
          name="message"
          rows={4}
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
        aria-label="Demo talebini gönder"
      >
        Gönder
      </Button>

      {error ? (
        <p role="alert" className="whitespace-pre-line text-sm text-[var(--ds-color-danger)]">
          {error}
        </p>
      ) : null}
    </form>
  )
}
