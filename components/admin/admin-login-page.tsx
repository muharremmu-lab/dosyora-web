import Link from 'next/link'

import { Card, SectionContainer } from '@/components/ui'

import { AdminLoginForm } from './login-form'

export function AdminLoginPage() {
  return (
    <SectionContainer className="flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[var(--ds-color-text)]">Admin Girişi</h1>
        <p className="mt-2 text-sm text-[var(--ds-color-text-muted)]">
          Demo talepleri ve iletişim mesajlarını yönetmek için giriş yapın.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-[var(--ds-color-text-muted)]">
          <Link href="/" className="font-medium text-[var(--ds-color-primary)] hover:underline">
            Ana sayfaya dön
          </Link>
        </p>
      </Card>
    </SectionContainer>
  )
}
