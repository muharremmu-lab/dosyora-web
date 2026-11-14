import LicensingView from '@/components/LicensingView'
import { SiteFooter, SiteHeader } from '@/components/marketing'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Kurumsal Lisans ve Ödeme',
  description:
    'Dosyora Pro yıllık kurumsal lisans. Banka havalesi ile ödeme ve fatura bildirim formu. Belgeler yerel bilgisayarda saklanır.',
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
