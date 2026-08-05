import { siteConfig } from '@/lib/site'
import type { BlogPost } from '@/lib/blog-posts'

function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${normalizedPath === '/' ? '' : normalizedPath}`
}

export function createBlogListingSchema(posts: BlogPost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} Blog`,
    description: 'DOSYORA blog yazıları: belge okuma, dijital arşiv ve muhasebe otomasyonu.',
    url: absoluteUrl('/blog'),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
    })),
  }
}

export function createBlogPostSchema(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
  }
}
