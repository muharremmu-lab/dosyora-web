import { SectionContainer } from '@/components/ui'

import { ScrollReveal } from './scroll-reveal'

const steps = [
  'Belgeyi yükle',
  'AI belgeyi analiz eder',
  'Alanları kontrol et',
  'Excel oluştur',
  'Muhasebe programına aktar',
  'Belgeleri arşivle',
]

const revealVariants = ['fade-up', 'fade-left', 'fade-right'] as const

export function HowItWorksSection() {
  return (
    <SectionContainer
      className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mb-8 max-w-2xl">
        <h2 id="how-it-works-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Nasıl Çalışır?
        </h2>
      </div>

      <ol className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
            <ScrollReveal
              delayMs={index * 80}
              variant={revealVariants[index % revealVariants.length]}
              className="w-full lg:w-auto lg:min-w-[9rem] lg:max-w-[10rem]"
            >
              <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-4 text-center shadow-[var(--ds-shadow-sm)] ds-card-interactive">
                <span className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-[var(--ds-color-primary)] text-sm font-bold text-[var(--ds-color-secondary)]">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-[var(--ds-color-text)]">{step}</p>
              </div>
            </ScrollReveal>
            {index < steps.length - 1 ? (
              <span
                className="text-sm text-[var(--ds-color-text-muted)] lg:px-1"
                aria-hidden="true"
              >
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </SectionContainer>
  )
}
