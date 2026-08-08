import { hashActivationToken, verifyActivationTokenHash } from '@/lib/activation/tokens'
import { logApiWarning } from '@/lib/api-logger'
import {
  getDemoLeadByActivationTokenHash,
  markDemoLeadActivated,
} from '@/lib/db/demo-leads'
import type { DemoLead } from '@/lib/db/types'
import { activateDemoAccountSafely } from '@/lib/provisioning/client'

export type ActivationVerifyResult =
  | { valid: true; lead: DemoLead }
  | { valid: false; reason: 'missing' | 'expired' | 'used' | 'invalid' }

export async function verifyActivationTokenAsync(
  token: string | null | undefined,
): Promise<ActivationVerifyResult> {
  if (!token?.trim()) {
    return { valid: false, reason: 'missing' }
  }

  const tokenHash = hashActivationToken(token.trim())
  const lead = await getDemoLeadByActivationTokenHash(tokenHash)

  if (!lead) {
    return { valid: false, reason: 'invalid' }
  }

  if (lead.activation_status === 'ACTIVATED' || lead.activation_used_at) {
    return { valid: false, reason: 'used' }
  }

  if (lead.activation_expires_at && Date.parse(lead.activation_expires_at) < Date.now()) {
    return { valid: false, reason: 'expired' }
  }

  if (!verifyActivationTokenHash(token.trim(), lead.activation_token_hash)) {
    return { valid: false, reason: 'invalid' }
  }

  return { valid: true, lead }
}

export async function completeDemoActivation(input: {
  token: string
  password: string
}): Promise<{ success: true; lead: DemoLead } | { success: false; reason: string }> {
  const verification = await verifyActivationTokenAsync(input.token)
  if (!verification.valid) {
    logApiWarning('demo_activation_invalid', { reason: verification.reason })
    return { success: false, reason: 'Geçersiz veya süresi dolmuş aktivasyon bağlantısı.' }
  }

  if (input.password.trim().length < 10) {
    return { success: false, reason: 'Şifre en az 10 karakter olmalıdır.' }
  }

  const activation = await activateDemoAccountSafely({
    email: verification.lead.email,
    password: input.password,
    companyName: verification.lead.company_name,
    contactName: verification.lead.contact_name,
  })

  if (activation.provisionStatus === 'FAILED') {
    return { success: false, reason: 'Hesap aktivasyonu tamamlanamadı. Lütfen daha sonra tekrar deneyin.' }
  }

  const updated = await markDemoLeadActivated({
    id: verification.lead.id,
    customerUserId: activation.result?.userId ?? verification.lead.customer_user_id ?? `local-${verification.lead.email}`,
    customerCompanyId:
      activation.result?.companyId ?? verification.lead.customer_company_id ?? `local-company-${verification.lead.email}`,
    provisionStatus: activation.provisionStatus,
  })

  if (!updated) {
    return { success: false, reason: 'Hesap aktivasyonu tamamlanamadı.' }
  }

  return { success: true, lead: updated }
}
