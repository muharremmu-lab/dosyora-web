import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/design-system/cn'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-[var(--ds-space-6)] shadow-[var(--ds-shadow-sm)]',
        interactive &&
          'ds-transition-hover cursor-pointer hover:border-[color:color-mix(in_srgb,var(--ds-color-accent)_35%,var(--ds-color-border))] hover:shadow-[var(--ds-shadow-md)]',
        className,
      )}
      {...props}
    />
  )
}
