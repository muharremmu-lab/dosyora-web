import Link from 'next/link'

import { SiteFooter, SiteHeader } from '@/components/marketing'
import { ButtonLink, SectionContainer } from '@/components/ui'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="flex min-h-[60vh] flex-col items-center justify-center py-[var(--ds-space-16)] text-center sm:py-[var(--ds-space-24)]">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--ds-color-text-muted)]">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
            Sayfa bulunamadı
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--ds-color-text-muted)]">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/" variant="primary" className="px-5 py-2.5">
              Ana Sayfaya Dön
            </ButtonLink>
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--ds-color-primary)] ds-transition-hover hover:opacity-80"
            >
              Blog&apos;a göz at
            </Link>
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
