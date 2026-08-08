import { ActivateForm } from '@/components/marketing/activate-form'
import { verifyActivationTokenAsync } from '@/lib/activation/service'

export const dynamic = 'force-dynamic'

type ActivatePageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
  const params = await searchParams
  const verification = await verifyActivationTokenAsync(params.token)

  if (!verification.valid) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-8">
          <h1 className="text-2xl font-semibold text-[var(--ds-color-text)]">Bağlantı geçersiz</h1>
          <p className="mt-3 text-sm text-[var(--ds-color-text-muted)]">
            Aktivasyon bağlantınız geçersiz veya süresi dolmuş olabilir. Yeni bir demo talebi oluşturabilir veya
            destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <ActivateForm
        token={params.token ?? ''}
        email={verification.lead.email}
        companyName={verification.lead.company_name}
      />
    </main>
  )
}
