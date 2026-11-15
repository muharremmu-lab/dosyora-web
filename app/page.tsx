import { FeedbackSection, ProductFamilySection, SiteFooter, SiteHeader } from '@/components/marketing'
import { createPageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/lib/site'

export const metadata = createPageMetadata({
  title: siteConfig.seoTitle,
  description: 'GibTebligat Pro, belge okuma ve akıllı ofis. Öneri ve bildirimlerinizi doğrudan iletin.',
  path: '/',
})

type HomePageProps = {
  searchParams: Promise<{ bildirim?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams

  return (
    <>
      <SiteHeader />
      <main>
        <ProductFamilySection />
        <FeedbackSection sent={params.bildirim === '1'} />
      </main>
      <SiteFooter />
    </>
  )
}
