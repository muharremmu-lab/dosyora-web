import { SectionContainer } from '@/components/ui'

export default function Loading() {
  return (
    <SectionContainer className="flex min-h-[50vh] flex-col items-center justify-center py-[var(--ds-space-16)]">
      <div
        className="size-10 animate-spin rounded-full border-2 border-[var(--ds-color-border)] border-t-[var(--ds-color-primary)]"
        role="status"
        aria-label="Yükleniyor"
      />
      <p className="mt-4 text-sm text-[var(--ds-color-text-muted)]">Yükleniyor…</p>
    </SectionContainer>
  )
}
