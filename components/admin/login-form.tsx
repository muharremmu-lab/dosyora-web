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
  const [resetEmail, setResetEmail] = useState('muharrem@dosyora.com')
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
              Admin Şifre Sıfırlama
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              Seçilen yönetici hesabı için sıfırlama bağlantısı ve 6 haneli doğrulama kodu oluşturulur.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                Yönetici Hesabı:
              </label>
              <select
                className={formInputClassName}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              >
                <option value="muharrem@dosyora.com">muharrem@dosyora.com (Muharrem)</option>
                <option value="ege@dosyora.com">ege@dosyora.com (Ege)</option>
              </select>
            </div>

            {resetMessage ? (
              <div className="mt-4 rounded bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900 space-y-2">
                <p>{resetMessage}</p>
                <div className="pt-2 border-t border-blue-200 flex justify-end">
                  <button
                    type="button"
                    className="font-semibold text-blue-700 underline text-xs"
                    onClick={() => router.push('/admin/reset-password')}
                  >
                    Kod ile Şifre Sıfırlama Ekranına Git →
                  </button>
                </div>
              </div>
            ) : null}

            {resetError ? (
              <p role="alert" className="mt-4 text-sm text-[var(--ds-color-danger)]">
                {resetError}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                className="text-xs text-[var(--ds-color-primary)] hover:underline"
                onClick={() => router.push('/admin/reset-password')}
              >
                Zaten kodum var →
              </button>
              <div className="flex gap-2">
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
                      const response = await fetch('/api/admin/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: resetEmail }),
                      })
                      const payload = (await response.json()) as { error?: string; message?: string }
                      if (!response.ok) {
                        setResetError(payload.error ?? 'Talimat gönderilemedi.')
                        return
                      }
                      setResetMessage(payload.message ?? 'Sıfırlama talimatı ve kod oluşturuldu.')
                    } catch {
                      setResetError('Bağlantı hatası. Lütfen tekrar deneyin.')
                    } finally {
                      setResetLoading(false)
                    }
                  }}
                >
                  Talimat Gönder
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}
