import { FileImage, FileText, Receipt, ScrollText, Wallet } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'

const documentTypes: { title: string; icon: LucideIcon }[] = [
  { title: 'Fatura', icon: FileText },
  { title: 'Fiş', icon: Receipt },
  { title: 'Serbest Meslek Makbuzu', icon: ScrollText },
  { title: 'Banka Ekstresi', icon: Wallet },
  { title: 'Gider Pusulası', icon: FileText },
  { title: 'PDF', icon: FileText },
  { title: 'Görsel Dosyalar', icon: FileImage },
]

export function DocumentTypesSection() {
  return (
    <SectionContainer className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Desteklenen Belge Türleri
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {documentTypes.map((item, index) => (
          <Card
            key={item.title}
            className="ds-animate-fade flex items-center gap-3 py-4"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
              <Icon icon={item.icon} size="sm" />
            </div>
            <span className="text-sm font-semibold text-[var(--ds-color-text)]">{item.title}</span>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
