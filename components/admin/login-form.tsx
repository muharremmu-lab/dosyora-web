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
        <span className="text-sm font-medium text-[var(--ds-color-text)]">Kullanıcı adı</span>
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
    </form>
  )
}
