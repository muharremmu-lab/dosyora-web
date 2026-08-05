import Link from 'next/link'
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/design-system/cn'

const focusRing =
  'focus-visible:outline focus-visible:outline-[length:var(--ds-focus-ring-width)] focus-visible:outline-offset-[var(--ds-focus-ring-offset)] focus-visible:outline-[color:var(--ds-focus-ring-color)]'

export const buttonBaseStyles =
  'inline-flex items-center justify-center gap-2 rounded-[var(--ds-radius-md)] px-4 py-2 text-sm font-medium ds-transition-hover disabled:pointer-events-none disabled:opacity-50'

export const buttonVariantStyles = {
  primary: 'bg-[var(--ds-color-primary)] text-[var(--ds-color-secondary)] hover:opacity-90',
  secondary:
    'bg-[var(--ds-color-secondary)] text-[var(--ds-color-primary)] border border-[var(--ds-color-border)] hover:bg-[var(--ds-color-surface-alt)]',
  ghost:
    'bg-transparent text-[var(--ds-color-primary)] hover:bg-[var(--ds-color-surface-alt)]',
  outline:
    'border border-[var(--ds-color-primary)] bg-transparent text-[var(--ds-color-primary)] hover:bg-[var(--ds-color-surface-alt)]',
  danger: 'bg-[var(--ds-color-danger)] text-[var(--ds-color-secondary)] hover:opacity-90',
} as const

export type ButtonVariant = keyof typeof buttonVariantStyles

export function buttonClassName(variant: ButtonVariant = 'primary', className?: string) {
  return cn(buttonBaseStyles, focusRing, buttonVariantStyles[variant], className)
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  variant?: ButtonVariant
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { className, variant = 'primary', href, children, ...props },
  ref,
) {
  return (
    <Link ref={ref} href={href} className={buttonClassName(variant, className)} {...props}>
      {children}
    </Link>
  )
})

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', loading = false, disabled, children, ...props },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type="button"
      className={buttonClassName(variant, className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
})
