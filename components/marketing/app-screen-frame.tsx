import type { ReactNode } from 'react'

import { cn } from '@/lib/design-system/cn'

type AppScreenFrameProps = {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function AppScreenFrame({ title, subtitle, children, className }: AppScreenFrameProps) {
  return (
    <div
      className={cn(
        'aspect-[16/10] w-full overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-3 py-2">
          <span className="size-2 rounded-full bg-[var(--ds-color-border)]" />
          <span className="size-2 rounded-full bg-[var(--ds-color-border)]" />
          <span className="size-2 rounded-full bg-[var(--ds-color-border)]" />
          <span className="ml-1 truncate text-[10px] text-[var(--ds-color-text-muted)]">{title}</span>
          {subtitle ? (
            <span className="ml-auto text-[10px] text-[var(--ds-color-text-muted)]">{subtitle}</span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-3">{children}</div>
      </div>
    </div>
  )
}
