import { SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Gizlilik',
  description: 'DOSYORA gizlilik politikası.',
  path: '/gizlilik',
})

export default function GizlilikPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
            Gizlilik Politikası
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            Gizlilik politikası metni bu sayfada yayımlanacaktır.
          </p>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
