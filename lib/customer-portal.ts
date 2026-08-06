/**
 * Müşteri uygulaması giriş adresi.
 * Şimdilik admin login'e yönlendirir; ileride app.dosyora.com'a taşınabilir.
 */
export function getCustomerLoginUrl(): string {
  const configured = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return '/admin/login'
}

export function isExternalCustomerLogin(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}
