import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Bell,
  Upload,
  Calculator,
  Building2,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

import {
  getPackageHomeRoute,
  hasPackageAccess,
  isAllPackages,
} from '@/lib/packages-config'
import { requireUserSession } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Promise<{ unauthorized?: string; error?: string }>
}

export default async function PortalDashboardPage({ searchParams }: Props) {
  const resolvedParams = searchParams ? await searchParams : {}
  const session = await requireUserSession('/login')
  const isAdmin = session.role === 'admin'
  const packages = session.packages || []
  const hasAny = packages.length > 0 || isAdmin || isAllPackages(packages)

  // Sadece tek bir paketi olan kullanıcıyı (herhangi bir kısıtlama uyarısı yoksa)
  // doğrudan kendi paket modülüne yönlendir (Tebligat -> /portal/tebligat, vb.)
  if (
    !isAdmin &&
    !isAllPackages(packages) &&
    packages.length === 1 &&
    !resolvedParams.unauthorized &&
    !resolvedParams.error
  ) {
    const singleRoute = getPackageHomeRoute(packages[0])
    if (singleRoute !== '/portal') {
      redirect(singleRoute)
    }
  }

  // Paketi olmayan kullanıcı boş ekran ve Paket Satın Al butonu görsün.
  if (!hasAny) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-6">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
          Aktif Paketiniz Bulunmuyor
        </h1>
        <p className="mt-2 max-w-md text-sm text-[var(--ds-color-text-muted)]">
          Hesabınıza tanımlanmış herhangi bir aktif modül paketi bulunmamaktadır. Hizmetlerimizden faydalanmak için hemen paket satın alabilirsiniz.
        </p>
        <div className="mt-8">
          <Link
            href="/fiyatlandirma"
            className="inline-flex items-center gap-2 rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[var(--ds-color-primary-deep)] ds-transition-hover"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Paket Satın Al</span>
          </Link>
        </div>
      </div>
    )
  }

  const packageCards = [
    {
      code: 'tebligat',
      name: 'Tebligat',
      desc: 'GİB E-Tebligat otomatik sorgulama, tebligat takibi ve anlık bildirim sistemi.',
      icon: Bell,
      href: '/portal/tebligat',
      badge: 'GİB Otomasyon',
      color: 'border-blue-200 bg-blue-50/40 text-blue-900',
    },
    {
      code: 'belge_okuma',
      name: 'Belge Okuma & Arşiv',
      desc: 'Yapay zeka ile evrak, fatura ve fiş okuma; bulut arşiv yönetimi.',
      icon: Upload,
      href: '/portal/belge-okuma/yukle',
      badge: 'AI Optik Okuma',
      color: 'border-purple-200 bg-purple-50/40 text-purple-900',
    },
    {
      code: 'ithalat',
      name: 'İthalat ve Maliyet Robotu',
      desc: 'Gümrük beyannameleri, gümrük vergileri ve ithalat maliyet hesaplama robotu.',
      icon: Calculator,
      href: '/portal/ithalat',
      badge: 'Robot',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    },
    {
      code: 'akilli_ofis',
      name: 'Akıllı Ofis',
      desc: 'Ofis iş akışları, otomatik görev dağılımı ve operasyonel otomasyon modülü.',
      icon: Building2,
      href: '/portal/akilli-ofis',
      badge: 'Ofis Çözümleri',
      color: 'border-amber-200 bg-amber-50/40 text-amber-900',
    },
  ].filter((p) => hasPackageAccess(session, p.code))

  return (
    <div className="space-y-8">
      <div className="border-b border-[var(--ds-color-border)] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
          Hoş Geldiniz, {session.fullName}
        </h1>
        <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
          Aktif paketlerinize ve yetkili olduğunuz modüllere aşağıdaki menülerden erişebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packageCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.code}
              className={`rounded-[var(--ds-radius-lg)] border p-6 transition-all hover:shadow-md flex flex-col justify-between ${card.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--ds-radius-md)] bg-white shadow-xs">
                    <Icon className="h-6 w-6 text-[var(--ds-color-primary)]" />
                  </div>
                  <span className="rounded-full bg-white/80 border border-current px-2.5 py-0.5 text-xs font-semibold">
                    {card.badge}
                  </span>
                </div>
                <h2 className="text-lg font-bold">{card.name}</h2>
                <p className="mt-2 text-sm text-[var(--ds-color-text-muted)] leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ds-color-primary)] hover:underline"
                >
                  <span>Modüle Git</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
