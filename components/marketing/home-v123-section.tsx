import { Fragment } from 'react'

import { Badge, SectionContainer } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'
import {
  homepageScrollMt,
  homepageSectionHeadMb,
  homepageSectionY,
} from '@/lib/homepage-content'
import { productVersions, productVersionStatusVariant } from '@/lib/product-versions'

function VersionConnector() {
  return (
    <div className="hidden shrink-0 items-center self-center px-1 lg:flex" aria-hidden="true">
      <div className="h-px w-3 bg-[color:color-mix(in_srgb,var(--ds-color-primary)_18%,var(--ds-color-border))]" />
      <span className="px-0.5 text-sm text-[var(--ds-color-text-muted)]">→</span>
      <div className="h-px w-3 bg-[color:color-mix(in_srgb,var(--ds-color-primary)_18%,var(--ds-color-border))]" />
    </div>
  )
}

function VersionCard({ version }: { version: (typeof productVersions)[number] }) {
  return (
    <article
      className={cn(
        'flex flex-1 flex-col rounded-[var(--ds-radius-lg)] border bg-[var(--ds-color-surface)] p-4 shadow-[var(--ds-shadow-sm)] sm:p-5',
        version.id === 'v1'
          ? 'border-[color:color-mix(in_srgb,var(--ds-color-highlight)_45%,var(--ds-color-border))] shadow-[var(--ds-shadow-md)]'
          : 'border-[var(--ds-color-border)]',
        version.id === 'v1' &&
          'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--ds-color-highlight)_5%,white)_0%,var(--ds-color-surface)_100%)]',
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--ds-color-highlight)]">
          {version.title}
        </p>
        <Badge variant={productVersionStatusVariant[version.status]} className="text-[10px] uppercase">
          {version.statusLabel}
        </Badge>
      </div>

      <h3 className="text-base font-bold uppercase tracking-tight text-[var(--ds-color-text)] sm:text-lg">
        {version.subtitle}
      </h3>

      <ul className="mt-4 space-y-1.5 border-t border-[var(--ds-color-border)] pt-3">
        {version.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-[var(--ds-color-text)] sm:text-sm">
            <span
              className={cn(
                'mt-1.5 size-1.5 shrink-0 rounded-full',
                version.id === 'v1' ? 'bg-[var(--ds-color-highlight)]' : 'bg-[var(--ds-color-primary)]',
              )}
            />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function HomeV123Section() {
  return (
    <SectionContainer
      id="platform-v123"
      className={`${homepageScrollMt} border-t border-[var(--ds-color-border)] ${homepageSectionY}`}
      aria-labelledby="platform-v123-heading"
    >
      <div className={`${homepageSectionHeadMb} mx-auto max-w-3xl text-center`}>
        <h2 id="platform-v123-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          DOSYORA belge okumaktan daha fazlası.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
          Belgeden veriye. Veriden akıllı ofise. Akıllı ofisten iş süreçlerine.
        </p>
      </div>

      <div className="grid gap-4 lg:flex lg:items-stretch lg:gap-0">
        {productVersions.map((version, index) => (
          <Fragment key={version.id}>
            {index > 0 ? <VersionConnector /> : null}
            <VersionCard version={version} />
          </Fragment>
        ))}
      </div>
    </SectionContainer>
  )
}
