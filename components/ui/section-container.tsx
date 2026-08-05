import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/design-system/cn'

export type SectionContainerProps = HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'main'
}

export function SectionContainer({
  as: Component = 'section',
  className,
  ...props
}: SectionContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full max-w-[var(--ds-container-max)] px-[var(--ds-container-padding)]',
        className,
      )}
      {...props}
    />
  )
}
