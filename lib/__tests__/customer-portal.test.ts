import { describe, expect, it } from 'vitest'

import { getCustomerLoginUrl } from '@/lib/customer-portal'

describe('getCustomerLoginUrl', () => {
  it('uses configured customer app url with /login suffix', () => {
    const original = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL
    process.env.NEXT_PUBLIC_CUSTOMER_APP_URL = 'https://app.dosyora.com'
    expect(getCustomerLoginUrl()).toBe('https://app.dosyora.com/login')
    process.env.NEXT_PUBLIC_CUSTOMER_APP_URL = original
  })

  it('does not redirect to admin login when env is missing in development', () => {
    const original = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL
    const originalNodeEnv = process.env.NODE_ENV
    delete process.env.NEXT_PUBLIC_CUSTOMER_APP_URL
    process.env.NODE_ENV = 'development'
    expect(getCustomerLoginUrl()).toBe('http://127.0.0.1:5173/login')
    process.env.NEXT_PUBLIC_CUSTOMER_APP_URL = original
    process.env.NODE_ENV = originalNodeEnv
  })

  it('uses login-unavailable route in production without env', () => {
    const original = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL
    const originalNodeEnv = process.env.NODE_ENV
    delete process.env.NEXT_PUBLIC_CUSTOMER_APP_URL
    process.env.NODE_ENV = 'production'
    expect(getCustomerLoginUrl()).toBe('/login-unavailable')
    process.env.NEXT_PUBLIC_CUSTOMER_APP_URL = original
    process.env.NODE_ENV = originalNodeEnv
  })
})
