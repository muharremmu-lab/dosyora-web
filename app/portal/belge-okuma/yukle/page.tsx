import { UploadCloud, CheckCircle } from 'lucide-react'

import { requirePackage } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export default async function BelgeYuklePage() {
  // Sunucu tarafı kontrol: Belge okuma paketi zorunlu
  await requirePackage('belge_okuma')

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--ds-color-border)] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
          Belge Yükle
        </h1>
        <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
          Faturalarınızı, fişlerinizi veya dekontlarınızı yükleyin; yapay zeka saniyeler içinde okuyup sisteme işlesin.
        </p>
      </div>

      <div className="rounded-[var(--ds-radius-lg)] border-2 border-dashed border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-12 text-center hover:border-[var(--ds-color-primary)] ds-transition-hover">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ds-color-text)]">
          Dosyaları buraya sürükleyip bırakın
        </h2>
        <p className="mt-1 text-xs text-[var(--ds-color-text-muted)]">
          PDF, PNG, JPG veya TIFF (Maksimum 25MB)
        </p>
        <div className="mt-6">
          <label className="cursor-pointer rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[var(--ds-color-primary-deep)]">
            Dosya Seçin
            <input type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg,.tiff" />
          </label>
        </div>
      </div>

      <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>Yapay Zeka Destekli Belge Okuma Özellikleri</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--ds-color-text-muted)] leading-relaxed">
          <div className="p-3 bg-[var(--ds-color-surface-alt)] rounded">
            <strong>E-Fatura & Arşiv:</strong> VKN, Fatura No, Tarih, KDV matrahları ve toplam tutarları hatasız çıkarır.
          </div>
          <div className="p-3 bg-[var(--ds-color-surface-alt)] rounded">
            <strong>Banka Dekontları:</strong> IBAN, açıklama, işlem kodu ve borç/alacak bakiyelerini ayrıştırır.
          </div>
          <div className="p-3 bg-[var(--ds-color-surface-alt)] rounded">
            <strong>Muhasebe Entegrasyonu:</strong> Zirve, Luca, Mikro ve Logo formatlarına tek tıkla aktarım sağlar.
          </div>
        </div>
      </div>
    </div>
  )
}
