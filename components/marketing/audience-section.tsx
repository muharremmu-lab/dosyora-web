import { Briefcase, Building2, Calculator, Landmark } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'
import type { LucideIcon } from '@/components/ui/icon'
import { audienceCards } from '@/lib/homepage-content'

const audienceIcons: LucideIcon[] = [Calculator, Building2, Landmark, Briefcase]

export function AudienceSection() {
  return (
    <SectionContainer className="border-t border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Kimler İçin?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
          Mali müşavirlikten finans departmanlarına kadar belge yoğun ekipler için tasarlandı.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {audienceCards.map((item, index) => (
          <Card
            key={item.title}
            interactive
            className="flex flex-col gap-4 py-6"
          >
            <div className="flex size-11 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
              <Icon icon={audienceIcons[index] ?? Building2} size="md" />
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
