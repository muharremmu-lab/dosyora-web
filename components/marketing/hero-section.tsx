import { Badge, ButtonLink, SectionContainer } from '@/components/ui'
import { documentTypeChips, homepageDemoLimitLabel } from '@/lib/homepage-content'

import { HeroAiDemo } from './hero-ai-demo'

export function HeroSection() {
  return (
    <SectionContainer
      className="pb-[var(--ds-space-12)] pt-[var(--ds-space-12)] sm:pb-[var(--ds-space-16)] sm:pt-[var(--ds-space-16)]"
      aria-labelledby="hero-heading"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-color-text-muted)]">
            Belge Okuma &amp; Muhasebe Çözümleri
          </p>

          <h1
            id="hero-heading"
            className="text-[2rem] font-bold leading-[1.08] tracking-tight text-[var(--ds-color-text)] sm:text-[2.65rem] lg:text-[3rem]"
          >
            BELGELERİNİZİ YÜKLEYİN.
            <br />
            <span className="text-[var(--ds-color-highlight)]">VERİNİZ HAZIR OLSUN.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--ds-color-text-muted)] sm:text-lg">
            Fiş, fatura, poliçe, uçak bileti, noter belgesi ve diğer masraf belgelerinizi tek tek
            okumakla uğraşmayın. DOSYORA belgelerinizi yapay zekâ ile okur, kontrol etmenizi sağlar
            ve kullanılabilir veriye dönüştürür.
          </p>

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Desteklenen belge türleri">
            {documentTypeChips.map((chip) => (
              <Badge key={chip} variant="primary" className="px-3 py-1 text-xs font-medium">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/demo" variant="primary" className="px-6 py-3 text-base font-semibold">
              {homepageDemoLimitLabel} Ücretsiz Deneyin
            </ButtonLink>
            <ButtonLink href="/#nasil-calisir" variant="outline" className="px-6 py-3 text-base">
              Nasıl Çalışır?
            </ButtonLink>
          </div>
        </div>

        <div className="relative lg:justify-self-end">
          <HeroAiDemo className="w-full max-w-xl lg:max-w-none" />
        </div>
      </div>
    </SectionContainer>
  )
}
