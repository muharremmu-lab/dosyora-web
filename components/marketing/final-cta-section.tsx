import { ButtonLink, SectionContainer } from '@/components/ui'
import { contactFormHref } from '@/lib/contact-routes'
import { homepageDemoMarketingDescription } from '@/lib/homepage-content'

type FinalCtaSectionProps = {
  title?: string
  description?: string
  buttonLabel?: string
  primaryButtonLabel?: string
  primaryButtonHref?: string
  secondaryButtonLabel?: string
  secondaryButtonHref?: string
}

export function FinalCtaSection({
  title = "DOSYORA'yı Ücretsiz Deneyin",
  description = homepageDemoMarketingDescription,
  buttonLabel,
  primaryButtonLabel,
  primaryButtonHref = contactFormHref('demo'),
  secondaryButtonLabel,
  secondaryButtonHref = '/urun',
}: FinalCtaSectionProps) {
  const mainLabel = primaryButtonLabel ?? buttonLabel ?? 'Demo Talep Et'

  return (
    <SectionContainer
      className="pb-[var(--ds-space-16)] pt-[var(--ds-space-8)] sm:pb-[var(--ds-space-24)]"
      aria-labelledby="final-cta-heading"
    >
      <div className="rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-primary)] px-6 py-12 text-center shadow-[var(--ds-shadow-lg)] sm:px-12 sm:py-16">
        <h2 id="final-cta-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-secondary)] sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--ds-color-secondary)_82%,transparent)]">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href={primaryButtonHref}
            variant="secondary"
            className="w-full px-6 py-3 text-base font-semibold sm:w-auto"
            aria-label={mainLabel}
          >
            {mainLabel}
          </ButtonLink>
          {secondaryButtonLabel ? (
            <ButtonLink
              href={secondaryButtonHref}
              variant="outline"
              className="w-full border-[var(--ds-color-secondary)] bg-transparent px-6 py-3 text-base font-semibold text-[var(--ds-color-secondary)] hover:bg-[color:color-mix(in_srgb,var(--ds-color-secondary)_12%,transparent)] sm:w-auto"
            >
              {secondaryButtonLabel}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </SectionContainer>
  )
}
