import { SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Kullanım Şartları',
  description: 'DOSYORA platform kullanım şartları ve hizmet koşulları.',
  path: '/kullanim-sartlari',
})

export default function KullanimSartlariPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
            Kullanım Şartları
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            Platform kullanım şartları metni bu sayfada yayımlanacaktır.
          </p>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
