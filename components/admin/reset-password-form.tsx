'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Şifre sıfırlanamadı.')
        return
      }

      setCompleted(true)
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--ds-color-text)]">Yeni şifre kaydedildi. Bu şifreyle giriş yapabilirsiniz.</p>
        <Link href="/admin/login" className="text-sm font-medium text-[var(--ds-color-primary)] hover:underline">
          Giriş sayfasına dön
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Admin şifre sıfırlama formu">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Yeni şifre</span>
        <input
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={formInputClassName}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Yeni şifre tekrar</span>
        <input
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={formInputClassName}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-[var(--ds-color-danger)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Şifreyi kaydet
      </Button>
    </form>
  )
}
