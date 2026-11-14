import { Check, Download } from 'lucide-react'

import { Badge, buttonClassName } from '@/components/ui'

import { desktopDownloadHref } from './desktop-download-section'

const plans = [
  {
    name: 'Firma Paketi',
    price: '100 TL',
    cadence: '/ Yıl (KDV Dahil)',
    popular: false,
    features: [
      '1 Firma',
      'Sınırsız sorgu',
      'Tebligat okuma, arşivleme ve takip',
      '14 gün ücretsiz deneme',
      'Ücretsiz güncellemeler',
    ],
  },
  {
    name: 'Mali Müşavir 200',
    price: '1.500 TL',
    cadence: '/ Yıl (KDV Dahil)',
    popular: true,
    features: [
      '200 müşteri kapasitesi',
      'Sınırsız sorgu',
      'Mükellef bazlı arşiv ve takip',
      '14 gün ücretsiz deneme',
      'Ücretsiz güncellemeler',
    ],
  },
  {
    name: 'Mali Müşavir Sınırsız',
    price: '2.000 TL',
    cadence: '/ Yıl (KDV Dahil)',
    popular: false,
    features: [
      'Sınırsız müşteri kapasitesi',
      'Sınırsız sorgu',
      'Tam arşiv ve takip',
      '14 gün ücretsiz deneme',
      'Ücretsiz güncellemeler',
    ],
  },
] as const

export function GibTebligatPricing() {
  return (
    <div className="mt-10" aria-labelledby="gibtebligat-pricing-heading">
      <h3
        id="gibtebligat-pricing-heading"
        className="text-center text-base font-semibold tracking-tight text-[var(--ds-color-text)] sm:text-lg"
      >
        14 Gün Ücretsiz Kullanım · Tüm Güncellemeler Ücretsiz · Yıllık KDV Dahil Fiyatlar
      </h3>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={
              plan.popular
                ? 'relative flex h-full flex-col rounded-[var(--ds-radius-xl)] border-2 border-[var(--ds-color-primary)] bg-[var(--ds-color-surface)] p-6 shadow-[var(--ds-shadow-md)]'
                : 'flex h-full flex-col rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6 shadow-[var(--ds-shadow-sm)]'
            }
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-lg font-bold text-[var(--ds-color-text)]">{plan.name}</h4>
              {plan.popular ? <Badge>Popüler</Badge> : null}
            </div>
            <p className="mt-4 text-[var(--ds-color-text)]">
              <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
              <span className="ml-1 text-sm text-[var(--ds-color-text-muted)]">{plan.cadence}</span>
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[var(--ds-color-text)]">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--ds-color-success)]" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href={desktopDownloadHref}
              download
              className={buttonClassName(plan.popular ? 'primary' : 'outline', 'mt-6 w-full px-4 py-2.5')}
            >
              <Download className="size-4" aria-hidden="true" />
              14 Gün Ücretsiz İndir
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
