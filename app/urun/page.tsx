import {
  FinalCtaSection,
  ProductVersionsSection,
  SiteFooter,
  SiteHeader,
} from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Ürün',
  description:
    'DOSYORA V1 belge okuma ve arşivden V4 sektörel çözümlere kadar tüm sürüm planını keşfedin.',
  path: '/urun',
})

export default function UrunPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="border-b border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
              DOSYORA Ürün Ailesi
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--ds-color-text-muted)] sm:text-lg">
              Belge okuma ve arşivden Akıllı Ofis, belge üretme ve sektörel çözümlere uzanan
              modüler platform yol haritası.
            </p>
          </div>
        </SectionContainer>

        <ProductVersionsSection />

        <FinalCtaSection
          title="100 Belge Ücretsiz Ön İzleme"
          description="Onaylanan firmalara 100 belge okuma hakkı tanımlanacaktır."
          buttonLabel="Demo Talep Et"
        />
      </main>
      <SiteFooter />
    </>
  )
}
