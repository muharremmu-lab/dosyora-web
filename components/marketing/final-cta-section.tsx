import { ButtonLink, SectionContainer } from '@/components/ui'

type FinalCtaSectionProps = {
  title?: string
  description?: string
  buttonLabel?: string
}

export function FinalCtaSection({
  title = "DOSYORA'yı Ücretsiz Deneyin",
  description = 'Onaylanan firmalara 100 belge okuma hakkı tanımlanacaktır.',
  buttonLabel = 'Demo Talep Et',
}: FinalCtaSectionProps) {
  return (
    <SectionContainer className="pb-[var(--ds-space-16)] pt-[var(--ds-space-8)] sm:pb-[var(--ds-space-24)]">
      <div className="rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-primary)] px-6 py-12 text-center shadow-[var(--ds-shadow-lg)] sm:px-12 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-secondary)] sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--ds-color-secondary)_82%,transparent)]">
          {description}
        </p>
        <ButtonLink
          href="/demo"
          variant="secondary"
          className="mt-8 px-6 py-3 text-base font-semibold"
        >
          {buttonLabel}
        </ButtonLink>
      </div>
    </SectionContainer>
  )
}
