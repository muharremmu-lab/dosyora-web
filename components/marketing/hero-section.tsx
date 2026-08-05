import { Badge, ButtonLink, SectionContainer } from '@/components/ui'

import { DashboardMockup } from './dashboard-mockup'

export function HeroSection() {
  return (
    <SectionContainer className="pb-[var(--ds-space-16)] pt-[var(--ds-space-12)] sm:pb-[var(--ds-space-24)] sm:pt-[var(--ds-space-16)]">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="ds-animate-slide-up max-w-xl">
          <Badge variant="primary" className="mb-5 px-3 py-1 text-xs">
            Yapay Zekâ Destekli
          </Badge>

          <h1 className="text-[2rem] font-bold leading-[1.12] tracking-tight text-[var(--ds-color-text)] sm:text-[2.5rem] lg:text-[2.75rem]">
            Muhasebe belgelerinizi yapay zekâ ile okuyun, arşivleyin ve muhasebe programınıza
            aktarın.
          </h1>

          <div className="mt-5 max-w-lg space-y-3 text-base leading-relaxed text-[var(--ds-color-text-muted)] sm:text-lg">
            <p>
              DOSYORA; fatura, fiş, serbest meslek makbuzu, ekstre, gider pusulası ve diğer ticari
              belgeleri otomatik okur.
            </p>
            <p>Belgeleri güvenli şekilde arşivler.</p>
            <p>Muhasebe programlarına uygun Excel aktarım şablonları üretir.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/demo" variant="primary" className="px-5 py-2.5">
              Demo Talep Et
            </ButtonLink>
            <ButtonLink href="/urun" variant="outline" className="px-5 py-2.5">
              Ürünü İncele
            </ButtonLink>
          </div>
        </div>

        <div className="ds-animate-fade lg:justify-self-end" style={{ animationDelay: '120ms' }}>
          <DashboardMockup className="w-full max-w-xl lg:max-w-none" />
        </div>
      </div>
    </SectionContainer>
  )
}
