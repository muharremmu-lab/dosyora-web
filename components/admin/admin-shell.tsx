import type { ReactNode } from 'react'

import { AdminNav } from './admin-nav'
import { LogoutButton } from './logout-button'

type AdminShellProps = {
  title: string
  description?: string
  children: ReactNode
}

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--ds-color-surface-alt)]">
      <header className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]">
        <div className="mx-auto flex max-w-[var(--ds-container-max)] flex-col gap-4 px-[var(--ds-container-padding)] py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ds-color-text-muted)]">
              DOSYORA Admin
            </p>
            <h1 className="mt-1 text-xl font-bold text-[var(--ds-color-text)]">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <AdminNav />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[var(--ds-container-max)] px-[var(--ds-container-padding)] py-8">
        {children}
      </main>
    </div>
  )
}
