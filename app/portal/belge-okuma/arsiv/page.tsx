import { Folder, Search, Filter } from 'lucide-react'

import { requirePackage } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export default async function BelgeArsivPage() {
  // Sunucu tarafı kontrol: Belge okuma paketi zorunlu
  await requirePackage('belge_okuma')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--ds-color-border)] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
            Belge Arşivi
          </h1>
          <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
            Taranmış ve işlenmiş tüm fatura, fiş ve evraklarınızın aranabilir dijital arşivi.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ds-color-text-muted)]" />
          <input
            type="text"
            placeholder="Firma, Fatura No, Vergi No veya Tutar ile arşivde ara..."
            className="w-full rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] py-2 pl-9 pr-4 text-sm text-[var(--ds-color-text)] focus:border-[var(--ds-color-primary)] focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-2 text-sm text-[var(--ds-color-text)] hover:bg-[var(--ds-color-surface-alt)]">
          <Filter className="h-4 w-4 text-gray-500" />
          <span>Filtrele</span>
        </button>
      </div>

      <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-12 text-center">
        <Folder className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-base font-semibold text-[var(--ds-color-text)]">
          Arşivlenmiş Belge Bulunmuyor
        </h2>
        <p className="mt-1 text-xs text-[var(--ds-color-text-muted)] max-w-sm mx-auto">
          Belge Yükle menüsünden yükleyeceğiniz evraklar otomatik olarak OCR işleminden geçirilerek bu arşivde saklanır.
        </p>
      </div>
    </div>
  )
}
