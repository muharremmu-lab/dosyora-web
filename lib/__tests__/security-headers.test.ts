import { describe, expect, it } from 'vitest'

import { buildContentSecurityPolicy, buildSecurityHeaders } from '@/lib/security/headers'

describe('security headers', () => {
  it('includes baseline headers for all environments', () => {
    const headers = buildSecurityHeaders(false)
    const headerMap = Object.fromEntries(headers.map((header) => [header.key, header.value]))

    expect(headerMap['X-Content-Type-Options']).toBe('nosniff')
    expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(headerMap['Permissions-Policy']).toContain('camera=()')
    expect(headerMap['X-Frame-Options']).toBe('DENY')
    expect(headerMap['Content-Security-Policy']).toContain("frame-ancestors 'none'")
    expect(headerMap['Strict-Transport-Security']).toBeUndefined()
  })

  it('adds HSTS only in production', () => {
    const headers = buildSecurityHeaders(true)
    const headerMap = Object.fromEntries(headers.map((header) => [header.key, header.value]))

    expect(headerMap['Strict-Transport-Security']).toContain('max-age=')
  })

  it('allows Google Analytics and Google Fonts in CSP', () => {
    const csp = buildContentSecurityPolicy(true)

    expect(csp).toContain('https://www.googletagmanager.com')
    expect(csp).toContain('https://fonts.googleapis.com')
    expect(csp).toContain('https://fonts.gstatic.com')
  })
})
