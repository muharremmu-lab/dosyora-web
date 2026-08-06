import { Card, SectionContainer } from '@/components/ui'

const trustLogos = ['Gemini AI', 'OpenAI', 'KVKK', 'SSL', 'Bulut']

export function TrustLogosSection() {
  return (
    <SectionContainer className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Güven Altyapısı
        </h2>
        <p className="mt-3 text-base text-[var(--ds-color-text-muted)]">
          Yapay zekâ, güvenlik ve uyumluluk standartları.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {trustLogos.map((logo, index) => (
          <Card
            key={logo}
            className="ds-animate-fade flex min-h-[4.5rem] items-center justify-center px-4 py-5 text-center"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="text-sm font-semibold text-[var(--ds-color-text-muted)]">{logo}</span>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
