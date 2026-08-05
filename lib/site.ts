export const siteConfig = {
  name: 'Dosyora',
  title: 'Dosyora',
  description:
    'Dosyora; fatura, fiş, makbuz ve ticari belgeleri yapay zekâ ile okuyan, arşivleyen ve muhasebe süreçlerini hızlandıran web tabanlı bir platformdur.',
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
  { path: '/urun', label: 'Ürün' },
  { path: '/cozumler', label: 'Çözümler' },
  { path: '/iletisim', label: 'İletişim' },
  { path: '/blog', label: 'Blog' },
] as const

export type SiteRoutePath = (typeof siteRoutes)[number]['path']
