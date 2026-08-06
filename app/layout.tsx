import { JsonLd } from '@/components/blog/json-ld'
import { GoogleAnalytics } from '@/components/analytics'
import { analyticsConfig, isGoogleAnalyticsEnabled } from '@/lib/analytics'
import { inter } from '@/lib/design-system/fonts'
import { rootMetadata } from '@/lib/metadata'
import { createSiteSchemaGraph } from '@/lib/site-schema'
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = rootMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-[var(--ds-color-surface)] font-sans text-[var(--ds-color-text)] antialiased">
        <JsonLd data={createSiteSchemaGraph()} />
        {isGoogleAnalyticsEnabled() && analyticsConfig.gaMeasurementId ? (
          <GoogleAnalytics measurementId={analyticsConfig.gaMeasurementId} />
        ) : null}
        {children}
      </body>
    </html>
  )
}
