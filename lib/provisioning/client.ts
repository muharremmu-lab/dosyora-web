import { logApiError, logApiWarning } from '@/lib/api-logger'

import type {
  DemoProvisioningClient,
  ProvisionDemoAccountInput,
  ProvisionDemoAccountResult,
} from './types'
import { getBelgeOkumaApiBaseUrl, getBelgeOkumaInternalSecret } from './types'

export class HttpBelgeOkumaProvisioningClient implements DemoProvisioningClient {
  async provisionAccount(input: ProvisionDemoAccountInput): Promise<ProvisionDemoAccountResult> {
    const baseUrl = getBelgeOkumaApiBaseUrl()
    const secret = getBelgeOkumaInternalSecret()

    if (!baseUrl || !secret) {
      throw new Error('BelgeOkuma provisioning is not configured.')
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/internal/demo-provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        email: input.email,
        company_name: input.companyName,
        contact_name: input.contactName,
        account_type: input.accountType,
        document_limit: input.documentLimit,
      }),
    })

    if (!response.ok) {
      throw new Error(`BelgeOkuma provisioning failed with status ${response.status}.`)
    }

    const payload = (await response.json()) as {
      user_id?: string
      company_id?: string
    }

    if (!payload.user_id || !payload.company_id) {
      throw new Error('BelgeOkuma provisioning returned incomplete payload.')
    }

    return {
      userId: payload.user_id,
      companyId: payload.company_id,
    }
  }

  async activateAccount(input: {
    email: string
    password: string
    companyName: string
    contactName: string
  }): Promise<ProvisionDemoAccountResult> {
    const baseUrl = getBelgeOkumaApiBaseUrl()
    const secret = getBelgeOkumaInternalSecret()

    if (!baseUrl || !secret) {
      throw new Error('BelgeOkuma provisioning is not configured.')
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/internal/demo-activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        company_name: input.companyName,
        contact_name: input.contactName,
      }),
    })

    if (!response.ok) {
      throw new Error(`BelgeOkuma activation failed with status ${response.status}.`)
    }

    const payload = (await response.json()) as {
      user_id?: string
      company_id?: string
    }

    if (!payload.user_id || !payload.company_id) {
      throw new Error('BelgeOkuma activation returned incomplete payload.')
    }

    return {
      userId: payload.user_id,
      companyId: payload.company_id,
    }
  }
}

export class LocalOnlyProvisioningClient implements DemoProvisioningClient {
  async provisionAccount(input: ProvisionDemoAccountInput): Promise<ProvisionDemoAccountResult> {
    logApiWarning('demo_provision_local_only', {
      email: input.email,
      accountType: input.accountType,
    })

    return {
      userId: `local-${input.email}`,
      companyId: `local-company-${input.email}`,
    }
  }

  async activateAccount(input: {
    email: string
    password: string
    companyName: string
    contactName: string
  }): Promise<ProvisionDemoAccountResult> {
    logApiWarning('demo_activate_local_only', { email: input.email })
    return {
      userId: `local-${input.email}`,
      companyId: `local-company-${input.email}`,
    }
  }
}

export function createDemoProvisioningClient(): DemoProvisioningClient {
  if (isBelgeOkumaProvisioningConfigured()) {
    return new HttpBelgeOkumaProvisioningClient()
  }

  return new LocalOnlyProvisioningClient()
}

function isBelgeOkumaProvisioningConfigured(): boolean {
  return Boolean(getBelgeOkumaApiBaseUrl() && getBelgeOkumaInternalSecret())
}

export async function provisionDemoAccountSafely(
  input: ProvisionDemoAccountInput,
  client: DemoProvisioningClient = createDemoProvisioningClient(),
): Promise<{ result: ProvisionDemoAccountResult | null; provisionStatus: 'PROVISIONED' | 'LOCAL_ONLY' | 'FAILED' }> {
  try {
    const result = await client.provisionAccount(input)
    return {
      result,
      provisionStatus: isBelgeOkumaProvisioningConfigured() ? 'PROVISIONED' : 'LOCAL_ONLY',
    }
  } catch (error) {
    logApiError('demo_provision_failed', { email: input.email }, error)
    return { result: null, provisionStatus: 'FAILED' }
  }
}

export async function activateDemoAccountSafely(
  input: {
    email: string
    password: string
    companyName: string
    contactName: string
  },
  client: DemoProvisioningClient = createDemoProvisioningClient(),
): Promise<{ result: ProvisionDemoAccountResult | null; provisionStatus: 'PROVISIONED' | 'LOCAL_ONLY' | 'FAILED' }> {
  try {
    const result = await client.activateAccount(input)
    return {
      result,
      provisionStatus: isBelgeOkumaProvisioningConfigured() ? 'PROVISIONED' : 'LOCAL_ONLY',
    }
  } catch (error) {
    logApiError('demo_activate_failed', { email: input.email }, error)
    return { result: null, provisionStatus: 'FAILED' }
  }
}
