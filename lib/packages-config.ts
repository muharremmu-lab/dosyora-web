export type PackageCode = 'tebligat' | 'belge_okuma' | 'ithalat' | 'akilli_ofis'

export type PackageDefinition = {
  code: PackageCode
  name: string
  description: string
  route: string
}

export const KNOWN_PACKAGES: PackageDefinition[] = [
  {
    code: 'tebligat',
    name: 'Tebligat',
    description: 'GİB E-Tebligat otomatik sorgulama ve bildirim sistemi',
    route: '/portal/tebligat',
  },
  {
    code: 'belge_okuma',
    name: 'Belge Okuma',
    description: 'Yapay zeka destekli evrak okuma ve arşiv yönetimi',
    route: '/portal/belge-okuma/yukle',
  },
  {
    code: 'ithalat',
    name: 'İthalat ve Maliyet Robotu',
    description: 'İthalat beyanname ve maliyet analiz robotu',
    route: '/portal/ithalat',
  },
  {
    code: 'akilli_ofis',
    name: 'Akıllı Ofis',
    description: 'Akıllı ofis otomasyon ve operasyon çözümleri',
    route: '/portal/akilli-ofis',
  },
]

export const ALL_PACKAGE_CODES: PackageCode[] = [
  'tebligat',
  'belge_okuma',
  'ithalat',
  'akilli_ofis',
]

/**
 * Kullanıcının tüm paketlere sahip olup olmadığını kontrol eder.
 * Kullanıcıda 'tam', 'tam_paket', 'all', 'full' yetkisi varsa veya tüm kodlar mevcutsa true döner.
 */
export function isAllPackages(packages?: string[] | null): boolean {
  if (!packages || packages.length === 0) return false
  if (
    packages.includes('tam') ||
    packages.includes('tam_paket') ||
    packages.includes('all') ||
    packages.includes('full')
  ) {
    return true
  }
  return ALL_PACKAGE_CODES.every((code) => packages.includes(code))
}

/**
 * Kullanıcının belirli bir pakete erişim yetkisi olup olmadığını belirler.
 * - Admin rolü her pakete erişebilir.
 * - Tam paket yetkisi olan kullanıcı her pakete erişebilir.
 * - Paket koduna sahip olan kullanıcı erişebilir.
 */
export function hasPackageAccess(
  userOrSession: { role?: string; packages?: string[] } | null | undefined,
  targetPackage: PackageCode | string,
): boolean {
  if (!userOrSession) return false
  if (userOrSession.role === 'admin') return true
  const pkgs = userOrSession.packages || []
  if (isAllPackages(pkgs)) return true
  return pkgs.includes(targetPackage)
}

/**
 * Belirli bir paketin ana giriş yolunu döner.
 */
export function getPackageHomeRoute(packageCode: string): string {
  switch (packageCode) {
    case 'tebligat':
      return '/portal/tebligat'
    case 'ithalat':
      return '/portal/ithalat'
    case 'belge_okuma':
      return '/portal/belge-okuma/yukle'
    case 'akilli_ofis':
      return '/portal/akilli-ofis'
    default:
      return '/portal'
  }
}

/**
 * Kullanıcının rol ve paket durumuna göre varsayılan portal yönlendirme yolunu belirler.
 * - Sadece 1 paketi olan kullanıcı doğrudan o paketin sayfasına gider.
 * - Birden fazla paketi olanlar, tam paketi olanlar veya Admin /portal paneline gider.
 */
export function getUserDefaultPortalRoute(user: {
  role?: string
  packages?: string[]
} | null | undefined): string {
  if (!user) return '/login'
  if (user.role === 'admin') return '/portal'
  const pkgs = user.packages || []
  if (isAllPackages(pkgs) || pkgs.length > 1 || pkgs.length === 0) {
    return '/portal'
  }
  return getPackageHomeRoute(pkgs[0])
}

