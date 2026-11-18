'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export function UnifiedLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          redirectUrl: redirectParam || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı.')
      }

      const target = data.redirectUrl || '/portal'
      // If external redirect
      if (target.startsWith('http://') || target.startsWith('https://')) {
        window.location.href = target
      } else {
        router.push(target)
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Geçersiz kullanıcı adı veya şifre.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-8 shadow-[var(--ds-shadow-lg)]">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-primary)] text-white shadow-sm mb-3">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
          Dosyora Giriş
        </h1>
        <p className="mt-1.5 text-xs text-[var(--ds-color-text-muted)]">
          Tebligat, Belge Okuma, İthalat ve Akıllı Ofis modüllerinize tek girişle erişin.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-[var(--ds-radius-md)] bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1.5">
            E-Posta veya Kullanıcı Adı
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ds-color-text-muted)]" />
            <input
              type="text"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@dosyora.com"
              className="w-full rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-2.5 pl-9 pr-3 text-sm text-[var(--ds-color-text)] focus:border-[var(--ds-color-primary)] focus:bg-[var(--ds-color-surface)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[var(--ds-color-text)]">
              Şifre
            </label>
            <Link
              href="/admin/reset-password"
              className="text-xs text-[var(--ds-color-highlight)] hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ds-color-text-muted)]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-2.5 pl-9 pr-3 text-sm text-[var(--ds-color-text)] focus:border-[var(--ds-color-primary)] focus:bg-[var(--ds-color-surface)] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] py-3 text-sm font-semibold text-white shadow hover:bg-[var(--ds-color-primary-deep)] disabled:opacity-50 ds-transition-hover"
        >
          {loading ? (
            <span>Giriş Yapılıyor...</span>
          ) : (
            <>
              <span>Giriş Yap</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-[var(--ds-color-border)] pt-4 text-center text-xs text-[var(--ds-color-text-muted)]">
        Henüz bir hesabınız veya paketiniz yok mu?{' '}
        <Link href="/fiyatlandirma" className="font-semibold text-[var(--ds-color-highlight)] hover:underline">
          Paketleri İnceleyin
        </Link>
      </div>
    </div>
  )
}
