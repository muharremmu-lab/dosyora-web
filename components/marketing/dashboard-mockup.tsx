import { FileText, FolderArchive, Search, Upload } from 'lucide-react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/design-system/cn'

const documents = [
  { name: 'Mart_2026_Fatura.pdf', type: 'Fatura', amount: '₺12.450,00', status: 'Okundu' },
  { name: 'Gider_Fisi_042.jpg', type: 'Fiş', amount: '₺890,00', status: 'Okundu' },
  { name: 'Banka_Ekstresi.pdf', type: 'Ekstre', amount: '—', status: 'İşleniyor' },
  { name: 'Kira_Makbuzu.pdf', type: 'Makbuz', amount: '₺18.000,00', status: 'Okundu' },
]

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-lg)]',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="ml-2 text-xs text-[var(--ds-color-text-muted)]">app.dosyora.com</span>
      </div>

      <div className="grid min-h-[320px] grid-cols-[4.5rem_1fr] sm:min-h-[380px]">
        <aside className="flex flex-col gap-3 border-r border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-3">
          <div className="flex size-9 items-center justify-center rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] text-[var(--ds-color-secondary)]">
            <Icon icon={FolderArchive} size="sm" />
          </div>
          {[Upload, Search, FileText].map((item, index) => (
            <div
              key={index}
              className="flex size-9 items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-color-text-muted)]"
            >
              <Icon icon={item} size="sm" />
            </div>
          ))}
        </aside>

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ds-color-text-muted)]">
                Belge arşivi
              </p>
              <p className="text-sm font-semibold text-[var(--ds-color-text)]">Son yüklenenler</p>
            </div>
            <span className="rounded-full bg-[color:color-mix(in_srgb,var(--ds-color-accent)_18%,white)] px-2.5 py-1 text-xs font-medium text-[var(--ds-color-primary)]">
              248 belge
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: 'Bu ay', value: '1.284' },
              { label: 'Otomatik okunan', value: '%96' },
              { label: 'Arşivde', value: '12.4K' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-3 py-2"
              >
                <p className="text-[10px] text-[var(--ds-color-text-muted)]">{stat.label}</p>
                <p className="text-sm font-semibold text-[var(--ds-color-text)]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between gap-2 rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--ds-color-text)]">{doc.name}</p>
                  <p className="text-[10px] text-[var(--ds-color-text-muted)]">
                    {doc.type} · {doc.amount}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    doc.status === 'Okundu'
                      ? 'bg-[color:color-mix(in_srgb,var(--ds-color-success)_14%,white)] text-[var(--ds-color-success)]'
                      : 'bg-[color:color-mix(in_srgb,var(--ds-color-warning)_16%,white)] text-[var(--ds-color-warning)]',
                  )}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
