export const siteConfig = {
  name: 'Dosyora',
  title: 'Dosyora',
  seoTitle: 'Dosyora | Yapay Zeka Destekli Belge Okuma ve Dijital Arşiv',
  description:
    'Fiş, fatura, poliçe ve diğer belgelerinizi yapay zekâ ile okuyun; kontrol edin ve muhasebede kullanılabilir veriye dönüştürün.',
  keywords: [
    'belge okuma',
    'yapay zeka',
    'muhasebe',
    'dijital arşiv',
    'fatura okuma',
    'OCR',
    'excel aktarım',
    'Luca',
    'Defter Beyan',
    'evrak yönetimi',
    'bulut arşiv',
    'KOBİ muhasebe',
  ],
  locale: 'tr_TR',
  category: 'Business Software',
  applicationName: 'Dosyora',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dosyora.com',
} as const

export const siteRoutes = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/urun', label: 'Ürün' },
  { path: '/ozellikler', label: 'Özellikler' },
  { path: '/cozumler', label: 'Çözümler' },
  { path: '/blog', label: 'Blog' },
  { path: '/hakkimizda', label: 'Hakkımızda' },
  { path: '/iletisim', label: 'İletişim' },
  { path: '/demo', label: 'Demo' },
  { path: '/fiyatlandirma', label: 'Fiyatlandırma' },
  { path: '/kvkk', label: 'KVKK' },
  { path: '/gizlilik', label: 'Gizlilik' },
  { path: '/kullanim-sartlari', label: 'Kullanım Şartları' },
] as const

export const mainNavItems = [
  { path: '/urun', label: 'Ürün' },
  { path: '/#nasil-calisir', label: 'Nasıl Çalışır?' },
  { path: '/cozumler', label: 'Çözümler' },
  { path: '/#platform-v123', label: 'V1 / V2 / V3' },
  { path: '/hakkimizda', label: 'Hakkımızda' },
] as const

export const footerNavItems = [
  { path: '/hakkimizda', label: 'Hakkımızda' },
  { path: '/#iletisim', label: 'İletişim' },
  { path: '/?type=demo#iletisim', label: 'Demo Talep Et' },
  { path: '/kvkk', label: 'Kişisel Verilerin Korunması' },
  { path: '/gizlilik', label: 'Gizlilik Politikası' },
  { path: '/kullanim-sartlari', label: 'Kullanım Şartları' },
] as const

export const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/dosyora',
  },
  {
    label: 'X',
    href: 'https://x.com/dosyora',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@dosyora',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/muharremmu-lab/dosyora-web',
  },
] as const

export type SiteRoutePath = (typeof siteRoutes)[number]['path']

export const ogImagePath = '/og-image.jpg'

export const contactInfo = {
  phone: '+90 (212) 000 00 00',
  email: 'info@dosyora.com',
  address: 'İstanbul, Türkiye',
  hours: 'Pazartesi – Cuma, 09:00 – 18:00',
} as const
