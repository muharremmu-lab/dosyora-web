import type { MetadataRoute } from 'next'

import { blogPosts } from '@/lib/blog-posts'
import { siteConfig, siteRoutes } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes = siteRoutes.map(({ path }) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.7,
  }))

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}
