import { AppScreenFrame } from '../app-screen-frame'

export function ScreenBelgeOkuma() {
  return (
    <AppScreenFrame title="Belge Okuma" subtitle="Yükle">
      <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--ds-radius-md)] border border-dashed border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]">
        <p className="text-[10px] font-medium text-[var(--ds-color-primary)]">Dosyayı sürükleyin</p>
        <p className="mt-1 text-[10px] text-[var(--ds-color-text-muted)]">PDF · JPG · PNG</p>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {['Fatura', 'Fiş', 'Makbuz'].map((type) => (
          <div
            key={type}
            className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-2 py-1 text-center text-[9px] text-[var(--ds-color-text-muted)]"
          >
            {type}
          </div>
        ))}
      </div>
    </AppScreenFrame>
  )
}

export function ScreenSonucFormu() {
  return (
    <AppScreenFrame title="Sonuç Formu" subtitle="Doğrulama">
      <div className="grid flex-1 grid-cols-2 gap-2">
        <div className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-2">
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 rounded bg-[var(--ds-color-border)]" />
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {['Satıcı', 'Tutar', 'KDV', 'Toplam'].map((label) => (
            <div
              key={label}
              className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] px-2 py-1"
            >
              <p className="text-[8px] text-[var(--ds-color-text-muted)]">{label}</p>
              <p className="text-[9px] font-semibold text-[var(--ds-color-text)]">—</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <span className="rounded-[var(--ds-radius-sm)] bg-[var(--ds-color-primary)] px-2 py-0.5 text-[9px] font-medium text-[var(--ds-color-secondary)]">
          Onayla
        </span>
      </div>
    </AppScreenFrame>
  )
}

export function ScreenAkilliArsiv() {
  return (
    <AppScreenFrame title="Akıllı Arşiv" subtitle="Filtre">
      <div className="mb-2 flex gap-1">
        {['Tümü', 'Fatura', 'Fiş'].map((tab, i) => (
          <span
            key={tab}
            className={`rounded-full px-2 py-0.5 text-[8px] ${i === 0 ? 'bg-[var(--ds-color-primary)] text-[var(--ds-color-secondary)]' : 'bg-[var(--ds-color-surface-alt)] text-[var(--ds-color-text-muted)]'}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-1">
        {[
          { name: 'Mart_Fatura.pdf', tag: 'Okundu' },
          { name: 'Gider_Fisi.jpg', tag: 'Arşiv' },
          { name: 'Ekstre.pdf', tag: 'Okundu' },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] px-2 py-1"
          >
            <span className="truncate text-[9px] text-[var(--ds-color-text)]">{item.name}</span>
            <span className="text-[8px] text-[var(--ds-color-success)]">{item.tag}</span>
          </div>
        ))}
      </div>
    </AppScreenFrame>
  )
}

export function ScreenBelgeUretme() {
  return (
    <AppScreenFrame title="Belge Üretme" subtitle="Şablon">
      <div className="grid flex-1 grid-cols-2 gap-2">
        {['Teklif', 'Sözleşme', 'Mutabakat', 'İK Belgesi'].map((doc) => (
          <div
            key={doc}
            className="flex flex-col justify-between rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-2"
          >
            <p className="text-[9px] font-semibold text-[var(--ds-color-text)]">{doc}</p>
            <span className="text-[8px] text-[var(--ds-color-primary)]">Oluştur →</span>
          </div>
        ))}
      </div>
    </AppScreenFrame>
  )
}

export function ScreenDemoPaneli() {
  return (
    <AppScreenFrame title="Demo Paneli" subtitle="100 belge">
      <div className="grid flex-1 grid-cols-3 gap-2">
        {[
          { label: 'Kalan', value: '87' },
          { label: 'Okunan', value: '13' },
          { label: 'Limit', value: '100' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-2 text-center"
          >
            <p className="text-[8px] text-[var(--ds-color-text-muted)]">{stat.label}</p>
            <p className="text-sm font-bold text-[var(--ds-color-text)]">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--ds-color-border)]">
        <div className="h-full w-[13%] rounded-full bg-[var(--ds-color-primary)]" />
      </div>
    </AppScreenFrame>
  )
}

export function ScreenRaporlar() {
  return (
    <AppScreenFrame title="Raporlar" subtitle="Özet">
      <div className="mb-2 flex items-end gap-1">
        {[40, 65, 45, 80, 55, 70].map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[var(--ds-radius-sm)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_20%,white)]"
            style={{ height: `${height}%`, minHeight: '1.5rem' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] p-2">
          <p className="text-[8px] text-[var(--ds-color-text-muted)]">Bu ay</p>
          <p className="text-[10px] font-semibold text-[var(--ds-color-text)]">1.284 belge</p>
        </div>
        <div className="rounded-[var(--ds-radius-sm)] border border-[var(--ds-color-border)] p-2">
          <p className="text-[8px] text-[var(--ds-color-text-muted)]">Doğruluk</p>
          <p className="text-[10px] font-semibold text-[var(--ds-color-text)]">%96</p>
        </div>
      </div>
    </AppScreenFrame>
  )
}
