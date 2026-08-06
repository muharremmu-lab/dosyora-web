import { PricingSection, SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Fiyatlandırma',
  description: 'DOSYORA fiyatlandırma planları. Starter, Professional ve Enterprise paketleri yakında.',
  path: '/fiyatlandirma',
})

export default function FiyatlandirmaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="border-b border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <div className="max-w-2xl text-center sm:mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
              Fiyatlandırma
            </h1>
            <p className="mt-4 text-base text-[var(--ds-color-text-muted)]">
              İşletmenizin ölçeğine uygun planlar yakında duyurulacaktır.
            </p>
          </div>
        </SectionContainer>
        <PricingSection />
      </main>
      <SiteFooter />
    </>
  )
}
