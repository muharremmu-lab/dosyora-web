import { Check } from 'lucide-react'

import { Badge, Card, Icon, SectionContainer } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'

type RoadmapStatus = 'live' | 'soon' | 'planned'

type RoadmapVersion = {
  title: string
  status: RoadmapStatus
  statusLabel: string
  items: string[]
  checked?: boolean
}

const statusVariant: Record<RoadmapStatus, 'success' | 'warning' | 'primary'> = {
  live: 'success',
  soon: 'warning',
  planned: 'primary',
}

const roadmapVersions: RoadmapVersion[] = [
  {
    title: 'DOSYORA V1',
    status: 'live',
    statusLabel: 'YAYINDA',
    checked: true,
    items: [
      'Yapay Zekâ Belge Okuma',
      'Temel Arşiv',
      'Excel Aktarım Şablonları',
      'Luca',
      'Defter Beyan',
      'Logo',
      'Mikro',
      'ETA',
    ],
  },
  {
    title: 'DOSYORA V2',
    status: 'soon',
    statusLabel: 'Yakında',
    items: [
      'Akıllı Ofis',
      'CRM',
      'Cari Bazlı Evrak Yönetimi',
      'İş Dosyaları',
      'Görev Takibi',
      'Takvim',
    ],
  },
  {
    title: 'DOSYORA V3',
    status: 'soon',
    statusLabel: 'Yakında',
    items: [
      'Belge Üretme',
      'Teklif',
      'Sözleşme',
      'Mutabakat',
      'Tahsilat Yazısı',
      'Kurumsal Belgeler',
    ],
  },
  {
    title: 'DOSYORA V4',
    status: 'planned',
    statusLabel: 'Planlanıyor',
    items: [
      'Sektörel Çözümler',
      'Mali Müşavir',
      'Avukat',
      'Teknik Servis',
      'İnşaat',
      'Sağlık',
      'Oto Kiralama',
    ],
  },
]

export function RoadmapSection() {
  return (
    <SectionContainer
      id="roadmap"
      className="border-t border-[var(--ds-color-border)] py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
    >
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          DOSYORA Yol Haritası
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roadmapVersions.map((version, index) => (
          <Card
            key={version.title}
            className="ds-animate-slide-up flex flex-col"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--ds-color-text)]">{version.title}</h3>
              <Badge variant={statusVariant[version.status]} className="shrink-0 text-[10px] uppercase">
                {version.statusLabel}
              </Badge>
            </div>

            <ul className="space-y-2">
              {version.items.map((item) => (
                <li
                  key={item}
                  className={cn(
                    'flex items-start gap-2 text-sm text-[var(--ds-color-text-muted)]',
                    version.checked && 'text-[var(--ds-color-text)]',
                  )}
                >
                  {version.checked ? (
                    <Icon
                      icon={Check}
                      size="sm"
                      className="mt-0.5 shrink-0 text-[var(--ds-color-success)]"
                    />
                  ) : (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ds-color-border)]" />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
