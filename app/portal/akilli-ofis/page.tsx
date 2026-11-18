import { Bot, Calendar, Sparkles } from 'lucide-react'

import { requirePackage } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export default async function AkilliOfisPage() {
  // Sunucu tarafı kontrol: Akıllı ofis paketi zorunlu
  await requirePackage('akilli_ofis')

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--ds-color-border)] pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
            Akıllı Ofis
          </h1>
          <span className="rounded bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5">
            Otomasyon
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
          Mali müşavirlik ve ofis iş akışlarını otomatikleştirin, bildirimleri ve randevuları tek merkezden yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">WhatsApp Bildirim Botu</h3>
            <Bot className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xs text-[var(--ds-color-text-muted)]">
            Mükelleflerinize KDV, Muhtasar ve SGK tahakkuk fişlerini otomatik WhatsApp mesajı olarak iletin.
          </p>
        </div>

        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Mali Takvim & Hatırlatıcı</h3>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs text-[var(--ds-color-text-muted)]">
            Vergi ve beyanname son ödeme günlerini kaçırmamak için akıllı ajanda ve SMS/e-posta alarmları.
          </p>
        </div>

        <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Ofis Görev Dağıtımı</h3>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xs text-[var(--ds-color-text-muted)]">
            Ekip personeline otomatik mükellef ve iş ataması, tamamlama durumu takibi.
          </p>
        </div>
      </div>
    </div>
  )
}
