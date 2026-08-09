import { Badge, SectionContainer } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'
import {
  productVersionStatusVariant,
  productVersions,
  type ProductVersion,
} from '@/lib/product-versions'

import { ProductVersionMockup } from './product-version-mockup'

function ProductVersionBlock({
  version,
  reversed = false,
}: {
  version: ProductVersion
  reversed?: boolean
}) {
  return (
    <div
      className={cn(
        'grid items-center gap-8 lg:grid-cols-2 lg:gap-12',
        reversed && 'lg:[&>*:first-child]:order-2',
      )}
    >
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-2xl">
            {version.title} — {version.subtitle}
          </h2>
          <Badge variant={productVersionStatusVariant[version.status]} className="text-[10px] uppercase">
            {version.statusLabel}
          </Badge>
        </div>

        <p className="text-base leading-relaxed text-[var(--ds-color-text-muted)]">{version.description}</p>

        <ul className="mt-6 space-y-2">
          {version.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-[var(--ds-color-text)]">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ds-color-highlight)]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <ProductVersionMockup version={version.id} className="w-full" />
    </div>
  )
}

export function ProductVersionsSection() {
  return (
    <SectionContainer className="space-y-16 py-[var(--ds-space-12)] sm:space-y-20 sm:py-[var(--ds-space-16)]">
      {productVersions.map((version, index) => (
        <ProductVersionBlock key={version.id} version={version} reversed={index % 2 === 1} />
      ))}
    </SectionContainer>
  )
}
