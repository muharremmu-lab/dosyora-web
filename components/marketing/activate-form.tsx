'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'
import { getCustomerLoginUrl, getCustomerLoginUnavailableMessage } from '@/lib/customer-portal'

type ActivateFormProps = {
  token: string
  email: string
  companyName: string
}

export function ActivateForm({ token, email, companyName }: ActivateFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 10) {
      setError('Şifre en az 10 karakter olmalıdır.')
      return
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/demo-activation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Aktivasyon başarısız.')
      }

      setCompleted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Aktivasyon başarısız.')
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    const loginUrl = getCustomerLoginUrl()
    const loginUnavailable = loginUrl === '/login-unavailable'

    return (
      <div className="mx-auto max-w-lg rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-8">
        <h1 className="text-2xl font-semibold text-[var(--ds-color-text)]">Hesabınız aktive edildi</h1>
        <p className="mt-3 text-sm text-[var(--ds-color-text-muted)]">
          {loginUnavailable
            ? getCustomerLoginUnavailableMessage()
            : 'Artık DOSYORA demo hesabınıza giriş yapabilirsiniz.'}
        </p>
        {!loginUnavailable ? (
          <Link
            href={loginUrl}
            className="mt-6 inline-flex rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2 text-sm font-medium text-[var(--ds-color-secondary)]"
          >
            Giriş yap
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-8">
      <h1 className="text-2xl font-semibold text-[var(--ds-color-text)]">Demo hesabınızı aktive edin</h1>
      <p className="mt-3 text-sm text-[var(--ds-color-text-muted)]">
        {companyName} için {email} adresine tanımlanan demo hesabınız için şifrenizi belirleyin.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Yeni şifre</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={formInputClassName}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Şifre tekrar</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={formInputClassName}
            autoComplete="new-password"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Şifremi oluştur'}
        </Button>
      </form>
    </div>
  )
}
