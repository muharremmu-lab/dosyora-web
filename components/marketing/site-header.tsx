'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/design-system/cn'
import { getCustomerLoginUrl, isExternalCustomerLogin } from '@/lib/customer-portal'
import { mainNavItems, siteConfig } from '@/lib/site'

const customerLoginUrl = getCustomerLoginUrl()
const customerLoginExternal = isExternalCustomerLogin(customerLoginUrl)

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-transparent ds-transition-hover',
        scrolled &&
          'border-[var(--ds-color-border)] bg-[color:color-mix(in_srgb,var(--ds-color-surface)_82%,transparent)] shadow-[var(--ds-shadow-sm)] backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[var(--ds-container-max)] items-center justify-between px-[var(--ds-container-padding)]">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-[var(--ds-color-primary)] ds-transition-hover hover:opacity-80"
          onClick={() => setMobileOpen(false)}
        >
          {siteConfig.name.toUpperCase()}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="rounded-[var(--ds-radius-md)] px-3 py-2 text-sm font-medium text-[var(--ds-color-text-muted)] ds-transition-hover hover:bg-[var(--ds-color-surface-alt)] hover:text-[var(--ds-color-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink
            href={customerLoginUrl}
            variant="outline"
            {...(customerLoginExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            Müşteri Girişi
          </ButtonLink>
          <ButtonLink href="/demo" variant="primary">
            Demo Talep Et
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-[var(--ds-radius-md)] p-2 text-[var(--ds-color-text)] lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-[var(--ds-container-padding)] py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobil menü">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="rounded-[var(--ds-radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--ds-color-text)] ds-transition-hover hover:bg-[var(--ds-color-surface-alt)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink
              href={customerLoginUrl}
              variant="outline"
              className="mt-3 w-full"
              {...(customerLoginExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              Müşteri Girişi
            </ButtonLink>
            <ButtonLink href="/demo" variant="primary" className="mt-3 w-full">
              Demo Talep Et
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
