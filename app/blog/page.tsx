import { BlogCard, JsonLd } from '@/components/blog'
import { SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createBlogListingSchema } from '@/lib/blog-schema'
import { blogPosts } from '@/lib/blog-posts'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Blog',
  description:
    'DOSYORA blog: yapay zekâ ile belge okuma, dijital arşiv, OCR ve muhasebe otomasyonu hakkında yazılar.',
  path: '/blog',
})

export default function BlogPage() {
  const schema = createBlogListingSchema(blogPosts)

  return (
    <>
      <JsonLd data={schema} />
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <div className="mb-10 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
              Blog
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
              Belge okuma, dijital arşiv ve muhasebe otomasyonu hakkında güncel yazılar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
