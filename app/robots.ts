import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).host

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    host,
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
