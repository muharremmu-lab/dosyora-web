import Link from 'next/link'

import { SectionContainer } from '@/components/ui'
import { footerNavItems, siteConfig } from '@/lib/site'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]">
      {/* production redeploy trigger */}
      <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-md">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-[var(--ds-color-primary)] ds-transition-hover hover:opacity-80"
            >
              {siteConfig.name.toUpperCase()}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Alt menü">
            <p className="text-sm font-semibold text-[var(--ds-color-text)]">Bağlantılar</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {footerNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-sm text-[var(--ds-color-text-muted)] ds-transition-hover hover:text-[var(--ds-color-text)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-[var(--ds-color-border)] pt-6">
          <p className="text-xs text-[var(--ds-color-text-muted)]">
            © {year} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </SectionContainer>
    </footer>
  )
}
