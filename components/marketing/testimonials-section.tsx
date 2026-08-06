import { Star } from 'lucide-react'

import { Card, Icon, SectionContainer } from '@/components/ui'

import { ScrollReveal } from './scroll-reveal'

const testimonials = [
  {
    role: 'Muhasebeci',
    quote:
      'Günlük fatura yükümüz ciddi şekilde azaldı. Okunan verileri Excel şablonuna aktarmak artık dakikalar sürüyor.',
    name: 'Ayşe K.',
    company: 'Atlas Muhasebe',
    rating: 5,
  },
  {
    role: 'Mali müşavir',
    quote:
      'Birden fazla müşteri belgesini tek panelden yönetmek, ofisimizin en büyük operasyonel kazancı oldu.',
    name: 'Mehmet T.',
    company: 'Tuna Mali Müşavirlik',
    rating: 5,
  },
  {
    role: 'Şirket sahibi',
    quote:
      'Belge karmaşasından kurtulduk. Ekibimiz artık veri girişi yerine kontrol ve karar süreçlerine odaklanıyor.',
    name: 'Elif S.',
    company: 'Nova Tekstil',
    rating: 5,
  },
  {
    role: 'Finans müdürü',
    quote:
      'Arşiv ve aktarım süreçlerinin standartlaşması, kapanış dönemlerinde ciddi zaman kazandırıyor.',
    name: 'Can D.',
    company: 'Merkez Holding',
    rating: 4,
  },
  {
    role: 'Operasyon sorumlusu',
    quote:
      'E-fatura ve gider belgelerini aynı akışta toplamak, günlük operasyonu çok daha yönetilebilir kıldı.',
    name: 'Zeynep A.',
    company: 'Delta Lojistik',
    rating: 5,
  },
  {
    role: 'KOBİ sahibi',
    quote:
      'Kurulum gerektirmemesi ve web tabanlı olması sayesinde hızlıca devreye aldık. Ekip adaptasyonu da kolay oldu.',
    name: 'Burak Y.',
    company: 'Yıldız Gıda',
    rating: 5,
  },
]

const revealVariants = ['fade-up', 'fade-left', 'fade-right'] as const

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--ds-color-primary)_12%,white)] text-sm font-bold text-[var(--ds-color-primary)]"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} yıldız`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon
          key={index}
          icon={Star}
          size="sm"
          className={
            index < rating
              ? 'fill-[var(--ds-color-warning)] text-[var(--ds-color-warning)]'
              : 'text-[var(--ds-color-border)]'
          }
        />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <SectionContainer
      className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]"
      aria-labelledby="testimonials-heading"
    >
      <div className="mb-8 max-w-2xl">
        <h2 id="testimonials-heading" className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Müşteri Yorumları
        </h2>
        <p className="mt-3 text-base text-[var(--ds-color-text-muted)]">
          Farklı sektörlerden kullanıcıların DOSYORA deneyimi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item, index) => (
          <ScrollReveal
            key={item.name}
            delayMs={index * 50}
            variant={revealVariants[index % revealVariants.length]}
          >
            <Card interactive className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarInitials name={item.name} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ds-color-text)]">{item.name}</p>
                    <p className="text-xs text-[var(--ds-color-text-muted)]">{item.company}</p>
                  </div>
                </div>
                <StarRating rating={item.rating} />
              </div>
              <span className="mt-4 inline-flex w-fit rounded-[var(--ds-radius-sm)] bg-[color:color-mix(in_srgb,var(--ds-color-primary)_10%,white)] px-2 py-0.5 text-xs font-medium text-[var(--ds-color-primary)]">
                {item.role}
              </span>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </SectionContainer>
  )
}
