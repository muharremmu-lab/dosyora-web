import { Check } from 'lucide-react'

import { Icon, SectionContainer } from '@/components/ui'
import { homepageSectionY, whyDosyoraItems } from '@/lib/homepage-content'

export function WhyDosyoraSection() {
  return (
    <SectionContainer
      className={`border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] ${homepageSectionY}`}
      aria-labelledby="why-dosyora-heading"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div className="max-w-md">
          <h2 id="why-dosyora-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
            Neden DOSYORA?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
            Belge okuma sürecini hızlandırırken kontrolü ve doğruluğu ön planda tutar.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {whyDosyoraItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-4 py-3.5"
            >
              <Icon icon={Check} size="sm" className="mt-0.5 shrink-0 text-[var(--ds-color-highlight)]" />
              <span className="text-sm font-medium leading-relaxed text-[var(--ds-color-text)]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
