'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui'
import { parseContactFormType, type ContactFormType } from '@/lib/contact-routes'
import { formInputClassName } from '@/lib/form-styles'
import { cn } from '@/lib/design-system/cn'

type CentralContactFormProps = {
  defaultType?: ContactFormType
}

type DemoFormState = {
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

type RequestFormState = {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
  kvkkConsent: boolean
}

const initialDemoForm: DemoFormState = {
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

const initialRequestForm: RequestFormState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  kvkkConsent: false,
}

export function CentralContactForm({ defaultType = 'request' }: CentralContactFormProps) {
  const [formType, setFormType] = useState<ContactFormType>(defaultType)
  const [demoForm, setDemoForm] = useState<DemoFormState>(initialDemoForm)
  const [requestForm, setRequestForm] = useState<RequestFormState>(initialRequestForm)
  const [submitted, setSubmitted] = useState(false)
  const [submittedType, setSubmittedType] = useState<ContactFormType>('request')
  const [documentLimit, setDocumentLimit] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFormType(defaultType)
  }, [defaultType])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const type = parseContactFormType(params.get('type'))
    setFormType(type)

    if (window.location.hash === '#iletisim') {
      window.requestAnimationFrame(() => {
        document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (formType === 'demo') {
        const { submitDemoLead } = await import('@/services/leads-api')
        const result = await submitDemoLead({
          company: demoForm.company,
          fullName: demoForm.fullName,
          email: demoForm.email,
          phone: demoForm.phone,
          employeeCount: demoForm.employeeCount,
          monthlyDocuments: demoForm.monthlyDocuments,
          accountingProgram: demoForm.accountingProgram,
          message: demoForm.message,
          source: 'website',
        })
        setDemoForm(initialDemoForm)
        setDocumentLimit(result.documentLimit)
        setSubmittedType('demo')
      } else {
        const { submitContactMessage } = await import('@/services/leads-api')
        await submitContactMessage({
          fullName: requestForm.fullName,
          email: requestForm.email,
          phone: requestForm.phone,
          subject: requestForm.subject,
          message: requestForm.message,
        })
        setRequestForm(initialRequestForm)
        setSubmittedType('request')
      }

      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gönderim başarısız.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    if (submittedType === 'demo') {
      return (
        <div
          role="status"
          aria-live="polite"
          className="rounded-[var(--ds-radius-lg)] border border-[color:color-mix(in_srgb,var(--ds-color-success)_35%,var(--ds-color-border))] bg-[color:color-mix(in_srgb,var(--ds-color-success)_6%,var(--ds-color-surface))] p-8 text-center"
        >
          <h2 className="text-xl font-semibold text-[var(--ds-color-text)]">
            DOSYORA demo hesabınız hazır.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            {documentLimit
              ? `${documentLimit} ücretsiz belge hakkınız tanımlandı.`
              : 'Demo hesabınız oluşturuldu.'}{' '}
            Aktivasyon bağlantısı e-posta adresinize gönderildi; bağlantıya tıklayarak şifrenizi
            belirleyip giriş yapabilirsiniz.
          </p>
        </div>
      )
    }

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
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="İletişim formu">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[var(--ds-color-text)]">Talep türü</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: 'demo', label: 'Demo Talebi' },
              { value: 'request', label: 'İstek / Öneri' },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-[var(--ds-radius-md)] border px-4 py-3 text-sm font-medium ds-transition-hover',
                formType === option.value
                  ? 'border-[var(--ds-color-primary)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,var(--ds-color-surface))] text-[var(--ds-color-primary)]'
                  : 'border-[var(--ds-color-border)] text-[var(--ds-color-text-muted)] hover:border-[var(--ds-color-primary)]',
              )}
            >
              <input
                type="radio"
                name="formType"
                value={option.value}
                checked={formType === option.value}
                onChange={() => setFormType(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {formType === 'demo' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--ds-color-text)]">Ad Soyad</span>
              <input
                type="text"
                name="fullName"
                required
                autoComplete="name"
                className={formInputClassName}
                value={demoForm.fullName}
                onChange={(event) => setDemoForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--ds-color-text)]">Firma</span>
              <input
                type="text"
                name="company"
                required
                autoComplete="organization"
                className={formInputClassName}
                value={demoForm.company}
                onChange={(event) => setDemoForm((current) => ({ ...current, company: event.target.value }))}
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
                className={formInputClassName}
                value={demoForm.phone}
                onChange={(event) => setDemoForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--ds-color-text)]">E-posta</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className={formInputClassName}
                value={demoForm.email}
                onChange={(event) => setDemoForm((current) => ({ ...current, email: event.target.value }))}
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
                className={formInputClassName}
                value={demoForm.employeeCount}
                onChange={(event) =>
                  setDemoForm((current) => ({ ...current, employeeCount: event.target.value }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--ds-color-text)]">Aylık Belge Sayısı</span>
              <input
                type="text"
                name="monthlyDocuments"
                required
                className={formInputClassName}
                value={demoForm.monthlyDocuments}
                onChange={(event) =>
                  setDemoForm((current) => ({ ...current, monthlyDocuments: event.target.value }))
                }
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
              className={formInputClassName}
              value={demoForm.accountingProgram}
              onChange={(event) =>
                setDemoForm((current) => ({ ...current, accountingProgram: event.target.value }))
              }
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Mesaj</span>
            <textarea
              name="message"
              rows={4}
              className={formInputClassName}
              value={demoForm.message}
              onChange={(event) => setDemoForm((current) => ({ ...current, message: event.target.value }))}
            />
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="kvkkConsent"
              required
              checked={demoForm.kvkkConsent}
              onChange={(event) =>
                setDemoForm((current) => ({ ...current, kvkkConsent: event.target.checked }))
              }
              className="mt-1 size-4 rounded border-[var(--ds-color-border)]"
            />
            <span className="text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              <Link href="/kvkk" className="font-medium text-[var(--ds-color-primary)] hover:underline">
                Kişisel Verilerin Korunması Aydınlatma Metni
              </Link>
              &apos;ni okudum ve onaylıyorum.
            </span>
          </label>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--ds-color-text)]">Ad Soyad</span>
              <input
                type="text"
                name="fullName"
                required
                autoComplete="name"
                className={formInputClassName}
                value={requestForm.fullName}
                onChange={(event) =>
                  setRequestForm((current) => ({ ...current, fullName: event.target.value }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--ds-color-text)]">E-posta</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className={formInputClassName}
                value={requestForm.email}
                onChange={(event) =>
                  setRequestForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Telefon (opsiyonel)</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              className={formInputClassName}
              value={requestForm.phone}
              onChange={(event) =>
                setRequestForm((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Konu</span>
            <input
              type="text"
              name="subject"
              required
              className={formInputClassName}
              value={requestForm.subject}
              onChange={(event) =>
                setRequestForm((current) => ({ ...current, subject: event.target.value }))
              }
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Mesaj</span>
            <textarea
              name="message"
              rows={5}
              required
              className={formInputClassName}
              value={requestForm.message}
              onChange={(event) =>
                setRequestForm((current) => ({ ...current, message: event.target.value }))
              }
            />
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="kvkkConsent"
              required
              checked={requestForm.kvkkConsent}
              onChange={(event) =>
                setRequestForm((current) => ({ ...current, kvkkConsent: event.target.checked }))
              }
              className="mt-1 size-4 rounded border-[var(--ds-color-border)]"
            />
            <span className="text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              <Link href="/kvkk" className="font-medium text-[var(--ds-color-primary)] hover:underline">
                Kişisel Verilerin Korunması Aydınlatma Metni
              </Link>
              &apos;ni okudum ve onaylıyorum.
            </span>
          </label>
        </>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="w-full px-5 py-2.5 sm:w-auto"
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
