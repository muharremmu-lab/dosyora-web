import { ButtonLink, SectionContainer } from '@/components/ui'
import { contactFormHref } from '@/lib/contact-routes'
import { homepageDemoLimitLabel, homepageDemoMarketingDescription } from '@/lib/homepage-content'

export function PreviewCtaBand() {
  return (
    <SectionContainer className="pb-[var(--ds-space-8)]">
      <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[color:color-mix(in_srgb,var(--ds-color-accent)_10%,white)] px-6 py-5 shadow-[var(--ds-shadow-sm)] sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="text-base font-semibold text-[var(--ds-color-text)] sm:text-lg">
            {homepageDemoLimitLabel} Ücretsiz Ön İzleme
          </p>
          <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
            {homepageDemoMarketingDescription}
          </p>
        </div>
        <ButtonLink href={contactFormHref('demo')} variant="primary" className="shrink-0 px-5 py-2.5">
          Başvur
        </ButtonLink>
      </div>
    </SectionContainer>
  )
}
