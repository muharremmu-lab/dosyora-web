'use client'

import { useEffect, useRef, useState } from 'react'

import { AnimatedCounter } from './animated-counter'

const stats = [
  { label: 'Okunan belge', value: <AnimatedCounter value={500000} suffix="+" /> },
  {
    label: 'Doğruluk',
    value: (
      <>
        %<AnimatedCounter value={99} suffix="+" />
      </>
    ),
  },
  {
    label: 'Ortalama işlem',
    value: (
      <>
        <AnimatedCounter value={10} /> sn
      </>
    ),
  },
  { label: 'Bulut erişimi', value: <span aria-label="7 gün 24 saat">7/24</span> },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const sectionCenter = rect.top + rect.height / 2
      const distance = (sectionCenter - viewportCenter) / window.innerHeight
      setOffset(distance)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="border-y border-[var(--ds-color-border)] bg-[var(--ds-color-primary)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-label="Platform istatistikleri"
    >
      <div className="mx-auto grid max-w-[var(--ds-container-max)] grid-cols-2 gap-6 px-[var(--ds-container-padding)] lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center ds-transition-hover"
            style={{
              transform: `translateY(${offset * (index % 2 === 0 ? 8 : -8)}px)`,
            }}
          >
            <p className="text-2xl font-bold tracking-tight text-[var(--ds-color-secondary)] sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-[color:color-mix(in_srgb,var(--ds-color-secondary)_75%,transparent)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
