import { Check, Globe, RefreshCw, Shield, Sparkles } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'

const trustItems: { title: string; icon: LucideIcon }[] = [
  { title: 'Yapay Zekâ', icon: Sparkles },
  { title: 'Güvenli Arşiv', icon: Shield },
  { title: 'Web Tabanlı', icon: Globe },
  { title: 'Sürekli Geliştiriliyor', icon: RefreshCw },
]

export function TrustSection() {
  return (
    <SectionContainer className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item, index) => (
          <Card
            key={item.title}
            interactive
            className="ds-animate-slide-up flex items-center gap-4 py-5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
              <Icon icon={item.icon} size="md" />
            </div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ds-color-text)]">
              <Icon icon={Check} size="sm" className="text-[var(--ds-color-success)]" />
              {item.title}
            </p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
