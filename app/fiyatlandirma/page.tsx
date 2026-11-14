import LicensingView from '@/components/LicensingView'
import { SiteFooter, SiteHeader } from '@/components/marketing'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Kurumsal Lisans ve Ödeme',
  description:
    'Dosyora ürün gamı ve Dosyora Pro Sınırsız yıllık lisans. Fatura bildirimi sonrası ödeme talimatları e-posta ile iletilir. Belgeler yerel bilgisayarda saklanır.',
  path: '/fiyatlandirma',
})

export default function FiyatlandirmaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <LicensingView />
      </main>
      <SiteFooter />
    </>
  )
}
