export type ProvisionDemoAccountInput = {
  email: string
  companyName: string
  contactName: string
  accountType: 'DEMO' | 'OWNER' | 'INTERNAL' | 'PAID'
  documentLimit: number | null
}

export type ProvisionDemoAccountResult = {
  userId: string
  companyId: string
}

export interface DemoProvisioningClient {
  provisionAccount(input: ProvisionDemoAccountInput): Promise<ProvisionDemoAccountResult>
  activateAccount(input: {
    email: string
    password: string
    companyName: string
    contactName: string
  }): Promise<ProvisionDemoAccountResult>
}

export function getBelgeOkumaApiBaseUrl(): string | null {
  return process.env.BELGEOKUMA_API_BASE_URL?.trim() || null
}

export function getBelgeOkumaInternalSecret(): string | null {
  return process.env.BELGEOKUMA_INTERNAL_SECRET?.trim() || null
}

export function isBelgeOkumaProvisioningConfigured(): boolean {
  return Boolean(getBelgeOkumaApiBaseUrl() && getBelgeOkumaInternalSecret())
}
