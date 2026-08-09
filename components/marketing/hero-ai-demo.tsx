'use client'

import { Check, Cpu, FileUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/design-system/cn'

const stages = [
  { id: 'drop', label: 'Dosya sürükleniyor…', icon: FileUp },
  { id: 'loading', label: 'Yükleniyor…', icon: Loader2 },
  { id: 'ai', label: 'AI analiz ediyor…', icon: Cpu },
  { id: 'fields', label: 'Alanlar otomatik doluyor…', icon: Cpu },
  { id: 'done', label: 'Belge başarıyla işlendi', icon: Check },
] as const

const fields = [
  { label: 'Satıcı', value: 'ABC Ticaret A.Ş.' },
  { label: 'Vergi No', value: '1234567890' },
  { label: 'Tutar', value: '₺12.450,00' },
  { label: 'Tarih', value: '15.03.2026' },
]

export function HeroAiDemo({ className }: { className?: string }) {
  const [stageIndex, setStageIndex] = useState(0)
  const stage = stages[stageIndex]
  const StageIcon = stage.icon

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % stages.length)
    }, 2800)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-lg)]',
        className,
      )}
      role="img"
      aria-label="AI belge okuma ekranı demosu"
    >
      <div className="flex items-center gap-2 border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--ds-color-border)]" />
        <span className="ml-2 text-xs text-[var(--ds-color-text-muted)]">Belge Okuma · AI</span>
      </div>

      <div className="grid min-h-[300px] grid-cols-[4.5rem_1fr] sm:min-h-[320px]">
        <aside className="border-r border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-3">
          <div className="flex size-9 items-center justify-center rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] text-[var(--ds-color-secondary)]">
            <Icon icon={Cpu} size="sm" />
          </div>
        </aside>

        <div className="flex flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--ds-color-text)]">Fatura · Yapay Zekâ ile Okuma</p>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium',
                stage.id === 'done'
                  ? 'bg-[color:color-mix(in_srgb,var(--ds-color-success)_14%,white)] text-[var(--ds-color-success)]'
                  : 'bg-[color:color-mix(in_srgb,var(--ds-color-primary)_10%,white)] text-[var(--ds-color-primary)]',
              )}
              aria-live="polite"
            >
              <Icon
                icon={StageIcon}
                size="sm"
                className={cn(stage.id === 'loading' && 'animate-spin')}
              />
              {stage.label}
            </span>
          </div>

          {(stage.id === 'drop' || stage.id === 'loading') && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--ds-radius-lg)] border-2 border-dashed border-[color:color-mix(in_srgb,var(--ds-color-primary)_25%,var(--ds-color-border))] bg-[var(--ds-color-surface-alt)] px-6 py-10 text-center">
              <Icon icon={FileUp} size="md" className="text-[var(--ds-color-primary)]" />
              <p className="mt-3 text-sm font-medium text-[var(--ds-color-text)]">
                {stage.id === 'drop' ? 'Fatura.pdf bırakın' : 'Dosya yükleniyor…'}
              </p>
              {stage.id === 'loading' ? (
                <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--ds-color-border)]">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--ds-color-primary)]" />
                </div>
              ) : null}
            </div>
          )}

          {(stage.id === 'ai' || stage.id === 'fields' || stage.id === 'done') && (
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-3">
                <p className="text-[10px] font-medium uppercase text-[var(--ds-color-text-muted)]">
                  Belge önizleme
                </p>
                <div className="mt-2 space-y-1.5">
                  {[1, 2, 3, 4].map((row) => (
                    <div
                      key={row}
                      className="h-2 rounded bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)]"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const showValue =
                    stage.id === 'done' ||
                    (stage.id === 'fields' && index <= 1) ||
                    stage.id === 'ai'
                  const filled =
                    stage.id === 'done' || (stage.id === 'fields' && index <= 1)

                  return (
                    <div
                      key={field.label}
                      className={cn(
                        'rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] px-3 py-2 ds-transition-hover',
                        filled
                          ? 'bg-[var(--ds-color-surface)]'
                          : 'bg-[var(--ds-color-surface-alt)] opacity-60',
                      )}
                    >
                      <p className="text-[10px] text-[var(--ds-color-text-muted)]">{field.label}</p>
                      <p className="text-xs font-semibold text-[var(--ds-color-text)]">
                        {showValue && filled ? field.value : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {stage.id === 'done' ? (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--ds-color-success)]">
              Belge başarıyla işlendi ✓
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
