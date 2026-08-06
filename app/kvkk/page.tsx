import { SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Kişisel Verilerin Korunması',
  description: 'DOSYORA Kişisel Verilerin Korunması Kanunu aydınlatma metni.',
  path: '/kvkk',
})

export default function KvkkPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <SectionContainer
          className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
          aria-labelledby="kvkk-heading"
        >
          <h1 id="kvkk-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
            Kişisel Verilerin Korunması
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki aydınlatma metni bu sayfada
            yayımlanacaktır. Veri sorumlusu olarak DOSYORA, kişisel verilerinizi mevzuata uygun şekilde
            işlemektedir.
          </p>
          <div className="mt-8 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-6">
            <h2 className="text-base font-semibold text-[var(--ds-color-text)]">Placeholder içerik</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              Aydınlatma metni, veri işleme amaçları, hukuki sebepler ve başvuru yöntemleri bu bölümde
              yer alacaktır.
            </p>
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
