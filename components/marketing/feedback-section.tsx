import { buttonClassName } from '@/components/ui'
import { homepageScrollMt, homepageSectionY } from '@/lib/homepage-content'
import { formInputClassName } from '@/lib/form-styles'

type FeedbackSectionProps = {
  sent?: boolean
}

export function FeedbackSection({ sent = false }: FeedbackSectionProps) {
  return (
    <section id="oneri" className={`border-t border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] ${homepageSectionY} ${homepageScrollMt}`}>
      <div className="mx-auto max-w-[var(--ds-container-max)] px-[var(--ds-container-padding)]">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">Öneri ve bildirim</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ds-color-text-muted)]">
            Site veya uygulamalar için öneri, istek ve şikayetinizi iletin. Kayıt yönetim paneline düşer.
          </p>
        </div>

        {sent ? (
          <p className="mt-6 max-w-2xl rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-white p-6 text-sm text-[var(--ds-color-text)]">
            Bildiriminiz alındı. İletişim bilginiz ve mesajınız kaydedildi.
          </p>
        ) : (
          <form action="/api/feedback" method="post" className="mt-6 grid max-w-2xl gap-4 rounded-[var(--ds-radius-xl)] border border-[var(--ds-color-border)] bg-white p-6 shadow-[var(--ds-shadow-md)]">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Tür</span>
              <select name="kind" defaultValue="oneri" className={formInputClassName}>
                <option value="oneri">Öneri</option>
                <option value="istek">İstek</option>
                <option value="sikayet">Şikayet</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Ad soyad</span>
              <input name="name" required className={formInputClassName} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium">E-posta</span>
                <input type="email" name="email" required className={formInputClassName} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium">Telefon</span>
                <input name="phone" className={formInputClassName} />
              </label>
            </div>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Mesaj</span>
              <textarea name="message" required rows={5} className={formInputClassName} />
            </label>
            <button type="submit" className={buttonClassName('primary', 'px-5 py-2.5')}>
              Gönder
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
