import { DemoForm, SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'DOSYORA Ön İzleme Programı',
  description:
    'DOSYORA ön izleme programına başvurun. Onaylanan firmalara 100 belge okuma hakkı tanımlanır.',
  path: '/demo',
})

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
                DOSYORA Ön İzleme Programı
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
                İlk kullanıcılarımız arasına katılın.
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--ds-color-text-muted)]">
                Onaylanan firmalara <strong className="font-semibold text-[var(--ds-color-text)]">100 belge okuma hakkı</strong> tanımlanacaktır.
              </p>
            </div>

            <DemoForm />
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
