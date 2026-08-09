export type ProductVersionStatus = 'preparing' | 'developing' | 'vision'

export type ProductFeature = {
  title: string
  description: string
}

export type ProductVersion = {
  id: 'v1' | 'v2' | 'v3'
  title: string
  subtitle: string
  status: ProductVersionStatus
  statusLabel: string
  description: string
  features: string[]
}

export const productVersionStatusVariant: Record<
  ProductVersionStatus,
  'success' | 'warning' | 'primary'
> = {
  preparing: 'warning',
  developing: 'warning',
  vision: 'primary',
}

export const productVersions: ProductVersion[] = [
  {
    id: 'v1',
    title: 'V1',
    subtitle: 'Belge Okuma & Muhasebe',
    status: 'preparing',
    statusLabel: 'Kullanıma Hazırlanıyor',
    description:
      'Belgelerinizi yükleyin, bilgileri çıkarın, kontrol edin ve muhasebede kullanılabilir veriye dönüştürün.',
    features: [
      'Belge yükleme',
      'Yapay zekâ ile veri çıkarımı',
      'İnsan kontrolü',
      'Matrah / KDV kontrolü',
      'Excel / muhasebe çıktısı',
      'Dijital arşiv',
    ],
  },
  {
    id: 'v2',
    title: 'V2',
    subtitle: 'Akıllı Ofis',
    status: 'developing',
    statusLabel: 'Geliştiriliyor',
    description:
      'Belgelerin yalnızca okunduğu değil; düzenlendiği, ilişkilendirildiği ve iş hayatının parçası haline geldiği çalışma alanı.',
    features: [
      'Akıllı Arşiv',
      'Belge Üretme',
      'Cari / iş dosyaları',
      'Belge ilişkilendirme',
      'Hatırlatmalar',
      'Ofis iş akışları',
    ],
  },
  {
    id: 'v3',
    title: 'V3',
    subtitle: 'Sektörel Çözümler',
    status: 'vision',
    statusLabel: 'Platform Vizyonu',
    description:
      'Belgeden çıkarılan verinin doğrudan iş süreçlerini oluşturduğu sektörel DOSYORA uygulamaları.',
    features: [
      'KDV İade',
      'Filo / Rent a Car',
      'Hakediş',
      'Sektörel belge ve veri akışları',
      'Yeni modüler çözümler',
    ],
  },
]
