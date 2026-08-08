export type SecurityHeader = {
  key: string
  value: string
}

export function buildContentSecurityPolicy(isProduction: boolean): string {
  const connectSrc = isProduction
    ? "'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com"
    : "'self' http://localhost:* ws://localhost:* https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com"

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://www.google-analytics.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
  ].join('; ')
}

export function buildSecurityHeaders(isProduction: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(isProduction) },
  ]

  if (isProduction) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    })
  }

  return headers
}
