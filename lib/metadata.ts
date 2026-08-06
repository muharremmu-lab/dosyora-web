import type { Metadata } from 'next'

import { analyticsConfig } from '@/lib/analytics'
import { ogImagePath, siteConfig } from '@/lib/site'

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

const sharedMetadataFields = {
  applicationName: siteConfig.applicationName,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: siteConfig.category,
  keywords: [...siteConfig.keywords],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
}

const defaultOpenGraphImages = [
  {
    url: ogImagePath,
    width: 1200,
    height: 630,
    alt: siteConfig.seoTitle,
    type: 'image/jpeg',
  },
]

function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${normalizedPath === '/' ? '' : normalizedPath}`
}

function buildPageTitle(title: string): string {
  return title === siteConfig.title || title === siteConfig.seoTitle || title.includes('|')
    ? title
    : `${title} | ${siteConfig.title}`
}

function buildSharedMetadata(title: string, description: string, canonical: string): Metadata {
  return {
    ...sharedMetadataFields,
    title,
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
      title,
      description,
      images: defaultOpenGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImagePath],
    },
  }
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
}: PageMetadataOptions): Metadata {
  const pageTitle = buildPageTitle(title)
  const canonical = absoluteUrl(path)

  return buildSharedMetadata(pageTitle, description, canonical)
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
    ...buildSharedMetadata(pageTitle, description, canonical),
    openGraph: {
      type: 'article',
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      publishedTime: publishedAt,
      authors: [siteConfig.name],
      images: defaultOpenGraphImages,
    },
  }
}

export const rootMetadata: Metadata = {
  ...buildSharedMetadata(siteConfig.seoTitle, siteConfig.description, absoluteUrl('/')),
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
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
