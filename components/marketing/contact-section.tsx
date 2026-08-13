import { SectionContainer } from '@/components/ui'
import { CONTACT_SECTION_ID, parseContactFormType, type ContactFormType } from '@/lib/contact-routes'
import { homepageSectionY } from '@/lib/homepage-content'

import { CentralContactForm } from './central-contact-form'

type ContactSectionProps = {
  defaultType?: ContactFormType
}

export function ContactSection({ defaultType }: ContactSectionProps) {
  const resolvedType = defaultType ?? 'request'

  return (
    <SectionContainer
      id={CONTACT_SECTION_ID}
      className={`${homepageSectionY} scroll-mt-24`}
      aria-labelledby="contact-section-heading"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-color-text-muted)]">
            İletişim
          </p>
          <h2
            id="contact-section-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl"
          >
            Bizimle iletişime geçin
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
            Demo talebi veya istek ve önerileriniz için aşağıdaki formu kullanın. Ekibimiz en kısa
            sürede size dönüş yapacaktır.
          </p>
        </div>

        <div className="rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6 shadow-[var(--ds-shadow-sm)] sm:p-8">
          <CentralContactForm defaultType={resolvedType} />
        </div>
      </div>
    </SectionContainer>
  )
}

export { parseContactFormType }
