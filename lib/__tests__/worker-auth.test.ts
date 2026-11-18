import { describe, expect, it, vi } from 'vitest'

import { isHardwareId, isWorkerAuthorized } from '@/lib/worker-auth'

function requestWith(headers: Record<string, string>) {
  return new Request('http://localhost/api/v1/jobs/poll', { headers }) as unknown as import('next/server').NextRequest
}

describe('worker auth', () => {
  it('rejects a missing or different worker key', () => {
    vi.stubEnv('WORKER_API_KEY', 'local-worker-key')
    expect(isWorkerAuthorized(requestWith({ 'x-worker-key': 'other' }))).toBe(false)
    expect(isWorkerAuthorized(requestWith({ 'x-worker-key': 'local-worker-key' }))).toBe(true)
    vi.unstubAllEnvs()
  })

  it('accepts a 64 character hardware id', () => {
    expect(isHardwareId('a'.repeat(64))).toBe(true)
    expect(isHardwareId('short')).toBe(false)
  })
})
