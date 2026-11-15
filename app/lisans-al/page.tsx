import { SiteFooter, SiteHeader } from '@/components/marketing'
import { LicenseApplyForm } from '@/components/licensing/license-apply-form'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'GibTebligat Pro Lisans Al',
  description: 'GibTebligat Pro paket başvurusu. Aynı donanım, IP veya e-posta daha önce kullanmadıysa 24 saatlik geçici tam yetki hemen tanımlanır.',
  path: '/lisans-al',
})

type LicensePageProps = {
  searchParams: Promise<{ hwid?: string }>
}

export default async function LicenseApplyPage({ searchParams }: LicensePageProps) {
  const params = await searchParams
  const hwid = typeof params.hwid === 'string' ? params.hwid : ''

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <SectionContainer>
          <h1 className="text-3xl font-bold tracking-tight">Lisans başvurusu</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ds-color-text-muted)]">
            Paketinizi seçin. Aynı donanım kimliği, IP adresi veya e-posta daha önce 24 saatlik geçici yetki kullanmadıysa anahtarınız hemen üretilir.
          </p>
          <div className="mt-8 max-w-3xl">
            <LicenseApplyForm initialHwid={hwid} />
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
