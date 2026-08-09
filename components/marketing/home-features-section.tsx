import {
  Archive,
  CloudUpload,
  FileSpreadsheet,
  PencilLine,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'

import { Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'
import {
  featureCards,
  homepageSectionHeadMb,
  homepageSectionY,
} from '@/lib/homepage-content'

const featureIcons: LucideIcon[] = [
  CloudUpload,
  ScanLine,
  ShieldCheck,
  PencilLine,
  FileSpreadsheet,
  Archive,
]

export function HomeFeaturesSection() {
  return (
    <SectionContainer
      className={`border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] ${homepageSectionY}`}
      aria-labelledby="features-heading"
    >
      <div className={`${homepageSectionHeadMb} max-w-2xl`}>
        <h2 id="features-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Öne Çıkan Özellikler
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
          Belge okuma sürecini hızlandıran, kontrolü sizde tutan ve muhasebe verisine dönüştüren
          yetenekler.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {featureCards.map((feature, index) => (
          <article
            key={feature.title}
            className="flex h-full flex-col gap-3 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-4 shadow-[var(--ds-shadow-sm)]"
          >
            <div className="flex size-10 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
              <Icon icon={featureIcons[index] ?? CloudUpload} size="sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ds-color-text)] sm:text-base">{feature.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--ds-color-text-muted)] sm:text-sm">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </SectionContainer>
  )
}
