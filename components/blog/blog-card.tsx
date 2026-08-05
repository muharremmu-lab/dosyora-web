import Link from 'next/link'

import { Card } from '@/components/ui'
import type { BlogPost } from '@/lib/blog-posts'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card interactive className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--ds-color-text-muted)]">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime} okuma</span>
      </div>

      <h2 className="text-base font-semibold text-[var(--ds-color-text)]">
        <Link
          href={`/blog/${post.slug}`}
          className="ds-transition-hover hover:text-[var(--ds-color-primary)]"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
        {post.excerpt}
      </p>

      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 text-sm font-medium text-[var(--ds-color-primary)] ds-transition-hover hover:opacity-80"
      >
        Devamını oku →
      </Link>
    </Card>
  )
}
