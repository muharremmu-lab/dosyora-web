import Link from 'next/link'

import { getCustomerLoginUnavailableMessage } from '@/lib/customer-portal'

export default function LoginUnavailablePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-[var(--ds-color-text)]">Müşteri girişi henüz hazır değil</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
        {getCustomerLoginUnavailableMessage()}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex w-fit rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-4 py-2 text-sm font-medium text-[var(--ds-color-text)]"
      >
        Ana sayfaya dön
      </Link>
    </main>
  )
}
