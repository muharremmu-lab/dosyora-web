import { Check } from 'lucide-react'

import { Badge, Icon, SectionContainer } from '@/components/ui'

const trustBadges = [
  'Bulut Tabanlı',
  'Güvenli Altyapı',
  'Yapay Zeka Destekli',
  'KVKK Uyumlu',
]

export function HeroTrustBadges() {
  return (
    <SectionContainer className="pb-[var(--ds-space-4)] pt-0">
      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Güven unsurları"
      >
        {trustBadges.map((badge) => (
          <Badge
            key={badge}
            variant="primary"
            role="listitem"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs"
          >
            <Icon icon={Check} size="sm" className="text-[var(--ds-color-success)]" aria-hidden="true" />
            {badge}
          </Badge>
        ))}
      </div>
    </SectionContainer>
  )
}
