import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'

export const homepageDemoLimitLabel = `${DEMO_DOCUMENT_LIMIT} Belge`

export const homepageDemoMarketingDescription = `Demo hesabınızla ${DEMO_DOCUMENT_LIMIT} belgeye kadar ücretsiz deneyebilirsiniz.`

/** Compact vertical rhythm for homepage marketing sections */
export const homepageSectionY = 'py-8 sm:py-10'
export const homepageSectionHeadMb = 'mb-5 sm:mb-6'
export const homepageScrollMt = 'scroll-mt-[4.75rem]'

export const documentTypeChips = [
  'Fiş',
  'Fatura',
  'Poliçe',
  'Uçak Bileti',
  'Noter Belgesi',
  'Diğer Belgeler',
] as const

export const howItWorksSteps = [
  {
    title: 'Belgelerinizi Yükleyin',
    description: 'Tek tek veya toplu yükleme ile süreci başlatın.',
  },
  {
    title: 'Yapay Zekâ Okusun',
    description: 'Gerekli alanlar belgeden otomatik çıkarılır.',
  },
  {
    title: 'Kontrol Edin',
    description: 'Çıkarılan bilgileri belgeyle birlikte doğrulayın.',
  },
  {
    title: 'Verinizi Oluşturun',
    description: 'Gerekirse düzeltin ve onaylayın.',
  },
  {
    title: 'Aktarın / Arşivleyin',
    description: 'Muhasebe çıktısı alın ve belgeyi arşivleyin.',
  },
] as const

export const featureCards = [
  {
    title: 'Toplu Yükleme',
    description: 'Belgelerinizi kolayca yükleyin, zamandan tasarruf edin.',
  },
  {
    title: 'Yapay Zekâ ile Otomatik Okuma',
    description: 'Belge üzerindeki gerekli bilgileri yapay zekâ ile çıkarın.',
  },
  {
    title: 'Matrah, KDV ve Toplam Kontrolü',
    description: 'Tutar, KDV ve toplam bilgilerini kontrol edin.',
  },
  {
    title: 'Hata Tespiti ve Düzeltme',
    description: 'Çıkarılan alanları belgeyle karşılaştırın ve gerektiğinde düzeltin.',
  },
  {
    title: 'Muhasebe / Excel Çıktıları',
    description: 'Onaylanan verileri uygun çıktı formatlarına dönüştürün.',
  },
  {
    title: 'Akıllı Arşiv',
    description: 'Belgelerinizi düzenli ve aranabilir bir arşiv yapısında yönetin.',
  },
] as const

export const whyDosyoraItems = [
  'Manuel veri girişini azaltır.',
  'Tekrarlanan belge işlerini hızlandırır.',
  'İnsan kontrolünü sürecin içinde tutar.',
  'Hata riskini azaltmaya yardımcı olur.',
  'Muhasebe için kullanılabilir veri üretir.',
  'Belge ve veriyi birlikte yönetmeye yardımcı olur.',
] as const

export const audienceCards = [
  {
    title: 'Mali Müşavirlik Büroları',
    description: 'Çok sayıda müşteri belgesini okuma, kontrol ve aktarım süreçlerini düzenler.',
  },
  {
    title: "KOBİ'ler",
    description: 'Günlük fatura ve fiş yükünü azaltır; belge sürecini sadeleştirir.',
  },
  {
    title: 'İşletmeler',
    description: 'Belge akışını standartlaştırır ve muhasebe verisine dönüşümü hızlandırır.',
  },
  {
    title: 'Finans ve Muhasebe Departmanları',
    description: 'Ekip genelinde belge işleme ve onay süreçlerini görünür kılar.',
  },
] as const

export const footerProductFamily = [
  { label: 'Belge Okuma', path: '/urun' },
  { label: 'Akıllı Ofis', path: '/cozumler' },
  { label: 'Belge Üretme', path: '/ozellikler' },
  { label: 'Sektörel Çözümler', path: '/cozumler' },
] as const
