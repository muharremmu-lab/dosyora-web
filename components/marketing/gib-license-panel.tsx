import { Download } from 'lucide-react'

import { buttonClassName } from '@/components/ui'
import { gibTebligatPlans, gibTebligatTerms } from '@/lib/gibtebligat-plans'

import { DownloadAnchor } from './download-anchor'

const priceFormat = new Intl.NumberFormat('tr-TR')

function formatPrice(amount: number): string {
  return `${priceFormat.format(amount)} TL`
}

export function GibLicensePanel() {
  return (
    <details id="gib-license-details" className="mt-6">
      <summary className={`${buttonClassName('primary', 'px-5 py-2.5')} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        Lisans ve indirme
      </summary>
      <div className="mt-4 space-y-3">
        <ul className="space-y-2">
          {gibTebligatPlans.map((plan) => (
            <li
              key={plan.name}
              className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-2.5"
            >
              <p className="text-sm font-semibold text-[var(--ds-color-text)]">{plan.name}</p>
              <p className="mt-0.5 text-xs text-[var(--ds-color-text-muted)]">{plan.capacity}</p>
              <ul className="mt-2 grid grid-cols-3 gap-2">
                {gibTebligatTerms.map((term) => (
                  <li key={term.id} className="rounded-[var(--ds-radius-sm)] bg-white px-2 py-1.5 text-center">
                    <p className="text-[11px] font-medium text-[var(--ds-color-text-muted)]">{term.label}</p>
                    <p className="text-sm font-bold text-[var(--ds-color-text)]">{formatPrice(plan.pricesTl[term.id])}</p>
                    <p className="text-[10px] text-[var(--ds-color-text-muted)]">KDV dahil</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <DownloadAnchor source="home" className={buttonClassName('outline', 'w-full px-5 py-2.5')}>
          <Download className="size-4" aria-hidden="true" />
          GibTebligat Pro kurulumunu indir
        </DownloadAnchor>
      </div>
    </details>
  )
}
