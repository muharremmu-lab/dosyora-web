export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readingTime: string
  content: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'yapay-zeka-ile-belge-okuma',
    title: 'Yapay Zekâ ile Belge Okuma',
    excerpt:
      'Yapay zekâ destekli belge okuma, muhasebe süreçlerinde manuel veri girişini azaltır ve doğruluğu artırır.',
    publishedAt: '2026-08-01',
    readingTime: '5 dk',
    content: [
      'Yapay zekâ ile belge okuma, fatura ve fiş gibi ticari belgelerdeki alanları otomatik tanır. Bu sayede muhasebe ekipleri tekrarlayan iş yükünden kurtulur.',
      'DOSYORA, belge türüne göre alan eşleştirmesi yaparak okunan veriyi yapılandırılmış formata dönüştürür. Sonuçlar arşivlenir ve Excel aktarım şablonlarına hazır hale getirilir.',
      'Bu yazı serisinde belge okuma süreçlerini, doğruluk kriterlerini ve muhasebe programlarına aktarım adımlarını ele alacağız.',
    ],
  },
  {
    slug: 'muhasebe-belgeleri-dijitallestirme',
    title: 'Muhasebe Belgeleri Dijitalleştirme',
    excerpt:
      'Kağıt belgelerden dijital arşive geçiş, erişilebilirlik ve denetim süreçlerini kolaylaştırır.',
    publishedAt: '2026-07-28',
    readingTime: '4 dk',
    content: [
      'Muhasebe belgelerinin dijitalleştirilmesi yalnızca tarama değil; okunabilir, aranabilir ve aktarılabilir veri üretmeyi de kapsar.',
      'Dijital arşiv sayesinde belgeler tek merkezde toplanır, ekip içi erişim standartlaşır ve kayıp evrak riski azalır.',
      'DOSYORA ile dijitalleştirme süreci; yükleme, okuma, arşivleme ve muhasebe aktarımı adımlarından oluşur.',
    ],
  },
  {
    slug: 'luca-excel-aktarimi',
    title: 'Luca Excel Aktarımı',
    excerpt:
      'Luca muhasebe programına uygun Excel aktarım şablonları ile belge verilerini hızlıca aktarın.',
    publishedAt: '2026-07-22',
    readingTime: '4 dk',
    content: [
      'Luca kullanan firmalar için Excel aktarım şablonları, belge alanlarının program formatına uygun şekilde eşleştirilmesini sağlar.',
      'DOSYORA, okunan fatura ve gider belgelerini Luca aktarımına uygun sütun yapısında dışa aktarır.',
      'Bu rehberde şablon alanları, aktarım adımları ve sık karşılaşılan eşleştirme senaryolarını paylaşacağız.',
    ],
  },
  {
    slug: 'defter-beyan-excel-aktarimi',
    title: 'Defter Beyan Excel Aktarımı',
    excerpt:
      'Defter Beyan süreçlerine uygun Excel çıktıları ile belge aktarımını hızlandırın.',
    publishedAt: '2026-07-18',
    readingTime: '4 dk',
    content: [
      'Defter Beyan kullanıcıları için Excel aktarımı, belge verilerinin doğru formatta hazırlanmasını gerektirir.',
      'DOSYORA, okunan belgeleri Defter Beyan aktarım şablonlarına uygun alanlarla dışa aktarmayı hedefler.',
      'Placeholder içerik: detaylı alan eşleştirme tablosu ve örnek aktarım akışı bu yazıda genişletilecektir.',
    ],
  },
  {
    slug: 'dijital-belge-arsivi',
    title: 'Dijital Belge Arşivi',
    excerpt:
      'Web tabanlı dijital arşiv ile belgelerinizi güvenle saklayın, arayın ve yönetin.',
    publishedAt: '2026-07-12',
    readingTime: '5 dk',
    content: [
      'Dijital belge arşivi, muhasebe ve operasyon ekiplerinin belgelere anında erişmesini sağlar.',
      'Arama, filtreleme ve sürüm takibi gibi temel arşiv ihtiyaçları web tabanlı platformlarda merkezi olarak yönetilebilir.',
      'DOSYORA temel arşiv modülü ile belgeler okunduktan sonra güvenli şekilde saklanır ve ekip içinde paylaşılır.',
    ],
  },
  {
    slug: 'ocr-nedir',
    title: 'OCR Nedir?',
    excerpt:
      'OCR (Optik Karakter Tanıma), görsel ve PDF belgelerdeki metni okunabilir veriye dönüştürür.',
    publishedAt: '2026-07-05',
    readingTime: '3 dk',
    content: [
      'OCR teknolojisi, taranmış belgelerdeki karakterleri tanıyarak dijital metin üretir. Muhasebe belgelerinde veri giriş süresini kısaltır.',
      'Geleneksel OCR yöntemleri yapılandırılmamış metin üretirken, yapay zekâ destekli okuma belge alanlarını anlamsal olarak ayırabilir.',
      'DOSYORA, OCR ve yapay zekâ okumayı birlikte kullanarak fatura, fiş ve ekstrelerde daha yüksek doğruluk hedefler.',
    ],
  },
  {
    slug: 'evrak-yonetimi',
    title: 'Evrak Yönetimi',
    excerpt:
      'Evrak yönetimi süreçlerini dijitalleştirerek operasyonel verimliliği artırın.',
    publishedAt: '2026-06-28',
    readingTime: '5 dk',
    content: [
      'Evrak yönetimi; belge toplama, sınıflandırma, onay ve arşivleme adımlarını kapsayan uçtan uca bir süreçtir.',
      'Dağınık evrak akışı gecikmelere ve uyum risklerine yol açabilir. Merkezi dijital sistemler bu riski azaltır.',
      'DOSYORA V2 yol haritasındaki Akıllı Ofis modülü, evrak yönetimini CRM ve görev takibi ile birleştirmeyi hedefler.',
    ],
  },
  {
    slug: 'yapay-zeka-muhasebeyi-nasil-degiistiriyor',
    title: 'Yapay Zekâ Muhasebeyi Nasıl Değiştiriyor?',
    excerpt:
      'Yapay zekâ, muhasebe süreçlerinde hız, doğruluk ve otomasyon açısından yeni bir dönem açıyor.',
    publishedAt: '2026-06-20',
    readingTime: '6 dk',
    content: [
      'Muhasebe departmanları yoğun belge trafiği, manuel kontrol ve dönemsel yoğunluk baskısı altında çalışır. Yapay zekâ bu yükü azaltmaya odaklanır.',
      'Belge okuma, sınıflandırma ve aktarım otomasyonu sayesinde ekipler analiz ve kontrol işlerine daha fazla zaman ayırabilir.',
      'DOSYORA, muhasebe dönüşümünü belge okuma ve arşivden başlayarak modüler bir platform vizyonuyla ele alır.',
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug)
}
