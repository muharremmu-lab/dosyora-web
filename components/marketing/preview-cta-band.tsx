import { ButtonLink, SectionContainer } from '@/components/ui'

export function PreviewCtaBand() {
  return (
    <SectionContainer className="pb-[var(--ds-space-8)]">
      <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[color:color-mix(in_srgb,var(--ds-color-accent)_10%,white)] px-6 py-5 shadow-[var(--ds-shadow-sm)] sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="text-base font-semibold text-[var(--ds-color-text)] sm:text-lg">
            100 Belge Ücretsiz Ön İzleme
          </p>
          <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
            Onaylanan firmalara 100 belge okuma hakkı tanımlanır.
          </p>
        </div>
        <ButtonLink href="/demo" variant="primary" className="shrink-0 px-5 py-2.5">
          Başvur
        </ButtonLink>
      </div>
    </SectionContainer>
  )
}
