import Link from 'next/link'

import { Card, SectionContainer } from '@/components/ui'

import {
  ScreenAkilliArsiv,
  ScreenBelgeOkuma,
  ScreenBelgeUretme,
  ScreenDemoPaneli,
  ScreenRaporlar,
  ScreenSonucFormu,
} from './product-screens/mockups'
import { ScrollReveal } from './scroll-reveal'

const productScreens = [
  {
    title: 'Belge Okuma',
    description: 'Fatura, fiş ve makbuzları yapay zeka ile otomatik okuyun.',
    Screen: ScreenBelgeOkuma,
  },
  {
    title: 'Sonuç Formu',
    description: 'Okunan alanları kontrol edin, düzeltin ve onaylayın.',
    Screen: ScreenSonucFormu,
  },
  {
    title: 'Akıllı Arşiv',
    description: 'Tüm belgeleri güvenli bulut arşivde arayın ve yönetin.',
    Screen: ScreenAkilliArsiv,
  },
  {
    title: 'Belge Üretme',
    description: 'Teklif, sözleşme ve kurumsal belgeleri şablonlarla oluşturun.',
    Screen: ScreenBelgeUretme,
  },
  {
    title: 'Demo Paneli',
    description: 'Demo kotanızı ve okunan belge sayısını anlık takip edin.',
    Screen: ScreenDemoPaneli,
  },
  {
    title: 'Raporlar',
    description: 'Belge hacmi, doğruluk ve operasyon metriklerini görün.',
    Screen: ScreenRaporlar,
  },
]

const revealVariants = ['fade-up', 'fade-left', 'fade-right'] as const

export function ProductScreensSection() {
  return (
    <SectionContainer
      className="border-t border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="product-screens-heading"
    >
      <div className="mb-8 max-w-2xl">
        <h2 id="product-screens-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Ürünü Görün
        </h2>
        <p className="mt-3 text-base text-[var(--ds-color-text-muted)]">
          DOSYORA&apos;nın belge okuma, arşiv ve aktarım ekranlarını keşfedin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {productScreens.map(({ title, description, Screen }, index) => (
          <ScrollReveal
            key={title}
            delayMs={index * 60}
            variant={revealVariants[index % revealVariants.length]}
          >
            <Card interactive className="group flex h-full flex-col overflow-hidden p-0">
              <div className="overflow-hidden p-4 pb-0">
                <div className="ds-product-card-hover origin-center">
                  <Screen />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-semibold text-[var(--ds-color-text)]">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
                  {description}
                </p>
                <Link
                  href="/urun"
                  className="mt-4 text-sm font-medium text-[var(--ds-color-primary)] ds-transition-hover hover:opacity-80"
                  aria-label={`${title} detaylarını incele`}
                >
                  Detaylı İncele →
                </Link>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
