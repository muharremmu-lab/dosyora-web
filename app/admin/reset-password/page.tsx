import Link from 'next/link'

import { ResetPasswordForm } from '@/components/admin/reset-password-form'
import { Card, SectionContainer } from '@/components/ui'

export const dynamic = 'force-dynamic'

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token?.trim() ?? ''

  return (
    <SectionContainer className="flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[var(--ds-color-text)]">Şifre sıfırlama</h1>
        {token.length < 20 ? (
          <p className="mt-3 text-sm text-[var(--ds-color-text-muted)]">
            Sıfırlama bağlantısı geçersiz. Giriş sayfasından yeni bir talimat isteyin.
          </p>
        ) : (
          <div className="mt-6">
            <ResetPasswordForm token={token} />
          </div>
        )}
        <p className="mt-6 text-center text-sm text-[var(--ds-color-text-muted)]">
          <Link href="/admin/login" className="font-medium text-[var(--ds-color-primary)] hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>
      </Card>
    </SectionContainer>
  )
}
