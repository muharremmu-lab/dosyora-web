import { cn } from '@/lib/design-system/cn'

type ProductScreenPlaceholderProps = {
  title: string
  subtitle: string
  className?: string
}

export function ProductScreenPlaceholder({
  title,
  subtitle,
  className,
}: ProductScreenPlaceholderProps) {
  return (
    <div
      className={cn(
        'aspect-[16/10] w-full overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-[var(--ds-color-border)] px-3 py-2">
          <span className="size-2 rounded-full bg-[var(--ds-color-border)]" />
          <span className="size-2 rounded-full bg-[var(--ds-color-border)]" />
          <span className="size-2 rounded-full bg-[var(--ds-color-border)]" />
          <span className="ml-1 truncate text-[10px] text-[var(--ds-color-text-muted)]">{title}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ds-color-text-muted)]">
            {subtitle}
          </p>
          <div className="grid flex-1 grid-cols-3 gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-2"
              >
                <div className="h-2 w-8 rounded bg-[var(--ds-color-border)]" />
                <div className="mt-2 h-3 w-full rounded bg-[color:color-mix(in_srgb,var(--ds-color-primary)_10%,white)]" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[1, 2].map((row) => (
              <div
                key={row}
                className="h-6 rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
