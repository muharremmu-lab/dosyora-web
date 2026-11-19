import { Archive, Download, ScanSearch, Timer, Users } from 'lucide-react'

import { Badge, buttonClassName, Icon, SectionContainer } from '@/components/ui'

import { DownloadAnchor } from './download-anchor'
import type { LucideIcon } from '@/components/ui/icon'
import { homepageScrollMt, homepageSectionY } from '@/lib/homepage-content'

export const desktopDownloadHref = '/downloads/gibtebligat/GibTebligatPro.exe'

const features: { title: string; icon: LucideIcon }[] = [
  { title: 'Otomatik GİB e-Tebligat tarama', icon: ScanSearch },
  { title: 'PDF ve ek arşivleme', icon: Archive },
  { title: 'Çoklu mükellef desteği', icon: Users },
  { title: '14 gün ücretsiz deneme', icon: Timer },
]

type DesktopDownloadSectionProps = {
  headingLevel?: 'h1' | 'h2'
}

export function DesktopDownloadSection({ headingLevel = 'h2' }: DesktopDownloadSectionProps) {
  const Heading = headingLevel

  return (
    <SectionContainer
      id="gibtebligat-indir"
      className={`border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] ${homepageSectionY} ${homepageScrollMt}`}
      aria-labelledby="gibtebligat-download-heading"
    >
      <article className="overflow-hidden rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-md)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Windows masaüstü</Badge>
              <Badge variant="success">v1.1.3</Badge>
            </div>
            <Heading
              id="gibtebligat-download-heading"
              className="mt-4 text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl"
            >
              GibTebligat Pro — Windows Masaüstü Uygulaması (v1.1.3)
            </Heading>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ds-color-text-muted)] sm:text-base">
              GİB e-Tebligatlarını bilgisayarınızdan tarayın, PDF ve ekleri arşivleyin. Kurulumdan
              sonra yeni sürümler otomatik denetlenir.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="flex items-center gap-3 rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] px-3 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_8%,white)] text-[var(--ds-color-primary)]">
                    <Icon icon={feature.icon} size="sm" />
                  </span>
                  <span className="text-sm font-medium text-[var(--ds-color-text)]">{feature.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] p-5 sm:p-6">
            <p className="text-sm font-semibold text-[var(--ds-color-text)]">Kurulum paketi</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
              Windows 64-bit. Kurulum sihirbazı klasörü sorar; uygulama, tarama verisi ve model dosyalarını kurar.
            </p>
            <DownloadAnchor source="home" className={buttonClassName('primary', 'mt-5 w-full px-5 py-3 text-base')}>
              <Download className="size-4" aria-hidden="true" />
              Windows İçin İndir (64-bit)
            </DownloadAnchor>
            <p className="mt-3 text-center text-xs text-[var(--ds-color-text-muted)]">
              GibTebligatPro-Kurulum.exe
            </p>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
