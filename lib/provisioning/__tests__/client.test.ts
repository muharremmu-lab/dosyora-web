import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/security/production-env', () => ({
  isProductionRuntime: vi.fn(() => true),
}))

vi.mock('@/lib/provisioning/types', () => ({
  getBelgeOkumaApiBaseUrl: vi.fn(() => null),
  getBelgeOkumaInternalSecret: vi.fn(() => null),
  isBelgeOkumaProvisioningConfigured: vi.fn(() => false),
}))

describe('production provisioning fail-closed', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('does not use LOCAL_ONLY provisioning client in production', async () => {
    const { createDemoProvisioningClient } = await import('@/lib/provisioning/client')
    expect(() => createDemoProvisioningClient()).toThrow(/required in production/i)
  })
})
