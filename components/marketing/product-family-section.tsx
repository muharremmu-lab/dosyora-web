import { Badge, SectionContainer } from '@/components/ui'
import { homepageScrollMt, homepageSectionY } from '@/lib/homepage-content'

import { GibLicensePanel } from './gib-license-panel'

export function ProductFamilySection() {
  return (
    <SectionContainer
      id="urun-ailesi"
      className={`bg-[var(--ds-color-surface)] ${homepageSectionY} ${homepageScrollMt}`}
      aria-labelledby="product-family-heading"
    >
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ds-color-primary)]">
          Dosyora ürün ailesi
        </p>
        <h1
          id="product-family-heading"
          className="mt-3 text-[1.75rem] font-bold leading-[1.15] tracking-tight text-[var(--ds-color-text)] sm:text-[2.35rem]"
        >
          Üç ürün. Net kapsam.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
          Yayındaki masaüstü uygulaması GibTebligat Pro. Belge okuma ve akıllı ofis çözümleri aynı çatı altında.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <article id="gibtebligat" className={`rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-white p-6 shadow-[var(--ds-shadow-md)] ${homepageScrollMt}`}>
          <Badge variant="success">Yayında · v1.1.9</Badge>
          <h2 className="mt-4 text-xl font-bold text-[var(--ds-color-text)]">GibTebligat Pro</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            GİB e-Tebligatlarını arka planda tarar, PDF’leri bilgisayarınıza indirir ve okunma durumunu takip eder.
          </p>
          <GibLicensePanel />
        </article>

        <article id="belge-okuma" className={`rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-white p-6 shadow-[var(--ds-shadow-md)] ${homepageScrollMt}`}>
          <Badge variant="warning">Yakında</Badge>
          <h2 className="mt-4 text-xl font-bold text-[var(--ds-color-text)]">Belge Okuma / Muhasebeleştirme</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            Fatura, banka ekstresi ve beyanname okuma. Çıkan veriyi muhasebe programlarına aktarmak için hazırlanır.
          </p>
        </article>

        <article id="akilli-ofis" className={`rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-white p-6 shadow-[var(--ds-shadow-md)] ${homepageScrollMt}`}>
          <Badge variant="warning">Yakında</Badge>
          <h2 className="mt-4 text-xl font-bold text-[var(--ds-color-text)]">Akıllı Ofis Çözümleri</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            İşletmeler için dijital arşiv ve süreç otomasyonu. Belgeler tek ekrandan düzenlenir ve takip edilir.
          </p>
        </article>
      </div>
    </SectionContainer>
  )
}
