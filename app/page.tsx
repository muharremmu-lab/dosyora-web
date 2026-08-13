import {
  AnimatedCtaBand,
  AudienceSection,
  ContactSection,
  FaqSection,
  HeroSection,
  HomeFeaturesSection,
  HomeV123Section,
  HowItWorksSection,
  SiteFooter,
  SiteHeader,
  WhyDosyoraSection,
} from '@/components/marketing'
import { parseContactFormType } from '@/lib/contact-routes'
import { createPageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/lib/site'

export const metadata = createPageMetadata({
  title: siteConfig.seoTitle,
  description: siteConfig.description,
  path: '/',
})

type HomePageProps = {
  searchParams: Promise<{ type?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const defaultType = parseContactFormType(params.type)

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
        <ContactSection defaultType={defaultType} />
      </main>
      <SiteFooter />
    </>
  )
}
