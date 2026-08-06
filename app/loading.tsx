import { SectionContainer } from '@/components/ui'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`rounded-[var(--ds-radius-md)] ds-animate-shimmer ${className ?? ''}`} />
}

export default function Loading() {
  return (
    <SectionContainer
      className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-busy="true"
      aria-live="polite"
      aria-label="Sayfa yükleniyor"
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="h-10 w-full max-w-lg" />
          <SkeletonBlock className="h-10 w-full max-w-md" />
          <SkeletonBlock className="h-4 w-full max-w-sm" />
          <SkeletonBlock className="h-4 w-full max-w-xs" />
          <div className="flex gap-3 pt-4">
            <SkeletonBlock className="h-10 w-32" />
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </div>
        <SkeletonBlock className="aspect-[16/10] w-full" />
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] p-4">
            <SkeletonBlock className="aspect-[16/10] w-full" />
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-3 w-full" />
          </div>
        ))}
      </div>

      <p className="sr-only" role="status">
        Yükleniyor…
      </p>
    </SectionContainer>
  )
}
