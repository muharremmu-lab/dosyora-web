import { SectionContainer } from '@/components/ui'
import { cn } from '@/lib/design-system/cn'

const faqItems = [
  {
    question: 'DOSYORA nedir?',
    answer:
      'DOSYORA; fatura, fiş, makbuz ve diğer ticari belgeleri yapay zekâ ile okuyan, arşivleyen ve muhasebe programlarına uygun Excel aktarım şablonları üreten web tabanlı bir platformdur.',
  },
  {
    question: 'Hangi belge türlerini okuyabilir?',
    answer:
      'Fatura, fiş, serbest meslek makbuzu, banka ekstresi, gider pusulası, PDF ve görsel dosyalar desteklenir.',
  },
  {
    question: 'Ön izleme programı nasıl çalışır?',
    answer:
      'Demo başvurunuz incelenir; onaylanan firmalara 100 belge okuma hakkı tanımlanır. Başvuru için /demo sayfasındaki formu doldurmanız yeterlidir.',
  },
  {
    question: 'Hangi muhasebe programlarıyla uyumludur?',
    answer:
      'Luca, Defter Beyan, Logo, Mikro, ETA, Nebim ve diğer ERP sistemlerine uygun Excel aktarım şablonları sunulur.',
  },
  {
    question: 'Belgelerim güvende mi?',
    answer:
      'Belgeler güvenli arşiv altyapısında saklanır. Web tabanlı erişim, yetkilendirme ve sürekli güncellenen güvenlik önlemleri ile korunur.',
  },
  {
    question: 'Kurulum gerekiyor mu?',
    answer:
      'Hayır. DOSYORA tamamen web tabanlıdır; tarayıcınızdan giriş yaparak kullanmaya başlayabilirsiniz.',
  },
  {
    question: 'Yapay zekâ okuma ne kadar hızlıdır?',
    answer:
      'Belge türüne ve kalitesine göre değişmekle birlikte, çoğu belge saniyeler içinde işlenir ve sonuç ekranında görüntülenir.',
  },
  {
    question: 'DOSYORA V2 ve sonrasında neler gelecek?',
    answer:
      'Yol haritasında Akıllı Ofis, CRM, belge üretme ve sektörel çözümler planlanmaktadır. Güncel sürüm bilgisi ana sayfadaki yol haritasında yer alır.',
  },
  {
    question: 'Excel aktarım şablonları nasıl çalışır?',
    answer:
      'Okunan belge alanları, seçtiğiniz muhasebe programına uygun sütun yapısına eşlenir ve Excel dosyası olarak dışa aktarılır.',
  },
  {
    question: 'Kaç belge yükleyebilirim?',
    answer:
      'Ön izleme programında onaylanan firmalara 100 belge okuma hakkı tanımlanır. Kurumsal planlar için demo başvurusu sonrası bilgi verilir.',
  },
  {
    question: 'Ekip içinde kullanılabilir mi?',
    answer:
      'Evet. Web tabanlı yapı sayesinde ekip üyeleri belge yükleyebilir, arşive erişebilir ve aktarım süreçlerini birlikte yönetebilir.',
  },
  {
    question: 'Mobil cihazlardan erişilebilir mi?',
    answer:
      'DOSYORA responsive web arayüzü ile tablet ve mobil tarayıcılardan erişilebilir. Kurulum gerekmez.',
  },
  {
    question: 'Veriler nerede saklanır?',
    answer:
      'Belgeler bulut tabanlı güvenli arşiv altyapısında saklanır. SSL ile şifrelenmiş bağlantı üzerinden erişim sağlanır.',
  },
  {
    question: 'KVKK uyumluluğu var mı?',
    answer:
      'Platform, kişisel verilerin korunması ve güvenli saklama prensiplerine uygun şekilde tasarlanmıştır. Detaylar KVKK sayfasında yayımlanacaktır.',
  },
  {
    question: 'Hangi yapay zekâ teknolojileri kullanılıyor?',
    answer:
      'Belge okuma süreçlerinde Gemini AI ve OpenAI altyapılarından yararlanılır. Model seçimi belge türüne göre optimize edilir.',
  },
  {
    question: 'Destek alabilir miyim?',
    answer:
      'Demo başvurusu sonrası onboarding ve kullanım desteği sunulur. İletişim sayfasından ekibimize ulaşabilirsiniz.',
  },
]

export function FaqSection() {
  return (
    <SectionContainer className="py-[var(--ds-space-12)] sm:py-[var(--ds-space-16)]">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)] sm:text-3xl">
          Sık Sorulan Sorular
        </h2>
      </div>

      <div className="mx-auto max-w-3xl divide-y divide-[var(--ds-color-border)] rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]">
        {faqItems.map((item, index) => (
          <details key={item.question} className="group ds-animate-fade" style={{ animationDelay: `${index * 30}ms` }}>
            <summary
              className={cn(
                'cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[var(--ds-color-text)] ds-transition-hover',
                'hover:bg-[var(--ds-color-surface-alt)]',
                '[&::-webkit-details-marker]:hidden',
              )}
            >
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-[var(--ds-color-text-muted)] transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">{item.answer}</p>
          </details>
        ))}
      </div>
    </SectionContainer>
  )
}
