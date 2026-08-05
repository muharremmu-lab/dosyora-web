import { Briefcase, Building2, Calculator, UserRound } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'

const audienceItems: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Mali Müşavirler',
    description: 'Çok sayıda müşteri belgesini hızlı okuyun, arşivleyin ve aktarım süreçlerini yönetin.',
    icon: Calculator,
  },
  {
    title: "KOBİ'ler",
    description: 'Günlük fatura ve fiş yükünü azaltın; belgeleri düzenli ve erişilebilir tutun.',
    icon: Building2,
  },
  {
    title: 'Finans Departmanları',
    description: 'Ekip genelinde belge akışını standartlaştırın ve muhasebe aktarımını hızlandırın.',
    icon: Briefcase,
  },
  {
    title: 'Serbest Meslek Erbabı',
    description: 'Makbuz, gider ve ekstreleri tek yerden yönetin; Excel şablonlarına kolayca aktarın.',
    icon: UserRound,
  },
]

export function AudienceSection() {
  return (
    <SectionContainer className="border-t border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          DOSYORA Kimler İçin?
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {audienceItems.map((item, index) => (
          <Card
            key={item.title}
            interactive
            className="ds-animate-slide-up flex flex-col gap-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex size-11 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
              <Icon icon={item.icon} size="md" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--ds-color-text)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
