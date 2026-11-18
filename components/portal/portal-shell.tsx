'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Bell,
  Upload,
  Archive,
  Calculator,
  Building2,
  Users,
  Shield,
  LogOut,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/design-system/cn'
import {
  getUserDefaultPortalRoute,
  hasPackageAccess,
  isAllPackages,
} from '@/lib/packages-config'
import type { UserSession } from '@/lib/user-auth'

type PortalShellProps = {
  user: UserSession
  children: React.ReactNode
}

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const unauthorizedPkg = searchParams.get('unauthorized')
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      window.location.href = '/login'
    }
  }

  const hasTebligat = hasPackageAccess(user, 'tebligat')
  const hasBelgeOkuma = hasPackageAccess(user, 'belge_okuma')
  const hasIthalat = hasPackageAccess(user, 'ithalat')
  const hasAkilliOfis = hasPackageAccess(user, 'akilli_ofis')
  const isAdmin = user.role === 'admin'
  const hasAnyPackage = user.packages.length > 0 || isAdmin || isAllPackages(user.packages)
  const homeHref = getUserDefaultPortalRoute(user)

  // Menü kuralları:
  // Sadece Tebligat paketi -> Sadece Tebligat menüsü
  // Sadece İthalat paketi -> Sadece İthalat menüsü
  // Sadece Belge Okuma paketi -> Sadece Belge Okuma ve Arşiv menüleri
  // Hepsini alan kullanıcı -> Tüm modül menüleri
  // Admin -> Tüm modül menüleri + Kullanıcı & Paket Yönetimi + Sistem Paneli
  const menuItems = [
    {
      show: hasTebligat,
      href: '/portal/tebligat',
      label: 'Tebligat',
      icon: Bell,
      badge: 'GİB',
    },
    {
      show: hasBelgeOkuma,
      href: '/portal/belge-okuma/yukle',
      label: 'Belge Okuma',
      icon: Upload,
      badge: 'AI',
    },
    {
      show: hasBelgeOkuma,
      href: '/portal/belge-okuma/arsiv',
      label: 'Arşiv',
      icon: Archive,
    },
    {
      show: hasIthalat,
      href: '/portal/ithalat',
      label: 'İthalat',
      icon: Calculator,
      badge: 'Robot',
    },
    {
      show: hasAkilliOfis,
      href: '/portal/akilli-ofis',
      label: 'Akıllı Ofis',
      icon: Building2,
    },
  ].filter((item) => item.show)

  const adminItems = [
    {
      show: isAdmin,
      href: '/portal/admin/users',
      label: 'Kullanıcı & Paket Yönetimi',
      icon: Users,
    },
    {
      show: isAdmin,
      href: '/admin',
      label: 'Admin Paneli',
      icon: Shield,
    },
  ].filter((item) => item.show)

  return (
    <div className="min-h-screen bg-[var(--ds-color-surface-alt)] text-[var(--ds-color-text)] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-sm)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href={homeHref} className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] text-white font-black text-sm">
                D
              </span>
              <span>DOSYORA</span>
              <span className="rounded bg-[var(--ds-color-surface-alt)] border border-[var(--ds-color-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ds-color-text-muted)]">
                PORTAL
              </span>
            </Link>

            {/* Desktop Dynamic Navigation Tabs */}
            {hasAnyPackage && (
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((item) => {
                  const active = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-[var(--ds-radius-md)] px-3 py-2 text-sm font-medium ds-transition-hover',
                        active
                          ? 'bg-[var(--ds-color-primary)] text-white shadow-sm'
                          : 'text-[var(--ds-color-text-muted)] hover:bg-[var(--ds-color-surface-alt)] hover:text-[var(--ds-color-text)]',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase',
                            active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700',
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}

                {/* Admin Management Tabs */}
                {adminItems.map((item) => {
                  const active = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-[var(--ds-radius-md)] px-3 py-2 text-sm font-medium ds-transition-hover',
                        active
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-700 hover:bg-amber-50 hover:text-amber-800',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          {/* User info and actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-[var(--ds-color-text)]">
                {user.fullName}
              </span>
              <div className="flex items-center justify-end gap-1.5 text-xs text-[var(--ds-color-text-muted)]">
                {isAdmin ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    YÖNETİCİ
                  </span>
                ) : (
                  <span>{user.email}</span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ds-color-text-muted)] hover:bg-[var(--ds-color-surface-alt)] hover:text-red-600 ds-transition-hover"
              title="Çıkış Yap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnavigation */}
        {hasAnyPackage && (
          <div className="flex md:hidden overflow-x-auto border-t border-[var(--ds-color-border)] px-4 py-2 gap-2 bg-[var(--ds-color-surface-alt)]">
            {menuItems.map((item) => {
              const active = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-[var(--ds-radius-md)] px-3 py-1.5 text-xs font-medium ds-transition-hover',
                    active
                      ? 'bg-[var(--ds-color-primary)] text-white shadow-sm'
                      : 'bg-[var(--ds-color-surface)] text-[var(--ds-color-text-muted)] border border-[var(--ds-color-border)]',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {adminItems.map((item) => {
              const active = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-[var(--ds-radius-md)] px-3 py-1.5 text-xs font-medium ds-transition-hover',
                    active
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 border border-amber-200',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Unauthorized Attempt Warning Alert Banner */}
      {unauthorizedPkg && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-900">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>
                <strong>Erişim Kısıtlandı:</strong> Bu menüye erişmek için{' '}
                <span className="font-semibold underline uppercase">{unauthorizedPkg}</span>{' '}
                paketinizin aktif olması gerekmektedir.
              </span>
            </div>
            <Link
              href="/fiyatlandirma"
              className="inline-flex items-center gap-1 rounded bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700"
            >
              <ShoppingBag className="h-3 w-3" />
              Paket Satın Al
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
