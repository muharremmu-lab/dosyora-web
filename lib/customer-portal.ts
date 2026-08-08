/**
 * Müşteri uygulaması giriş adresi.
 * Production'da NEXT_PUBLIC_CUSTOMER_APP_URL ile app.dosyora.com/login hedeflenir.
 */
export function getCustomerLoginUrl(): string {
  const configured = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL?.trim()
  if (configured) {
    const normalized = configured.replace(/\/$/, '')
    return normalized.endsWith('/login') ? normalized : `${normalized}/login`
  }

  if (process.env.NODE_ENV === 'production') {
    return '/login-unavailable'
  }

  return 'http://127.0.0.1:5173/login'
}

export function isExternalCustomerLogin(url: string | null | undefined): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export function getCustomerLoginUnavailableMessage(): string {
  return 'Müşteri uygulaması giriş adresi henüz yapılandırılmadı. Lütfen destek ile iletişime geçin.'
}
