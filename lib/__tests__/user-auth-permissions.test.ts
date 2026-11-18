import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  hasPackageAccess,
  isAllPackages,
  getPackageHomeRoute,
  getUserDefaultPortalRoute,
} from '@/lib/packages-config'

describe('User Authentication & Package Permission Rules', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'test-secret-at-least-32-characters-long!')
  })

  it('signs and verifies user session token correctly', async () => {
    const { createUserSessionToken, verifyUserSessionToken } = await import('@/lib/user-auth')

    const token = createUserSessionToken(
      {
        id: 'usr_1',
        email: 'user1@dosyora.com',
        full_name: 'Ahmet Yılmaz',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ['tebligat'],
    )

    expect(typeof token).toBe('string')
    expect(token).toContain('.')

    const verified = verifyUserSessionToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.email).toBe('user1@dosyora.com')
    expect(verified?.packages).toEqual(['tebligat'])
    expect(verified?.role).toBe('user')
  })

  it('rejects tampered session token', async () => {
    const { createUserSessionToken, verifyUserSessionToken } = await import('@/lib/user-auth')

    const token = createUserSessionToken(
      {
        id: 'usr_1',
        email: 'user1@dosyora.com',
        full_name: 'Ahmet Yılmaz',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ['tebligat'],
    )

    const tampered = 'a' + token.slice(1)
    const verified = verifyUserSessionToken(tampered)
    expect(verified).toBeNull()
  })

  describe('hasPackageAccess logic', () => {
    it('rule 1: Sadece Tebligat paketi olan kullanıcı sadece Tebligat yetkisine sahiptir', () => {
      const user = { role: 'user', packages: ['tebligat'] }
      expect(hasPackageAccess(user, 'tebligat')).toBe(true)
      expect(hasPackageAccess(user, 'ithalat')).toBe(false)
      expect(hasPackageAccess(user, 'belge_okuma')).toBe(false)
      expect(hasPackageAccess(user, 'akilli_ofis')).toBe(false)
    })

    it('rule 2: Sadece ithalat paketi olan kullanıcı sadece ithalat yetkisine sahiptir', () => {
      const user = { role: 'user', packages: ['ithalat'] }
      expect(hasPackageAccess(user, 'ithalat')).toBe(true)
      expect(hasPackageAccess(user, 'tebligat')).toBe(false)
      expect(hasPackageAccess(user, 'belge_okuma')).toBe(false)
      expect(hasPackageAccess(user, 'akilli_ofis')).toBe(false)
    })

    it('rule 3: Sadece belge okuma paketi olan kullanıcı sadece belge okuma yetkisine sahiptir', () => {
      const user = { role: 'user', packages: ['belge_okuma'] }
      expect(hasPackageAccess(user, 'belge_okuma')).toBe(true)
      expect(hasPackageAccess(user, 'tebligat')).toBe(false)
      expect(hasPackageAccess(user, 'ithalat')).toBe(false)
      expect(hasPackageAccess(user, 'akilli_ofis')).toBe(false)
    })

    it('rule 4: Hepsini alan kullanıcı tüm paketlere erişebilir', () => {
      const allPkgsUser = {
        role: 'user',
        packages: ['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis'],
      }
      expect(hasPackageAccess(allPkgsUser, 'tebligat')).toBe(true)
      expect(hasPackageAccess(allPkgsUser, 'belge_okuma')).toBe(true)
      expect(hasPackageAccess(allPkgsUser, 'ithalat')).toBe(true)
      expect(hasPackageAccess(allPkgsUser, 'akilli_ofis')).toBe(true)

      // 'tam' veya 'tam_paket' bundle paketi olan kullanıcı da tüm paketlere erişir
      const tamBundleUser = { role: 'user', packages: ['tam'] }
      expect(hasPackageAccess(tamBundleUser, 'tebligat')).toBe(true)
      expect(hasPackageAccess(tamBundleUser, 'belge_okuma')).toBe(true)
      expect(hasPackageAccess(tamBundleUser, 'ithalat')).toBe(true)
      expect(hasPackageAccess(tamBundleUser, 'akilli_ofis')).toBe(true)
      expect(isAllPackages(tamBundleUser.packages)).toBe(true)
    })

    it('rule 5: Admin rolü paket listesi boş olsa bile her şeye erişebilir', () => {
      const adminUser = { role: 'admin', packages: [] }
      expect(hasPackageAccess(adminUser, 'tebligat')).toBe(true)
      expect(hasPackageAccess(adminUser, 'belge_okuma')).toBe(true)
      expect(hasPackageAccess(adminUser, 'ithalat')).toBe(true)
      expect(hasPackageAccess(adminUser, 'akilli_ofis')).toBe(true)
    })

    it('paketi olmayan kullanıcı hiçbir modüle erişemez', () => {
      const emptyUser = { role: 'user', packages: [] }
      expect(hasPackageAccess(emptyUser, 'tebligat')).toBe(false)
      expect(hasPackageAccess(emptyUser, 'belge_okuma')).toBe(false)
      expect(hasPackageAccess(emptyUser, 'ithalat')).toBe(false)
      expect(hasPackageAccess(emptyUser, 'akilli_ofis')).toBe(false)
    })
  })

  describe('Portal Menü Görünürlük Kuralları', () => {
    // PortalShell menü oluşturma fonksiyonu simülasyonu
    const getVisibleMenuItems = (user: { role?: string; packages?: string[] }) => {
      const hasTebligat = hasPackageAccess(user, 'tebligat')
      const hasBelgeOkuma = hasPackageAccess(user, 'belge_okuma')
      const hasIthalat = hasPackageAccess(user, 'ithalat')
      const hasAkilliOfis = hasPackageAccess(user, 'akilli_ofis')
      const isAdmin = user.role === 'admin'

      const menuItems = [
        { show: hasTebligat, href: '/portal/tebligat', label: 'Tebligat' },
        { show: hasBelgeOkuma, href: '/portal/belge-okuma/yukle', label: 'Belge Okuma' },
        { show: hasBelgeOkuma, href: '/portal/belge-okuma/arsiv', label: 'Arşiv' },
        { show: hasIthalat, href: '/portal/ithalat', label: 'İthalat' },
        { show: hasAkilliOfis, href: '/portal/akilli-ofis', label: 'Akıllı Ofis' },
      ].filter((item) => item.show)

      const adminItems = [
        { show: isAdmin, href: '/portal/admin/users', label: 'Kullanıcı & Paket Yönetimi' },
        { show: isAdmin, href: '/admin', label: 'Admin Paneli' },
      ].filter((item) => item.show)

      return { menuItems, adminItems }
    }

    it('Sadece Tebligat paketi olan kullanıcı SADECE Tebligat menüsünü görür', () => {
      const user = { role: 'user', packages: ['tebligat'] }
      const { menuItems, adminItems } = getVisibleMenuItems(user)

      expect(menuItems.map((m) => m.label)).toEqual(['Tebligat'])
      expect(menuItems.map((m) => m.href)).toEqual(['/portal/tebligat'])
      expect(adminItems).toHaveLength(0)
    })

    it('Sadece İthalat paketi olan kullanıcı SADECE İthalat menüsünü görür', () => {
      const user = { role: 'user', packages: ['ithalat'] }
      const { menuItems, adminItems } = getVisibleMenuItems(user)

      expect(menuItems.map((m) => m.label)).toEqual(['İthalat'])
      expect(menuItems.map((m) => m.href)).toEqual(['/portal/ithalat'])
      expect(adminItems).toHaveLength(0)
    })

    it('Sadece Belge Okuma paketi olan kullanıcı SADECE Belge Okuma menülerini görür', () => {
      const user = { role: 'user', packages: ['belge_okuma'] }
      const { menuItems, adminItems } = getVisibleMenuItems(user)

      expect(menuItems.map((m) => m.label)).toEqual(['Belge Okuma', 'Arşiv'])
      expect(menuItems.map((m) => m.href)).toEqual([
        '/portal/belge-okuma/yukle',
        '/portal/belge-okuma/arsiv',
      ])
      expect(adminItems).toHaveLength(0)
    })

    it('Hepsini alan kullanıcı TÜM modül menülerini görür, admin menülerini görmez', () => {
      const user = {
        role: 'user',
        packages: ['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis'],
      }
      const { menuItems, adminItems } = getVisibleMenuItems(user)

      expect(menuItems.map((m) => m.label)).toEqual([
        'Tebligat',
        'Belge Okuma',
        'Arşiv',
        'İthalat',
        'Akıllı Ofis',
      ])
      expect(adminItems).toHaveLength(0)
    })

    it('Admin kullanıcısı TÜM modül menülerini VE Admin yönetim menülerini görür', () => {
      const admin = { role: 'admin', packages: [] }
      const { menuItems, adminItems } = getVisibleMenuItems(admin)

      expect(menuItems.map((m) => m.label)).toEqual([
        'Tebligat',
        'Belge Okuma',
        'Arşiv',
        'İthalat',
        'Akıllı Ofis',
      ])
      expect(adminItems.map((m) => m.label)).toEqual([
        'Kullanıcı & Paket Yönetimi',
        'Admin Paneli',
      ])
    })
  })

  describe('Portal Yönlendirme ve Rota Çözümleri', () => {
    it('tek paketi olan kullanıcıyı ilgili pakete yönlendirir', () => {
      expect(getUserDefaultPortalRoute({ role: 'user', packages: ['tebligat'] })).toBe(
        '/portal/tebligat',
      )
      expect(getUserDefaultPortalRoute({ role: 'user', packages: ['ithalat'] })).toBe(
        '/portal/ithalat',
      )
      expect(getUserDefaultPortalRoute({ role: 'user', packages: ['belge_okuma'] })).toBe(
        '/portal/belge-okuma/yukle',
      )
      expect(getUserDefaultPortalRoute({ role: 'user', packages: ['akilli_ofis'] })).toBe(
        '/portal/akilli-ofis',
      )
    })

    it('çoklu veya tam paketi olan kullanıcıyı /portal genel paneline yönlendirir', () => {
      expect(
        getUserDefaultPortalRoute({
          role: 'user',
          packages: ['tebligat', 'ithalat'],
        }),
      ).toBe('/portal')

      expect(
        getUserDefaultPortalRoute({
          role: 'user',
          packages: ['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis'],
        }),
      ).toBe('/portal')

      expect(
        getUserDefaultPortalRoute({
          role: 'user',
          packages: ['tam'],
        }),
      ).toBe('/portal')
    })

    it('admin kullanıcısını /portal genel paneline yönlendirir', () => {
      expect(getUserDefaultPortalRoute({ role: 'admin', packages: [] })).toBe('/portal')
    })

    it('paketi olmayan kullanıcıyı /portal genel paneline yönlendirir', () => {
      expect(getUserDefaultPortalRoute({ role: 'user', packages: [] })).toBe('/portal')
    })

    it('getPackageHomeRoute doğru kök yollarını döner', () => {
      expect(getPackageHomeRoute('tebligat')).toBe('/portal/tebligat')
      expect(getPackageHomeRoute('ithalat')).toBe('/portal/ithalat')
      expect(getPackageHomeRoute('belge_okuma')).toBe('/portal/belge-okuma/yukle')
      expect(getPackageHomeRoute('akilli_ofis')).toBe('/portal/akilli-ofis')
      expect(getPackageHomeRoute('unknown')).toBe('/portal')
    })
  })
})
