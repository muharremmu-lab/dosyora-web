import { ButtonLink, SectionContainer } from '@/components/ui'

export function AnimatedCtaBand() {
  return (
    <SectionContainer
      className="pb-[var(--ds-space-16)] pt-[var(--ds-space-8)] sm:pb-[var(--ds-space-24)]"
      aria-labelledby="animated-cta-heading"
    >
      <div className="ds-animate-cta-glow rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-primary)] px-6 py-12 text-center shadow-[var(--ds-shadow-lg)] sm:px-12 sm:py-16">
        <h2 id="animated-cta-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-secondary)] sm:text-3xl">
          Bugün başlayın.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--ds-color-secondary)_82%,transparent)]">
          İlk 100 belge ücretsiz.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="/demo"
            variant="secondary"
            className="w-full px-6 py-3 text-base font-semibold ds-hover-scale sm:w-auto"
            aria-label="Demo başlat"
          >
            Demo Başlat
          </ButtonLink>
          <ButtonLink
            href="/iletisim"
            variant="outline"
            className="w-full border-[var(--ds-color-secondary)] bg-transparent px-6 py-3 text-base font-semibold text-[var(--ds-color-secondary)] hover:bg-[color:color-mix(in_srgb,var(--ds-color-secondary)_12%,transparent)] ds-hover-scale sm:w-auto"
            aria-label="İletişime geç"
          >
            İletişime Geç
          </ButtonLink>
        </div>
      </div>
    </SectionContainer>
  )
}
