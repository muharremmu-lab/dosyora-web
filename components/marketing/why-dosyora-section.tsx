import { Check, Cloud, FileSpreadsheet, RefreshCw, Shield, Sparkles, Zap } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'

import { ScrollReveal } from './scroll-reveal'

const trustItems: { title: string; icon: LucideIcon }[] = [
  { title: 'Verileriniz size ait', icon: Shield },
  { title: 'Bulut tabanlı', icon: Cloud },
  { title: 'Yapay zekâ destekli', icon: Sparkles },
  { title: 'Hızlı kurulum', icon: Zap },
  { title: 'Excel uyumlu', icon: FileSpreadsheet },
  { title: 'Sürekli geliştiriliyor', icon: RefreshCw },
]

const revealVariants = ['fade-up', 'fade-left', 'fade-right'] as const

export function WhyDosyoraSection() {
  return (
    <SectionContainer
      className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="why-dosyora-heading"
    >
      <div className="mb-8 max-w-2xl">
        <h2 id="why-dosyora-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Neden Dosyora?
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trustItems.map((item, index) => (
          <ScrollReveal
            key={item.title}
            delayMs={index * 50}
            variant={revealVariants[index % revealVariants.length]}
          >
            <Card interactive className="group flex items-center gap-4 py-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
                <Icon icon={item.icon} size="md" className="ds-icon-hover" />
              </div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ds-color-text)]">
                <Icon icon={Check} size="sm" className="text-[var(--ds-color-success)]" />
                {item.title}
              </p>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
