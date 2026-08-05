import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/design-system/cn'

const variantStyles = {
  primary: 'bg-[color:color-mix(in_srgb,var(--ds-color-primary)_12%,white)] text-[var(--ds-color-primary)]',
  success: 'bg-[color:color-mix(in_srgb,var(--ds-color-success)_14%,white)] text-[var(--ds-color-success)]',
  warning: 'bg-[color:color-mix(in_srgb,var(--ds-color-warning)_16%,white)] text-[var(--ds-color-warning)]',
  danger: 'bg-[color:color-mix(in_srgb,var(--ds-color-danger)_12%,white)] text-[var(--ds-color-danger)]',
} as const

export type BadgeVariant = keyof typeof variantStyles

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--ds-radius-sm)] px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
