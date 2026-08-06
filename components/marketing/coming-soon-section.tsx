import { Badge, Card, SectionContainer } from '@/components/ui'

import { ScrollReveal } from './scroll-reveal'

const comingSoonItems = [
  'KDV İadesi',
  'Hakediş Yönetimi',
  'Akıllı Ofis',
  'Belge Üretme',
  "Mail'den Otomatik Belge Alma",
  'WhatsApp Belge Alma',
  'ERP Entegrasyonları',
  'Lisans Yönetimi',
]

export function ComingSoonSection() {
  return (
    <SectionContainer
      className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="coming-soon-heading"
    >
      <div className="mb-8 max-w-2xl">
        <h2 id="coming-soon-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Yakında Dosyora&apos;da
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {comingSoonItems.map((item, index) => (
          <ScrollReveal key={item} delayMs={index * 40} variant={index % 2 === 0 ? 'fade-left' : 'fade-right'}>
            <Card className="ds-card-glow-hover flex items-start justify-between gap-3 py-4">
              <p className="text-sm font-semibold text-[var(--ds-color-text)]">{item}</p>
              <Badge variant="warning" className="shrink-0 text-[10px] uppercase">
                Coming Soon
              </Badge>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
