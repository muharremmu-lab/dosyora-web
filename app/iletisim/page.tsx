import { ContactForm, SiteFooter, SiteHeader } from '@/components/marketing'
import { SectionContainer } from '@/components/ui'
import { contactInfo } from '@/lib/site'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'İletişim',
  description: 'DOSYORA ile iletişime geçin. Telefon, e-posta ve iletişim formu.',
  path: '/iletisim',
})

export default function IletisimPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
          <div className="mb-10 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-4xl">
              İletişim
            </h1>
            <p className="mt-4 text-base text-[var(--ds-color-text-muted)]">
              Sorularınız için bize ulaşın.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div
                className="flex aspect-[16/10] items-center justify-center rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]"
                aria-label="Harita placeholder"
              >
                <p className="text-sm text-[var(--ds-color-text-muted)]">Harita placeholder</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ds-color-text-muted)]">
                    Telefon
                  </p>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                    className="mt-2 block text-sm font-medium text-[var(--ds-color-text)] hover:text-[var(--ds-color-primary)]"
                  >
                    {contactInfo.phone}
                  </a>
                </div>

                <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ds-color-text-muted)]">
                    E-posta
                  </p>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="mt-2 block text-sm font-medium text-[var(--ds-color-text)] hover:text-[var(--ds-color-primary)]"
                  >
                    {contactInfo.email}
                  </a>
                </div>

                <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ds-color-text-muted)]">
                    Adres
                  </p>
                  <p className="mt-2 text-sm text-[var(--ds-color-text)]">{contactInfo.address}</p>
                </div>

                <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ds-color-text-muted)]">
                    Çalışma Saatleri
                  </p>
                  <p className="mt-2 text-sm text-[var(--ds-color-text)]">{contactInfo.hours}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-[var(--ds-color-text)]">İletişim Formu</h2>
              <ContactForm />
            </div>
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  )
}
