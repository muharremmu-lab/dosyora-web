import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCustomerLoginUrl } from '@/lib/customer-portal'

describe('getCustomerLoginUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses configured customer app url with /login suffix', () => {
    vi.stubEnv('NEXT_PUBLIC_CUSTOMER_APP_URL', 'https://app.dosyora.com')
    expect(getCustomerLoginUrl()).toBe('https://app.dosyora.com/login')
  })

  it('does not redirect to admin login when env is missing in development', () => {
    vi.stubEnv('NEXT_PUBLIC_CUSTOMER_APP_URL', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(getCustomerLoginUrl()).toBe('http://127.0.0.1:5173/login')
  })

  it('uses login-unavailable route in production without env', () => {
    vi.stubEnv('NEXT_PUBLIC_CUSTOMER_APP_URL', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(getCustomerLoginUrl()).toBe('/login-unavailable')
  })
})
