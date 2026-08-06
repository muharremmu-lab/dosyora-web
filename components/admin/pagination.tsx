import Link from 'next/link'

import { cn } from '@/lib/design-system/cn'

type PaginationProps = {
  page: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string | undefined>
}

function buildHref(basePath: string, page: number, searchParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams()

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value)
    }
  }

  params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export function Pagination({ page, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const prevPage = Math.max(1, page - 1)
  const nextPage = Math.min(totalPages, page + 1)

  return (
    <nav aria-label="Sayfalama" className="mt-6 flex items-center justify-between gap-3">
      <Link
        href={buildHref(basePath, prevPage, searchParams)}
        aria-disabled={page <= 1}
        className={cn(
          'rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-2 text-sm font-medium ds-transition-hover',
          page <= 1
            ? 'pointer-events-none opacity-50'
            : 'hover:bg-[var(--ds-color-surface-alt)]',
        )}
      >
        Önceki
      </Link>
      <p className="text-sm text-[var(--ds-color-text-muted)]">
        Sayfa {page} / {totalPages}
      </p>
      <Link
        href={buildHref(basePath, nextPage, searchParams)}
        aria-disabled={page >= totalPages}
        className={cn(
          'rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-2 text-sm font-medium ds-transition-hover',
          page >= totalPages
            ? 'pointer-events-none opacity-50'
            : 'hover:bg-[var(--ds-color-surface-alt)]',
        )}
      >
        Sonraki
      </Link>
    </nav>
  )
}
