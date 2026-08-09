import { Badge, Card, SectionContainer } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'
import { productVersions, productVersionStatusVariant } from '@/lib/product-versions'

import { ScrollReveal } from './scroll-reveal'

export function HomeV123Section() {
  return (
    <SectionContainer
      id="platform-v123"
      className="scroll-mt-24 border-t border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="platform-v123-heading"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 id="platform-v123-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          DOSYORA belge okumaktan daha fazlası.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--ds-color-text-muted)] sm:text-lg">
          Belgeden veriye.
          <br className="sm:hidden" /> Veriden akıllı ofise.
          <br className="sm:hidden" /> Akıllı ofisten iş süreçlerine.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-5">
        {productVersions.map((version, index) => (
          <ScrollReveal key={version.id} delayMs={index * 80} variant="fade-up" className="h-full">
            <div className="relative h-full">
              {index < productVersions.length - 1 ? (
                <span
                  className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-2xl text-[var(--ds-color-text-muted)] lg:block"
                  aria-hidden="true"
                >
                  →
                </span>
              ) : null}
              <Card
                className={cn(
                  'flex h-full flex-col gap-5 border-[var(--ds-color-border)] py-6',
                  version.status === 'vision' && 'border-[color:color-mix(in_srgb,var(--ds-color-primary)_18%,white)]',
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-[var(--ds-color-highlight)]">
                    {version.title}
                  </p>
                  <Badge variant={productVersionStatusVariant[version.status]} className="text-[10px] uppercase">
                    {version.statusLabel}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--ds-color-text)]">{version.subtitle}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
                    {version.description}
                  </p>
                </div>
                <ul className="mt-auto space-y-2 border-t border-[var(--ds-color-border)] pt-4">
                  {version.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[var(--ds-color-text)]">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ds-color-highlight)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
