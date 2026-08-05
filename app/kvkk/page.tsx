import { SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'KVKK',
  description: 'DOSYORA Kişisel Verilerin Korunması Kanunu aydınlatma metni.',
  path: '/kvkk',
})

export default function KvkkPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">KVKK</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            Kişisel Verilerin Korunması Kanunu kapsamındaki aydınlatma metni bu sayfada
            yayımlanacaktır.
          </p>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
