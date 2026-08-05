import type { LucideIcon, LucideProps } from 'lucide-react'

import { cn } from '@/lib/design-system/cn'

const sizeMap = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const

export type IconSize = keyof typeof sizeMap

export type IconProps = LucideProps & {
  icon: LucideIcon
  size?: IconSize
  label?: string
}

export function Icon({ icon: IconComponent, size = 'md', className, label, ...props }: IconProps) {
  return (
    <IconComponent
      className={cn('shrink-0 text-current', sizeMap[size], className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      strokeWidth={1.75}
      {...props}
    />
  )
}

export type { LucideIcon }
