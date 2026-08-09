import {
  AnimatedCtaBand,
  AudienceSection,
  FaqSection,
  HeroSection,
  HomeFeaturesSection,
  HomeV123Section,
  HowItWorksSection,
  SiteFooter,
  SiteHeader,
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
        <HowItWorksSection />
        <HomeFeaturesSection />
        <HomeV123Section />
        <WhyDosyoraSection />
        <AudienceSection />
        <FaqSection />
        <AnimatedCtaBand />
      </main>
      <SiteFooter />
    </>
  )
}
