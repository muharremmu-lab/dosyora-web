export const siteConfig = {
  name: 'Dosyora',
  title: 'Dosyora',
  seoTitle: 'DOSYORA | Yapay Zekâ Destekli Belge Okuma ve Dijital Arşiv',
  description:
    'DOSYORA; belge okuma, temel arşiv, Excel aktarım şablonları, Akıllı Ofis, Belge Üretme ve sektörel çözümler sunan web tabanlı platformdur.',
  locale: 'tr_TR',
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
  { path: '/kvkk', label: 'KVKK' },
  { path: '/gizlilik', label: 'Gizlilik' },
] as const

export const mainNavItems = [
  { path: '/urun', label: 'Ürün' },
  { path: '/ozellikler', label: 'Özellikler' },
  { path: '/cozumler', label: 'Çözümler' },
  { path: '/blog', label: 'Blog' },
  { path: '/hakkimizda', label: 'Hakkımızda' },
  { path: '/iletisim', label: 'İletişim' },
] as const

export const footerNavItems = [
  { path: '/#roadmap', label: 'Roadmap' },
  { path: '/demo', label: 'Demo' },
  { path: '/kvkk', label: 'KVKK' },
  { path: '/gizlilik', label: 'Gizlilik' },
  { path: '/iletisim', label: 'İletişim' },
] as const

export type SiteRoutePath = (typeof siteRoutes)[number]['path']
