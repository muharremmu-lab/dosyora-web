'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'

type ResetPasswordFormProps = {
  token?: string
}

export function ResetPasswordForm({ token = '' }: ResetPasswordFormProps) {
  const [resetCode, setResetCode] = useState(token)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const codeToUse = resetCode.trim()
    if (!codeToUse) {
      setError('Lütfen 6 haneli sıfırlama kodunu veya bağlantı token’ını girin.')
      return
    }

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
        body: JSON.stringify({ token: codeToUse, code: codeToUse, password }),
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
        <div className="rounded-[var(--ds-radius-md)] bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
          Yeni admin şifreniz başarıyla kaydedildi. Artık bu şifreyle giriş yapabilirsiniz.
        </div>
        <Link
          href="/admin/login"
          className="inline-flex w-full justify-center rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] py-2 text-sm font-semibold text-white shadow hover:bg-[var(--ds-color-primary-deep)] ds-transition-hover"
        >
          Giriş Sayfasına Git
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Admin şifre sıfırlama formu">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">
          Sıfırlama Kodu veya Token
        </span>
        <input
          type="text"
          required
          autoFocus={!token}
          placeholder="6 haneli kod (örn: 481920) veya bağlantı token’ı"
          className={formInputClassName}
          value={resetCode}
          onChange={(event) => setResetCode(event.target.value)}
        />
        <span className="text-xs text-[var(--ds-color-text-muted)]">
          E-postanıza gelen veya sistem yöneticisi loglarındaki 6 haneli kodu buraya girebilirsiniz.
        </span>
      </label>

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
        Şifreyi Güncelle
      </Button>
    </form>
  )
}
