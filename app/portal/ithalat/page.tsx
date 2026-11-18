import { ArrowUpRight, DollarSign, FileSpreadsheet } from 'lucide-react'

import { requirePackage } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export default async function IthalatPage() {
  // Sunucu tarafı kontrol: İthalat paketi zorunlu
  await requirePackage('ithalat')

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--ds-color-border)] pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
            İthalat ve Maliyet Robotu
          </h1>
          <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5">
            Maliyet Analiz
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
          Gümrük beyannameleri, gümrük vergileri, navlun ve ithalat birim maliyetlerini otomatik hesaplayın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Hızlı Maliyet Hesabı</h3>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xs text-[var(--ds-color-text-muted)] mb-4">
            FOB tutar, navlun, sigorta ve GTİP vergi oranlarını girerek net birim maliyet çıkarın.
          </p>
          <button className="w-full rounded bg-[var(--ds-color-primary)] py-2 text-xs font-semibold text-white hover:bg-[var(--ds-color-primary-deep)]">
            Yeni Hesaplama Başlat
          </button>
        </div>

        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Beyanname Yükle (XML/PDF)</h3>
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs text-[var(--ds-color-text-muted)] mb-4">
            Gümrük beyannamesi dosyasını yükleyin; kalem bazlı dağıtım tablosu otomatik oluşsun.
          </p>
          <button className="w-full rounded border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-2 text-xs font-semibold text-[var(--ds-color-text)] hover:bg-gray-200">
            Beyanname Yükle
          </button>
        </div>

        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">GTİP & Mevzuat Sorgu</h3>
            <ArrowUpRight className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xs text-[var(--ds-color-text-muted)] mb-4">
            Güncel gümrük tarife istatistik pozisyonu (GTİP) vergi ve ek maliyet oranlarını sorgulayın.
          </p>
          <button className="w-full rounded border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] py-2 text-xs font-semibold text-[var(--ds-color-text)] hover:bg-gray-200">
            GTİP Sorgula
          </button>
        </div>
      </div>
    </div>
  )
}
