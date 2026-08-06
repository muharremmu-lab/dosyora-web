import { Badge, Card, SectionContainer } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'

import { ScrollReveal } from './scroll-reveal'

const plans = [
  {
    name: 'Starter',
    description: 'Küçük ekipler ve bireysel kullanıcılar için temel belge okuma ve arşiv.',
    featured: false,
  },
  {
    name: 'Professional',
    description: 'Büyüyen işletmeler için gelişmiş aktarım, arşiv ve ekip kullanımı.',
    featured: true,
  },
  {
    name: 'Enterprise',
    description: 'Kurumsal ölçekte özelleştirme, entegrasyon ve lisans yönetimi.',
    featured: false,
  },
]

export function PricingSection() {
  return (
    <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]" aria-labelledby="pricing-heading">
      <div className="mb-8 max-w-2xl text-center sm:mx-auto">
        <h2 id="pricing-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Fiyatlandırma
        </h2>
        <p className="mt-3 text-base text-[var(--ds-color-text-muted)]">
          Planlarımız yakında duyurulacaktır.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-center">
        {plans.map((plan, index) => (
          <ScrollReveal key={plan.name} delayMs={index * 60} variant="fade-up">
            <Card
              interactive={plan.featured}
              className={cn(
                'relative flex h-full flex-col ds-transition-hover',
                plan.featured &&
                  'z-10 scale-[1.02] border-[color:color-mix(in_srgb,var(--ds-color-primary)_40%,var(--ds-color-border))] ds-animate-pricing-featured lg:scale-105',
                plan.featured && 'ds-card-glow-hover',
              )}
            >
              {plan.featured ? (
                <Badge
                  variant="success"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase shadow-[var(--ds-shadow-sm)]"
                >
                  En Popüler
                </Badge>
              ) : null}
              <div className="mb-4 flex flex-wrap items-center gap-2 pt-2">
                <h3 className="text-lg font-semibold text-[var(--ds-color-text)]">{plan.name}</h3>
                <Badge variant="warning" className="text-[10px] uppercase">
                  Yakında
                </Badge>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
                {plan.description}
              </p>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
