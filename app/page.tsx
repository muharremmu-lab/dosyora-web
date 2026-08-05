import {
  AccountingProgramsSection,
  AudienceSection,
  DocumentTypesSection,
  FaqSection,
  FinalCtaSection,
  HeroSection,
  PreviewCtaBand,
  RoadmapSection,
  SiteFooter,
  SiteHeader,
  TrustSection,
  WhyDosyoraSection,
} from '@/components/marketing'
import { createPageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/lib/site'

export const metadata = createPageMetadata({
  title: siteConfig.seoTitle,
  description: siteConfig.description,
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <PreviewCtaBand />
        <RoadmapSection />
        <AudienceSection />
        <DocumentTypesSection />
        <WhyDosyoraSection />
        <AccountingProgramsSection />
        <FaqSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
