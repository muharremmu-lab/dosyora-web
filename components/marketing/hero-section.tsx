import { Badge, ButtonLink, SectionContainer } from '@/components/ui'
import { contactFormHref } from '@/lib/contact-routes'
import {
  documentTypeChips,
  homepageDemoLimitLabel,
  homepageSectionY,
} from '@/lib/homepage-content'

import { HeroAiDemo } from './hero-ai-demo'

export function HeroSection() {
  return (
    <SectionContainer
      className={`${homepageSectionY} pt-9 sm:pt-10`}
      aria-labelledby="hero-heading"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="max-w-xl lg:py-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-color-text-muted)]">
            Belge Okuma &amp; Muhasebe Çözümleri
          </p>

          <h1
            id="hero-heading"
            className="text-[2rem] font-bold leading-[1.08] tracking-tight text-[var(--ds-color-text)] sm:text-[2.65rem] lg:text-[2.85rem]"
          >
            BELGELERİNİZİ YÜKLEYİN.
            <br />
            <span className="text-[var(--ds-color-highlight)]">VERİNİZ HAZIR OLSUN.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--ds-color-text-muted)]">
            Belgelerinizi yükleyin; DOSYORA yapay zekâ ile okusun, siz kontrol edin. Muhasebe
            programınıza tek tek manuel veri girmek yerine uygun çıktılarla toplu aktarım yapın.
            Belgelerinizi aynı zamanda düzenli ve güvenli dijital arşivinizde saklayın.
          </p>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Desteklenen belge türleri">
            {documentTypeChips.map((chip) => (
              <Badge key={chip} variant="primary" className="px-3 py-1 text-xs font-medium">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={contactFormHref('demo')} variant="primary" className="px-6 py-3 text-base font-semibold">
              {homepageDemoLimitLabel} Ücretsiz Deneyin
            </ButtonLink>
            <ButtonLink href="/#nasil-calisir" variant="outline" className="px-6 py-3 text-base">
              Nasıl Çalışır?
            </ButtonLink>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <HeroAiDemo className="w-full max-w-md sm:max-w-lg lg:max-w-none lg:scale-[1.12] lg:origin-center" />
        </div>
      </div>
    </SectionContainer>
  )
}
