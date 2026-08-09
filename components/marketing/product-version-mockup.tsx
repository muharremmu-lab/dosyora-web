import { cn } from '@/lib/design-system/cn'
import type { ProductVersion } from '@/lib/product-versions'

type ProductVersionMockupProps = {
  version: ProductVersion['id']
  className?: string
}

const mockupLabels: Record<ProductVersion['id'], { title: string; subtitle: string }> = {
  v1: { title: 'Belgeden Veriye', subtitle: 'Okuma · Kontrol · Excel' },
  v2: { title: 'Akıllı Ofis', subtitle: 'Arşiv · Üretim · İlişkilendirme' },
  v3: { title: 'Akıllı İş Sistemleri', subtitle: 'KDV İade · Filo · Hakediş' },
}

export function ProductVersionMockup({ version, className }: ProductVersionMockupProps) {
  const label = mockupLabels[version]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-md)]',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="ml-2 text-xs text-[var(--ds-color-text-muted)]">dosyora.com/{version}</span>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ds-color-text-muted)]">
            {label.subtitle}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ds-color-text)]">{label.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-2 py-3"
            >
              <div className="h-2 w-8 rounded bg-[var(--ds-color-border)]" />
              <div className="mt-2 h-3 w-full rounded bg-[color:color-mix(in_srgb,var(--ds-color-primary)_12%,white)]" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-2.5"
            >
              <div className="space-y-1.5">
                <div className="h-2 w-24 rounded bg-[var(--ds-color-border)]" />
                <div className="h-2 w-16 rounded bg-[var(--ds-color-border)]" />
              </div>
              <div className="h-5 w-14 rounded-full bg-[color:color-mix(in_srgb,var(--ds-color-accent)_18%,white)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
