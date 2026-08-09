import { SectionContainer } from '@/components/ui'
import { howItWorksSteps } from '@/lib/homepage-content'

import { ScrollReveal } from './scroll-reveal'

const revealVariants = ['fade-up', 'fade-left', 'fade-right'] as const

export function HowItWorksSection() {
  return (
    <SectionContainer
      id="nasil-calisir"
      className="scroll-mt-24 border-t border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mb-10 max-w-2xl">
        <h2 id="how-it-works-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Nasıl Çalışır?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
          Yapay zekâ destekli okuma ile birlikte insan kontrolü sürecin merkezindedir.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title}>
            <ScrollReveal
              delayMs={index * 70}
              variant={revealVariants[index % revealVariants.length]}
              className="h-full"
            >
              <div className="flex h-full flex-col rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-5 shadow-[var(--ds-shadow-sm)]">
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-[var(--ds-color-primary)] text-sm font-bold text-[var(--ds-color-secondary)]">
                  {index + 1}
                </span>
                <h3 className="text-sm font-bold tracking-wide text-[var(--ds-color-text)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">{step.description}</p>
              </div>
            </ScrollReveal>
          </li>
        ))}
      </ol>
    </SectionContainer>
  )
}
