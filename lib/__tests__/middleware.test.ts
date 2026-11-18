import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { middleware } from '@/middleware'

describe('Middleware Routing and Subdomain', () => {
  it('redirects tebligat.dosyora.com to login if unauthenticated', () => {
    const req = new NextRequest('https://tebligat.dosyora.com/', {
      headers: { host: 'tebligat.dosyora.com' },
    })

    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
    expect(res.headers.get('location')).toContain('redirect=https%3A%2F%2Ftebligat.dosyora.com%2Fportal%2Ftebligat')
  })

  it('redirects tebligat.dosyora.com to /portal/tebligat if authenticated', () => {
    const req = new NextRequest('https://tebligat.dosyora.com/', {
      headers: {
        host: 'tebligat.dosyora.com',
        cookie: 'dosyora_user_session=valid.token',
      },
    })

    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/portal/tebligat')
  })

  it('allows access if already at /portal/tebligat on tebligat.dosyora.com', () => {
    const req = new NextRequest('https://tebligat.dosyora.com/portal/tebligat', {
      headers: {
        host: 'tebligat.dosyora.com',
        cookie: 'dosyora_user_session=valid.token',
      },
    })

    const res = middleware(req)
    expect(res.status).toBe(200)
  })

  it('redirects unauthenticated /portal requests to /login', () => {
    const req = new NextRequest('https://dosyora.com/portal/ithalat', {
      headers: { host: 'dosyora.com' },
    })

    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login?redirect=%2Fportal%2Fithalat')
  })
})
