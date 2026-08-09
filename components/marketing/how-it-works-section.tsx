import {
  Archive,
  CloudUpload,
  FileOutput,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'

import { Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'
import {
  homepageScrollMt,
  homepageSectionHeadMb,
  homepageSectionY,
  howItWorksSteps,
} from '@/lib/homepage-content'

const stepIcons: LucideIcon[] = [CloudUpload, ScanLine, ShieldCheck, FileOutput, Archive]

export function HowItWorksSection() {
  return (
    <SectionContainer
      id="nasil-calisir"
      className={`${homepageScrollMt} border-t border-[var(--ds-color-border)] ${homepageSectionY}`}
      aria-labelledby="how-it-works-heading"
    >
      <div className={`${homepageSectionHeadMb} max-w-2xl`}>
        <h2 id="how-it-works-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Nasıl Çalışır?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
          Yapay zekâ destekli okuma ile birlikte insan kontrolü sürecin merkezindedir.
        </p>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-[10%] right-[10%] top-9 hidden h-px bg-[color:color-mix(in_srgb,var(--ds-color-primary)_12%,var(--ds-color-border))] lg:block"
          aria-hidden="true"
        />

        <ol className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {howItWorksSteps.map((step, index) => (
            <li
              key={step.title}
              className={index === howItWorksSteps.length - 1 ? 'col-span-2 lg:col-span-1' : undefined}
            >
              <div className="flex h-full flex-col rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-4 shadow-[var(--ds-shadow-sm)]">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--ds-color-primary)] text-xs font-bold text-[var(--ds-color-secondary)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-highlight)_10%,white)] text-[var(--ds-color-highlight)]">
                    <Icon icon={stepIcons[index] ?? CloudUpload} size="sm" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-[var(--ds-color-text)]">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--ds-color-text-muted)] sm:text-sm">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionContainer>
  )
}
