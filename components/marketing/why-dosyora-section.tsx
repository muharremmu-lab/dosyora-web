import { Cloud, Globe, RefreshCw, Shield, Sparkles, Zap } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'

const whyItems: { title: string; icon: LucideIcon }[] = [
  { title: 'Yapay Zekâ', icon: Sparkles },
  { title: 'Web Tabanlı', icon: Globe },
  { title: 'Hızlı', icon: Zap },
  { title: 'Güvenli', icon: Shield },
  { title: 'Bulut', icon: Cloud },
  { title: 'Sürekli Güncellenen', icon: RefreshCw },
]

export function WhyDosyoraSection() {
  return (
    <SectionContainer className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Neden DOSYORA?
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {whyItems.map((item, index) => (
          <Card
            key={item.title}
            interactive
            className="ds-animate-slide-up flex flex-col items-start gap-4 py-6"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex size-11 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
              <Icon icon={item.icon} size="md" />
            </div>
            <p className="text-sm font-semibold text-[var(--ds-color-text)]">{item.title}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
