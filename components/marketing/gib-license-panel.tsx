import { Download } from 'lucide-react'

import { buttonClassName } from '@/components/ui'
import { gibTebligatPlans } from '@/lib/gibtebligat-plans'

import { DownloadAnchor } from './download-anchor'

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
              className="flex items-baseline justify-between gap-3 rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--ds-color-text)]">{plan.name}</p>
                <p className="mt-0.5 text-xs text-[var(--ds-color-text-muted)]">{plan.capacity}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[var(--ds-color-text)]">{plan.price}</p>
                <p className="text-[11px] text-[var(--ds-color-text-muted)]">{plan.cadence}</p>
              </div>
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
