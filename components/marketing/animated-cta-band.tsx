import { Headphones, Rocket, Shield } from 'lucide-react'

import { ButtonLink, Icon, SectionContainer } from '@/components/ui'
import { homepageDemoLimitLabel, homepageSectionY } from '@/lib/homepage-content'

const ctaPoints = [
  { icon: Rocket, text: 'Ücretsiz deneyin, farkı görün.' },
  { icon: Shield, text: 'Güvenli, hızlı ve kullanıcı dostu.' },
  { icon: Headphones, text: 'Uzman destek ekibi.' },
]

export function AnimatedCtaBand() {
  return (
    <SectionContainer
      className={`${homepageSectionY} pt-6 sm:pt-8`}
      aria-labelledby="animated-cta-heading"
    >
      <div className="relative overflow-hidden rounded-[var(--ds-radius-xl)] bg-[var(--ds-color-primary-deep)] px-6 py-10 shadow-[var(--ds-shadow-lg)] sm:px-10 sm:py-12">
        <span className="absolute right-0 top-0 rounded-bl-[var(--ds-radius-lg)] bg-[var(--ds-color-success)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
          Ücretsiz Deneyin
        </span>

        <div className="mx-auto max-w-2xl text-center">
          <h2 id="animated-cta-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-secondary)] sm:text-3xl">
            {homepageDemoLimitLabel.toUpperCase()} HAKKI İLE ÜCRETSİZ DENEYİN
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--ds-color-secondary)_82%,transparent)]">
            DOSYORA&apos;nın belge okuma deneyimini kendi belgelerinizle keşfedin.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-left sm:mx-auto sm:max-w-md">
            {ctaPoints.map((point) => (
              <li key={point.text} className="flex items-center gap-3 text-sm text-[color:color-mix(in_srgb,var(--ds-color-secondary)_88%,transparent)]">
                <Icon icon={point.icon} size="sm" className="shrink-0 text-[var(--ds-color-accent)]" />
                {point.text}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ButtonLink
              href="/demo"
              variant="secondary"
              className="px-8 py-3 text-base font-semibold"
              aria-label="Ücretsiz demo talep et"
            >
              Ücretsiz Demo Talep Et
            </ButtonLink>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
