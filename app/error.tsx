'use client'

import { useEffect } from 'react'

import { SiteFooter, SiteHeader } from '@/components/marketing'
import { Button, SectionContainer } from '@/components/ui'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer
          className="flex min-h-[60vh] flex-col items-center justify-center py-[var(--ds-space-16)] text-center sm:py-[var(--ds-space-24)]"
          aria-labelledby="error-heading"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--ds-color-text-muted)]">
            Hata
          </p>
          <h1 id="error-heading" className="mt-4 text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
            Bir sorun oluştu
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--ds-color-text-muted)]">
            Sayfa yüklenirken beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.
          </p>
          <div className="mt-8">
            <Button type="button" variant="primary" className="px-5 py-2.5" onClick={reset} aria-label="Sayfayı yeniden yükle">
              Tekrar Dene
            </Button>
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
