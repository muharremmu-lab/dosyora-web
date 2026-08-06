'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/design-system/cn'

export type ScrollRevealVariant = 'fade-up' | 'fade-left' | 'fade-right'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delayMs?: number
  variant?: ScrollRevealVariant
}

const hiddenClassMap: Record<ScrollRevealVariant, string> = {
  'fade-up': 'opacity-0 translate-y-2',
  'fade-left': 'opacity-0 -translate-x-3',
  'fade-right': 'opacity-0 translate-x-3',
}

const visibleClassMap: Record<ScrollRevealVariant, string> = {
  'fade-up': 'ds-animate-fade-up opacity-100',
  'fade-left': 'ds-animate-fade-left opacity-100',
  'fade-right': 'ds-animate-fade-right opacity-100',
}

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  variant = 'fade-up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(className, visible ? visibleClassMap[variant] : hiddenClassMap[variant])}
      style={visible ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}
