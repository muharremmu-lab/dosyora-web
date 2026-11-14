import { ProductFamilySection, SiteFooter, SiteHeader } from '@/components/marketing'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'GibTebligat Pro İndir',
  description:
    'GibTebligat Pro Windows masaüstü uygulamasını indirin. Otomatik GİB e-Tebligat tarama, PDF arşivleme ve 14 gün ücretsiz deneme.',
  path: '/indir',
})

export default function IndirPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ProductFamilySection headingLevel="h1" />
      </main>
      <SiteFooter />
    </>
  )
}
