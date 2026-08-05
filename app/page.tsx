import { HeroSection, SiteFooter, SiteHeader, TrustSection } from '@/components/marketing'
import { createPageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/lib/site'

export const metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustSection />
      </main>
      <SiteFooter />
    </>
  )
}
