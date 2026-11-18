import { Suspense } from 'react'

import { UnifiedLoginForm } from '@/components/auth/unified-login-form'

export const metadata = {
  title: 'Giriş Yap | Dosyora',
  description: 'Dosyora müşteri ve modül yönetim portalı tek giriş ekranı.',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-gray-500">Yükleniyor...</div>}>
        <UnifiedLoginForm />
      </Suspense>
    </main>
  )
}
