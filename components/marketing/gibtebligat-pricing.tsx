import { Check, Download } from 'lucide-react'

import { Badge, buttonClassName } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'

import { DownloadAnchor } from './download-anchor'

const plans = [
  {
    name: 'Firma Paketi',
    price: '100 TL',
    cadence: '/ Yıl (KDV Dahil)',
    popular: false,
    features: [
      '1 Firma kapasitesi',
      'Sınırsız sorgu',
      'Tebligat okuma, arşivleme ve takip',
      '14 gün ücretsiz deneme',
      'Ücretsiz güncellemeler',
    ],
  },
  {
    name: 'Mali Müşavir 50',
    price: '500 TL',
    cadence: '/ Yıl (KDV Dahil)',
    popular: false,
    features: [
      '50 müşteri kapasitesi',
      'Sınırsız sorgu',
      'Mükellef bazlı arşiv ve takip',
      '14 gün ücretsiz deneme',
      'Ücretsiz güncellemeler',
    ],
  },
  {
    name: 'Mali Müşavir 100',
    price: '750 TL',
    cadence: '/ Yıl (KDV Dahil)',
    popular: true,
    features: [
      '100 müşteri kapasitesi',
      'Sınırsız sorgu',
      'Mükellef bazlı arşiv ve takip',
      '14 gün ücretsiz deneme',
      'Ücretsiz güncellemeler',
    ],
  },
    {
      name: 'Mali Müşavir 200',
      price: '1.000 TL',
      cadence: '/ Yıl (KDV Dahil)',
      popular: false,
      features: [
        '200 müşteri kapasitesi',
        'Sınırsız sorgu',
        'Mükellef bazlı arşiv ve takip',
        '14 gün ücretsiz deneme',
        'Ücretsiz güncellemeler',
      ],
    },
  ] as const

type GibTebligatPricingProps = {
  source: 'home' | 'indir'
}

export function GibTebligatPricing({ source }: GibTebligatPricingProps) {
  return (
    <div className="mt-10" aria-labelledby="gibtebligat-pricing-heading">
      <h3
        id="gibtebligat-pricing-heading"
        className="text-center text-base font-semibold tracking-tight text-[var(--ds-color-text)] sm:text-lg"
      >
        14 Gün Ücretsiz Kullanım · Tüm Güncellemeler Ücretsiz · Yıllık KDV Dahil Fiyatlar
      </h3>
      <div className="mt-6 grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              'relative flex h-full min-w-0 flex-col rounded-[var(--ds-radius-xl)] bg-[var(--ds-color-surface)] p-4 pt-5',
              plan.popular
                ? 'border-2 border-[var(--ds-color-primary)] shadow-[var(--ds-shadow-md)]'
                : 'border border-[var(--ds-color-border)] shadow-[var(--ds-shadow-sm)]',
            )}
          >
            {plan.popular ? (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Popüler</Badge>
            ) : null}
            <h4 className="min-h-10 text-sm font-bold leading-snug text-[var(--ds-color-text)]">{plan.name}</h4>
            <p className="mt-3 text-[var(--ds-color-text)]">
              <span className="block text-2xl font-bold tracking-tight">{plan.price}</span>
              <span className="mt-1 block text-xs text-[var(--ds-color-text-muted)]">{plan.cadence}</span>
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-1.5 text-xs leading-snug text-[var(--ds-color-text)]">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--ds-color-success)]" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <DownloadAnchor
              source={source}
              className={buttonClassName(
                plan.popular ? 'primary' : 'outline',
                'mt-4 w-full whitespace-normal px-2 py-2 text-center text-xs leading-snug',
              )}
            >
              <Download className="size-3.5 shrink-0" aria-hidden="true" />
              14 Gün Ücretsiz İndir
            </DownloadAnchor>
          </article>
        ))}
      </div>
    </div>
  )
}
