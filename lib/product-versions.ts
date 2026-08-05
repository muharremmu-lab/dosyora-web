export type ProductVersionStatus = 'live' | 'soon' | 'planned'

export type ProductFeature = {
  title: string
  description: string
}

export type ProductVersion = {
  id: 'v1' | 'v2' | 'v3' | 'v4'
  title: string
  status: ProductVersionStatus
  statusLabel: string
  description: string
  features: ProductFeature[]
}

export const productVersionStatusVariant: Record<
  ProductVersionStatus,
  'success' | 'warning' | 'primary'
> = {
  live: 'success',
  soon: 'warning',
  planned: 'primary',
}

export const productVersions: ProductVersion[] = [
  {
    id: 'v1',
    title: 'DOSYORA V1',
    status: 'live',
    statusLabel: 'Yayında',
    description:
      'Muhasebe belgelerinizi yapay zekâ ile okuyun, güvenli arşivde saklayın ve muhasebe programınıza uygun Excel şablonlarına aktarın.',
    features: [
      {
        title: 'Belge Okuma',
        description:
          'Fatura, fiş, makbuz ve ekstreleri otomatik okuyarak alanları yapılandırılmış veriye dönüştürür.',
      },
      {
        title: 'Temel Arşiv',
        description:
          'Tüm belgeleri web tabanlı arşivde güvenle saklayın, arayın ve ekip içinde erişilebilir tutun.',
      },
      {
        title: 'Excel Aktarım Şablonları',
        description:
          'Luca, Defter Beyan, Logo, Mikro, ETA ve diğer programlara uygun aktarım dosyaları üretir.',
      },
    ],
  },
  {
    id: 'v2',
    title: 'DOSYORA V2',
    status: 'soon',
    statusLabel: 'Yakında',
    description:
      'Belge yönetimini ofis operasyonlarıyla birleştiren Akıllı Ofis modülü ile cari, görev ve iş akışlarını tek platformda yönetin.',
    features: [
      {
        title: 'Akıllı Ofis',
        description:
          'CRM, cari bazlı evrak yönetimi, iş dosyaları, görev takibi ve takvim ile entegre ofis deneyimi sunar.',
      },
      {
        title: 'CRM',
        description: 'Müşteri ve cari ilişkilerini belge akışıyla birlikte yönetmenizi sağlar.',
      },
      {
        title: 'Görev Takibi',
        description: 'Ekip görevlerini belge süreçleriyle ilişkilendirerek operasyonel görünürlük sağlar.',
      },
    ],
  },
  {
    id: 'v3',
    title: 'DOSYORA V3',
    status: 'soon',
    statusLabel: 'Yakında',
    description:
      'Teklif, sözleşme, mutabakat ve kurumsal belgeleri şablon tabanlı olarak üretin; okuma ve üretimi aynı platformda birleştirin.',
    features: [
      {
        title: 'Belge Üretme',
        description:
          'Teklif, sözleşme, mutabakat, tahsilat yazısı ve kurumsal belgeleri hızlıca oluşturmanızı sağlar.',
      },
      {
        title: 'Teklif',
        description: 'Standart teklif şablonları ile tutarlı ve hızlı belge üretimi.',
      },
      {
        title: 'Sözleşme',
        description: 'Kurumsal sözleşme ve resmi yazıları dijital ortamda hazırlayın.',
      },
    ],
  },
  {
    id: 'v4',
    title: 'DOSYORA V4',
    status: 'planned',
    statusLabel: 'Planlanıyor',
    description:
      'Mali müşavir, avukat, teknik servis, inşaat, sağlık ve oto kiralama gibi sektörlere özel iş akışları ve belge süreçleri sunar.',
    features: [
      {
        title: 'Sektörel Çözümler',
        description:
          'Her sektörün belge ve operasyon ihtiyaçlarına göre özelleştirilmiş modüller içerir.',
      },
      {
        title: 'Mali Müşavir',
        description: 'Çok müşterili muhasebe ofisleri için ölçeklenebilir belge ve arşiv yönetimi.',
      },
      {
        title: 'Avukat',
        description: 'Hukuk büroları için evrak, dosya ve belge üretim süreçlerine uygun yapı.',
      },
    ],
  },
]
