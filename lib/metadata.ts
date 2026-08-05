import type { Metadata } from 'next'

import { analyticsConfig } from '@/lib/analytics'
import { siteConfig } from '@/lib/site'

type PageMetadataOptions = {
  title: string
  description?: string
  path: string
}

type BlogPostMetadataOptions = {
  title: string
  description: string
  slug: string
  publishedAt: string
}

function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${normalizedPath === '/' ? '' : normalizedPath}`
}

function buildPageTitle(title: string): string {
  return title === siteConfig.title || title === siteConfig.seoTitle || title.includes('|')
    ? title
    : `${title} | ${siteConfig.title}`
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
}: PageMetadataOptions): Metadata {
  const pageTitle = buildPageTitle(title)
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

export function createBlogPostMetadata({
  title,
  description,
  slug,
  publishedAt,
}: BlogPostMetadataOptions): Metadata {
  const pageTitle = buildPageTitle(title)
  const canonical = absoluteUrl(`/blog/${slug}`)

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      publishedTime: publishedAt,
      authors: [siteConfig.name],
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: title,
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

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.seoTitle,
    description: siteConfig.description,
    path: '/',
  }),
  icons: {
    icon: [{ url: '/icon', type: 'image/png', sizes: '32x32' }, { url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  ...(analyticsConfig.googleSiteVerification
    ? {
        verification: {
          google: analyticsConfig.googleSiteVerification,
        },
      }
    : {}),
}
