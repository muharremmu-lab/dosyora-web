import {
  Archive,
  Check,
  Cpu,
  Database,
  FileSpreadsheet,
  Layers,
  ScanText,
} from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'

import { ScrollReveal } from './scroll-reveal'

const modules: { title: string; icon: LucideIcon }[] = [
  { title: 'Yapay Zeka Belge Okuma', icon: Cpu },
  { title: 'Dijital Arşiv', icon: Archive },
  { title: 'Excel Aktarımı', icon: FileSpreadsheet },
  { title: 'Çoklu Belge İşleme', icon: Layers },
  { title: 'OCR', icon: ScanText },
  { title: 'Golden Data', icon: Database },
  { title: 'API Hazır', icon: Cpu },
]

const revealVariants = ['fade-up', 'fade-left', 'fade-right'] as const

export function ModulesSection() {
  return (
    <SectionContainer
      className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="modules-heading"
    >
      <div className="mb-8 max-w-2xl">
        <h2 id="modules-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Modüller
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((module, index) => (
          <ScrollReveal
            key={module.title}
            delayMs={index * 50}
            variant={revealVariants[index % revealVariants.length]}
          >
            <Card interactive className="group flex items-center gap-3 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
                <Icon icon={module.icon} size="md" className="ds-icon-hover" />
              </div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ds-color-text)]">
                <Icon icon={Check} size="sm" className="shrink-0 text-[var(--ds-color-success)]" />
                {module.title}
              </p>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
