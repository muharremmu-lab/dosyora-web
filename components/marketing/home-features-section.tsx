import {
  Archive,
  CloudUpload,
  FileSpreadsheet,
  PencilLine,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'
import { featureCards } from '@/lib/homepage-content'

import { ScrollReveal } from './scroll-reveal'

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
      className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="features-heading"
    >
      <div className="mb-10 max-w-2xl">
        <h2 id="features-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Öne Çıkan Özellikler
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
          Belge okuma sürecini hızlandıran, kontrolü sizde tutan ve muhasebe verisine dönüştüren
          yetenekler.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((feature, index) => (
          <ScrollReveal key={feature.title} delayMs={index * 60} variant="fade-up">
            <Card interactive className="flex h-full flex-col gap-4 py-6">
              <div className="flex size-12 items-center justify-center rounded-[var(--ds-radius-lg)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
                <Icon icon={featureIcons[index] ?? CloudUpload} size="md" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--ds-color-text)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
                  {feature.description}
                </p>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
