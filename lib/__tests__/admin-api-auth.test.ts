import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { isAdminAuthenticated } from '@/lib/admin-auth'
import {
  requireAdminApiAuth,
  requireAdminMutationAuth,
  requireSameOriginMutation,
} from '@/lib/admin-api-auth'

vi.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: vi.fn(),
}))

describe('admin api auth helpers', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when admin session is missing', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false)

    const response = await requireAdminApiAuth()

    expect(response?.status).toBe(401)
    await expect(response?.json()).resolves.toEqual({ error: 'Yetkisiz erişim.' })
  })

  it('returns null when admin session is valid', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true)

    await expect(requireAdminApiAuth()).resolves.toBeNull()
  })

  it('allows same-origin mutation when origin matches host', () => {
    const request = new NextRequest('http://localhost:3000/api/demo-leads/1', {
      method: 'PATCH',
      headers: {
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
      },
    })

    expect(requireSameOriginMutation(request)).toBeNull()
  })

  it('blocks cross-origin mutation', () => {
    const request = new NextRequest('http://localhost:3000/api/demo-leads/1', {
      method: 'PATCH',
      headers: {
        host: 'localhost:3000',
        origin: 'https://evil.example',
      },
    })

    expect(requireSameOriginMutation(request)?.status).toBe(403)
  })

  it('returns 401 before same-origin check when unauthenticated', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/demo-leads/1', {
      method: 'PATCH',
      headers: {
        host: 'localhost:3000',
        origin: 'https://evil.example',
      },
    })

    const response = await requireAdminMutationAuth(request)

    expect(response?.status).toBe(401)
  })
})
