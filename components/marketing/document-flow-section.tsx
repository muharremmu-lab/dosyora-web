'use client'

import { Archive, Bot, CheckCircle2, FileSpreadsheet, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { SectionContainer } from '@/components/ui'

import { ScrollReveal } from './scroll-reveal'

const flowSteps = [
  { label: 'Belge', icon: FileText },
  { label: 'AI', icon: Bot },
  { label: 'Kontrol', icon: CheckCircle2 },
  { label: 'Excel', icon: FileSpreadsheet },
  { label: 'Arşiv', icon: Archive },
] as const

export function DocumentFlowSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % flowSteps.length)
    }, 1800)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <SectionContainer
      className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="document-flow-heading"
    >
      <ScrollReveal variant="fade-up">
        <div className="mb-10 max-w-2xl text-center sm:mx-auto">
          <h2 id="document-flow-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
            Bir belgeyi 30 saniyede işleyin.
          </h2>
          <p className="mt-3 text-base text-[var(--ds-color-text-muted)]">
            Yüklemeden arşive kadar tüm süreç otomatik ilerler.
          </p>
        </div>
      </ScrollReveal>

      <ol
        className="mx-auto flex max-w-4xl flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-0"
        aria-label="Belge işleme akışı"
      >
        {flowSteps.map((step, index) => (
          <li key={step.label} className="flex items-center">
            <div className="flex flex-col items-center px-2 sm:px-3">
              <div
                className={`flex size-14 items-center justify-center rounded-[var(--ds-radius-lg)] border ds-transition-hover ${
                  index === activeIndex
                    ? 'border-[color:color-mix(in_srgb,var(--ds-color-primary)_35%,var(--ds-color-border))] bg-[var(--ds-color-surface)] ds-animate-flow-pulse shadow-[var(--ds-shadow-md)]'
                    : 'border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] opacity-70'
                }`}
                aria-current={index === activeIndex ? 'step' : undefined}
              >
                <Icon
                  icon={step.icon}
                  size="md"
                  className={
                    index === activeIndex
                      ? 'text-[var(--ds-color-primary)]'
                      : 'text-[var(--ds-color-text-muted)]'
                  }
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-[var(--ds-color-text)]">{step.label}</p>
            </div>
            {index < flowSteps.length - 1 ? (
              <span
                className="text-[var(--ds-color-text-muted)] sm:px-1"
                aria-hidden="true"
              >
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </SectionContainer>
  )
}
