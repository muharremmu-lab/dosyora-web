import { Download, Sparkles } from 'lucide-react'

import { Badge, buttonClassName, SectionContainer } from '@/components/ui'
import { homepageScrollMt, homepageSectionY } from '@/lib/homepage-content'

import { DownloadAnchor } from './download-anchor'
import { GibTebligatPricing } from './gibtebligat-pricing'
import type { DownloadSource } from './track-download'

type ProductFamilySectionProps = {
  headingLevel?: 'h1' | 'h2'
  placement?: 'hero' | 'section'
  showDetailsLink?: boolean
}

export function ProductFamilySection({
  headingLevel = 'h2',
  placement = 'section',
  showDetailsLink = false,
}: ProductFamilySectionProps) {
  const Heading = headingLevel
  const isHero = placement === 'hero'
  const downloadSource: DownloadSource = isHero ? 'home' : 'indir'

  return (
    <SectionContainer
      id="urun-ailesi"
      className={`${isHero ? 'pt-9 sm:pt-10' : 'border-t border-[var(--ds-color-border)]'} bg-[var(--ds-color-surface)] ${homepageSectionY} ${homepageScrollMt}`}
      aria-labelledby="product-family-heading"
    >
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ds-color-primary)]">
          Dosyora Ürün Ailesi
        </p>
        <Heading
          id="product-family-heading"
          className={
            isHero
              ? 'mt-3 text-[1.75rem] font-bold leading-[1.15] tracking-tight text-[var(--ds-color-text)] sm:text-[2.35rem]'
              : 'mt-2 text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl'
          }
        >
          Tebligatlarınızı okuyun, arşivleyin, takip edin · Tüm güncellemeler ücretsiz
        </Heading>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="flex h-full flex-col rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6 shadow-[var(--ds-shadow-md)] sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Yayında · v1.0.8.1</Badge>
          </div>
          <h3 className="mt-4 text-xl font-bold text-[var(--ds-color-text)]">1. GibTebligat Pro</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
            GİB e-Tebligatlarınızı tek tıkla otomatik sorgulayın; PDF ve ekleriyle birlikte bilgisayarınıza
            düzenli klasörler halinde okuyun, arşivleyin ve okunma durumlarını anlık takip edin. 14 gün
            ücretsiz deneme ve ömür boyu ücretsiz otomatik güncellemeler.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <DownloadAnchor source={downloadSource} className={buttonClassName('primary', 'px-5 py-2.5')}>
              <Download className="size-4" aria-hidden="true" />
              14 Gün Ücretsiz İndir
            </DownloadAnchor>
            {showDetailsLink ? (
              <a href="/indir" className={buttonClassName('outline', 'px-5 py-2.5')}>
                Detayları İncele
              </a>
            ) : null}
          </div>
        </article>

        <article className="flex h-full flex-col rounded-[var(--ds-radius-xl)] border border-dashed border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-6 sm:p-8">
          <Badge variant="warning">Yakında</Badge>
          <h3 className="mt-4 text-xl font-bold text-[var(--ds-color-text)]">
            2. Belge Okuma, Arşiv ve Muhasebeleştirme
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
            Fatura, banka ekstresi, beyanname ve mali belgelerinizi yapay zeka ile okuyun, dijital olarak
            arşivleyin ve muhasebe programlarınıza otomatik aktarın.
          </p>
        </article>
      </div>

      <div className="mt-6 flex gap-4 rounded-[var(--ds-radius-xl)] bg-[var(--ds-color-primary)] px-6 py-5 text-[var(--ds-color-secondary)] sm:px-8">
        <Sparkles className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold sm:text-base">Yakında Gelen Akıllı Uygulamalar</p>
          <p className="mt-1 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--ds-color-secondary)_88%,transparent)]">
            Yakında: iOS ve Android mobil bildirim uygulamaları, yapay zeka destekli akıllı belge analiz
            araçları ve otomatik muhasebe entegrasyonları da geliyor.
          </p>
        </div>
      </div>

      <GibTebligatPricing source={downloadSource} />
    </SectionContainer>
  )
}
