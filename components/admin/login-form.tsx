'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui'
import { formInputClassName } from '@/lib/form-styles'

export function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        setError(payload.error ?? 'Giriş başarısız.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Admin giriş formu">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Kullanıcı adı veya e-posta</span>
        <input
          type="text"
          name="username"
          required
          autoComplete="username"
          className={formInputClassName}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Şifre</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={formInputClassName}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-[var(--ds-color-danger)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Giriş Yap
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm font-medium text-[var(--ds-color-primary)] hover:underline"
          onClick={() => {
            setResetOpen(true)
            setResetMessage(null)
            setResetError(null)
          }}
        >
          Şifremi Unuttum
        </button>
      </div>

      {resetOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reset-title"
            className="w-full max-w-md rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6 shadow-[var(--ds-shadow-md)]"
          >
            <h2 id="admin-reset-title" className="text-lg font-bold text-[var(--ds-color-text)]">
              Şifre sıfırlama
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              Kayıtlı yönetici e-posta adresine 30 dakika geçerli, tek kullanımlık bir sıfırlama bağlantısı gönderilir.
              Mevcut şifre e-postada yer almaz.
            </p>
            {resetMessage ? (
              <p className="mt-4 text-sm text-[var(--ds-color-text)]">{resetMessage}</p>
            ) : null}
            {resetError ? (
              <p role="alert" className="mt-4 text-sm text-[var(--ds-color-danger)]">
                {resetError}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setResetOpen(false)}>
                Kapat
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={resetLoading}
                onClick={async () => {
                  setResetLoading(true)
                  setResetError(null)
                  setResetMessage(null)
                  try {
                    const response = await fetch('/api/admin/forgot-password', { method: 'POST' })
                    const payload = (await response.json()) as { error?: string; message?: string }
                    if (!response.ok) {
                      setResetError(payload.error ?? 'Talimat gönderilemedi.')
                      return
                    }
                    setResetMessage(payload.message ?? 'Sıfırlama talimatı gönderildi.')
                  } catch {
                    setResetError('Bağlantı hatası. Lütfen tekrar deneyin.')
                  } finally {
                    setResetLoading(false)
                  }
                }}
              >
                Talimat gönder
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}
