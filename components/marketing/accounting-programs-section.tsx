import { Card, SectionContainer } from '@/components/ui'

const accountingPrograms = [
  'Luca',
  'Defter Beyan',
  'Logo',
  'Mikro',
  'ETA',
  'Nebim',
  'Diğer ERP Sistemleri',
]

export function AccountingProgramsSection() {
  return (
    <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-8 max-w-2xl text-center sm:mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Muhasebe Programlarınıza Uyumlu
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {accountingPrograms.map((program, index) => (
          <Card
            key={program}
            className="ds-animate-fade flex min-h-[5.5rem] items-center justify-center px-4 py-6 text-center"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="text-sm font-semibold text-[var(--ds-color-text-muted)]">{program}</span>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
