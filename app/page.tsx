import {
  AccountingProgramsSection,
  AnimatedCtaBand,
  AudienceSection,
  ComingSoonSection,
  DocumentFlowSection,
  DocumentTypesSection,
  FaqSection,
  HeroSection,
  HeroTrustBadges,
  HowItWorksSection,
  ModulesSection,
  PreviewCtaBand,
  ProductScreensSection,
  RoadmapSection,
  SiteFooter,
  SiteHeader,
  StatsSection,
  TestimonialsSection,
  TrustLogosSection,
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
        <HeroTrustBadges />
        <PreviewCtaBand />
        <ProductScreensSection />
        <DocumentFlowSection />
        <HowItWorksSection />
        <ModulesSection />
        <ComingSoonSection />
        <RoadmapSection />
        <AudienceSection />
        <DocumentTypesSection />
        <WhyDosyoraSection />
        <AccountingProgramsSection />
        <StatsSection />
        <TestimonialsSection />
        <TrustLogosSection />
        <FaqSection />
        <TrustSection />
        <AnimatedCtaBand />
      </main>
      <SiteFooter />
    </>
  )
}
