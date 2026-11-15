export const gibTebligatTerms = [
  { id: 'month1', label: '1 Ay', months: 1 },
  { id: 'month6', label: '6 Ay', months: 6 },
  { id: 'month12', label: '12 Ay', months: 12 },
] as const

export type GibTebligatTermId = (typeof gibTebligatTerms)[number]['id']

export const gibTebligatPlans = [
  {
    name: 'Firma Paketi',
    price: '100 TL',
    cadence: '/ Yıl (KDV Dahil)',
    capacity: '1 firma',
    features: ['1 Firma kapasitesi', 'Sınırsız sorgu', '14 gün ücretsiz deneme'],
    pricesTl: { month1: 8, month6: 50, month12: 100 },
  },
  {
    name: 'Mali Müşavir 50',
    price: '500 TL',
    cadence: '/ Yıl (KDV Dahil)',
    capacity: '50 mükellef',
    features: ['50 müşteri kapasitesi', 'Sınırsız sorgu', '14 gün ücretsiz deneme'],
    pricesTl: { month1: 42, month6: 250, month12: 500 },
  },
  {
    name: 'Mali Müşavir 100',
    price: '750 TL',
    cadence: '/ Yıl (KDV Dahil)',
    capacity: '100 mükellef',
    features: ['100 müşteri kapasitesi', 'Sınırsız sorgu', '14 gün ücretsiz deneme'],
    pricesTl: { month1: 63, month6: 375, month12: 750 },
  },
  {
    name: 'Mali Müşavir 200',
    price: '1.000 TL',
    cadence: '/ Yıl (KDV Dahil)',
    capacity: '200 mükellef',
    features: ['200 müşteri kapasitesi', 'Sınırsız sorgu', '14 gün ücretsiz deneme'],
    pricesTl: { month1: 83, month6: 500, month12: 1000 },
  },
] as const

export const gibTebligatTrialHref = '/indir'
export const gibTebligatInstallerHref = '/downloads/gibtebligat/GibTebligatPro-Kurulum.exe'
