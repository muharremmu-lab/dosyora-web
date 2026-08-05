import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { JsonLd } from '@/components/blog'
import { SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createBlogPostSchema } from '@/lib/blog-schema'
import { getAllBlogSlugs, getBlogPost } from '@/lib/blog-posts'
import { createBlogPostMetadata } from '@/lib/metadata'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return {}
  }

  return createBlogPostMetadata({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const schema = createBlogPostSchema(post)

  return (
    <>
      <JsonLd data={schema} />
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <article className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--ds-color-primary)] ds-transition-hover hover:opacity-80"
            >
              ← Blog
            </Link>

            <header className="mt-6 border-b border-[var(--ds-color-border)] pb-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--ds-color-text-muted)]">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime} okuma</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
                {post.excerpt}
              </p>
            </header>

            <div className="prose-dosyora mt-8 space-y-4">
              {post.content.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-[var(--ds-color-text-muted)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
