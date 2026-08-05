import type { Metadata } from 'next'

import { siteConfig } from '@/lib/site'

type PageMetadataOptions = {
  title: string
  description?: string
  path: string
}

function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${normalizedPath === '/' ? '' : normalizedPath}`
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
}: PageMetadataOptions): Metadata {
  const pageTitle = title === siteConfig.title ? title : `${title} | ${siteConfig.title}`
  const canonical = absoluteUrl(path)

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export const rootMetadata: Metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
})
