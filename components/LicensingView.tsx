'use client'

import { Archive, Check, ChevronDown, ScanSearch, ShieldCheck, Workflow } from 'lucide-react'
import { useState } from 'react'

import { gibTebligatPlans } from '@/lib/gibtebligat-plans'

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'

const licenseFeatures = [
  '1 yıllık kesintisiz lisans',
  'Otomatik güncellemeler ve öncelikli destek',
  'Yıllık taahhüt ve sözleşme koşulları geçerlidir',
]

export default function LicensingView() {
  const [gibOpen, setGibOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/license-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Bildirim gönderilemedi.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">Dosyora ürün gamı</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Kurumsal lisans ve ürünler
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Yayındaki masaüstü modülünden yakında gelecek ofis araçlarına kadar tek platform. Ödeme talimatları
            başvuru onayından sonra e-posta ile iletilir.
          </p>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-md">
            <button
              type="button"
              className="flex flex-1 flex-col rounded-2xl p-6 text-left transition duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={gibOpen}
              aria-controls="gib-module-offers"
              onClick={() => setGibOpen((open) => !open)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-600/15">
                  YAYINDA
                </span>
                <ChevronDown
                  className={`size-4 text-slate-400 transition duration-200 ${gibOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">GİB e-Tebligat</h2>
              <p className="mt-1 text-sm font-medium text-indigo-800">GibTebligat Pro</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                GİB bildirimleri otomatik taranır, PDF ve ekler bilgisayara indirilir. Oturum bilgileri Windows DPAPI
                ile yalnızca o cihazda korunur.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <ScanSearch className="mt-0.5 size-4 shrink-0 text-indigo-700" aria-hidden="true" />
                  Otomatik GİB bildirimi tarama
                </li>
                <li className="flex items-start gap-2">
                  <Archive className="mt-0.5 size-4 shrink-0 text-indigo-700" aria-hidden="true" />
                  PDF indirme ve yerel arşiv
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-indigo-700" aria-hidden="true" />
                  DPAPI güvenlik altyapısı
                </li>
              </ul>
              <span className="mt-5 text-sm font-semibold text-indigo-700">
                {gibOpen ? 'Tarifeleri gizle' : 'Tarifeleri ve deneme bağlantılarını aç'}
              </span>
            </button>
            {gibOpen ? (
              <div id="gib-module-offers" className="border-t border-slate-100 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modül tarifeleri</p>
                <ul className="mt-3 space-y-3">
                  {gibTebligatPlans.map((plan) => (
                    <li key={plan.name} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-800">{plan.name}</span>
                      <span className="shrink-0 text-slate-600">
                        <span className="font-semibold text-slate-950">{plan.price}</span> {plan.cadence}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>

          <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-orange-800 ring-1 ring-orange-200">
              YAKINDA
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
              Belge Okuma / Arşiv / Muhasebeleştirme
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Yapay zekâ destekli OCR, belge görüntülerinden dakikalar içinde yüzlerce belgeyi okur. Çıkan veriler
              Luca, Zirve ve standart muhasebe programı şablonlarına aktarılır.
            </p>
          </article>

          <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-orange-800 ring-1 ring-orange-200">
              YAKINDA
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">Akıllı Ofis</h2>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-600">
              <Workflow className="mt-0.5 size-4 shrink-0 text-indigo-700" aria-hidden="true" />
              Süreç otomasyonu ve tek ekrandan yönetim. Evrak, görev ve iş akışları aynı çalışma alanında toplanır.
            </p>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-md">
          <h2 className="text-sm font-semibold text-amber-900">Veri gizliliği ve yerel depolama güvencesi</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Dosyora altyapısında işlenen tüm PDF dosyaları ve hassas belgeler harici sunucularda saklanmaz; tamamen
            kullanıcıların kendi yerel bilgisayarlarında güvenli bir şekilde depolanır.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-md">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-indigo-800 ring-1 ring-indigo-100">
                Öne çıkan lisans
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Dosyora Pro Sınırsız</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Sınırsız belge okuma, OCR, akıllı arşivleme ve muhasebe aktarımı. 1 yıllık kesintisiz lisans, yıllık
                faturalandırılır.
              </p>
              <ul className="mt-5 space-y-2">
                {licenseFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-indigo-700" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-950 px-5 py-6 text-white">
              <p className="text-sm text-indigo-200">Yıllık faturalandırma</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                499 TL <span className="text-base font-normal text-slate-300">/ ay</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">1 yıllık kesintisiz lisans</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-md sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Fatura ve iletişim bildirim formu</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Banka bilgileri bu sayfada yer almaz. Formu gönderdiğinizde kaydınız alınır; ödeme ve havale talimatları
            onaydan sonra e-posta adresinize iletilir.
          </p>
          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <h3 className="text-lg font-semibold">Bildiriminiz alındı</h3>
              <p className="mt-2 text-sm leading-relaxed">
                Ödeme ve havale talimatları ile banka bilgileri, başvurunuz onaylandıktan sonra e-posta adresinize
                iletilecektir. Onayın ardından faturanız kesilir ve lisansınız etkinleştirilir.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="license-full-name" className="mb-1.5 block text-xs font-medium text-slate-700">
                    Ad Soyad / Şirket Unvanı
                  </label>
                  <input
                    id="license-full-name"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                    className={inputClassName}
                    placeholder="Örn: Mutlu Teknoloji A.Ş."
                  />
                </div>
                <div>
                  <label htmlFor="license-email" className="mb-1.5 block text-xs font-medium text-slate-700">
                    E-posta Adresi
                  </label>
                  <input
                    id="license-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className={inputClassName}
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="license-tax-number" className="mb-1.5 block text-xs font-medium text-slate-700">
                    TCKN veya Vergi Kimlik Numarası (VKN)
                  </label>
                  <input
                    id="license-tax-number"
                    type="text"
                    required
                    inputMode="numeric"
                    value={formData.taxNumber}
                    onChange={(event) => setFormData({ ...formData, taxNumber: event.target.value })}
                    className={inputClassName}
                    placeholder="10 veya 11 haneli numara"
                  />
                </div>
                <div>
                  <label htmlFor="license-tax-office" className="mb-1.5 block text-xs font-medium text-slate-700">
                    Vergi Dairesi
                  </label>
                  <input
                    id="license-tax-office"
                    type="text"
                    required
                    value={formData.taxOffice}
                    onChange={(event) => setFormData({ ...formData, taxOffice: event.target.value })}
                    className={inputClassName}
                    placeholder="Örn: Davutpaşa V.D."
                  />
                </div>
              </div>
              <div>
                <label htmlFor="license-address" className="mb-1.5 block text-xs font-medium text-slate-700">
                  Fatura Adresi
                </label>
                <textarea
                  id="license-address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                  className={inputClassName}
                  placeholder="Açık adres ve il/ilçe bilgisi"
                />
              </div>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Gönderiliyor...' : 'Fatura bilgilerini gönder'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
