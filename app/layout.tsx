import type { Metadata } from 'next'

import './globals.css'
import { inter } from '@/lib/design-system/fonts'
import { rootMetadata } from '@/lib/metadata'

export const metadata: Metadata = rootMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-[var(--ds-color-surface)] font-sans text-[var(--ds-color-text)] antialiased">
        {children}
      </body>
    </html>
  )
}
