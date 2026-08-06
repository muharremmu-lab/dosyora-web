'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/design-system/cn'

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/demo-leads', label: 'Demo Talepleri' },
  { href: '/admin/contact-messages', label: 'İletişim Mesajları' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin navigasyonu" className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-[var(--ds-radius-md)] px-3 py-2 text-sm font-medium ds-transition-hover',
              active
                ? 'bg-[var(--ds-color-primary)] text-[var(--ds-color-secondary)]'
                : 'text-[var(--ds-color-text-muted)] hover:bg-[var(--ds-color-surface-alt)] hover:text-[var(--ds-color-text)]',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
