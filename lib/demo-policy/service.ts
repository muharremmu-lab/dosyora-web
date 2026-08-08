import { hashActivationToken, generateActivationToken } from '@/lib/activation/tokens'
import { logApiError, logApiWarning } from '@/lib/api-logger'
import {
  createDemoAccount,
  findDemoAccountByEmail,
  updateDemoLeadProvision,
} from '@/lib/db/demo-leads'
import type { CreateDemoLeadInput, DemoLead } from '@/lib/db/types'
import { ACTIVATION_TOKEN_TTL_MS } from '@/lib/entitlements/constants'
import { resolveDemoDocumentLimit } from '@/lib/entitlements/policy'
import { notificationService } from '@/lib/notifications/service'
import { provisionDemoAccountSafely } from '@/lib/provisioning/client'

import type { DemoRequestContext } from './context'
import { DEMO_DUPLICATE_EMAIL_MESSAGE } from './messages'

export type DemoPolicySuccess = {
  outcome: 'created'
  lead: DemoLead
  documentLimit: number
  activationUrl?: string
}

export type DemoPolicyFailure = {
  outcome: 'duplicate_email' | 'creation_failed' | 'provision_failed'
  message: string
  status: 409 | 500
}

export type DemoPolicyResult = DemoPolicySuccess | DemoPolicyFailure

function buildActivationExpiry(): string {
  return new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS).toISOString()
}

export async function processDemoRequest(
  input: CreateDemoLeadInput,
  context: DemoRequestContext,
): Promise<DemoPolicyResult> {
  const normalizedEmail = context.email
  const documentLimit = resolveDemoDocumentLimit()

  const existingAccount = await findDemoAccountByEmail(normalizedEmail)
  if (existingAccount) {
    logApiWarning('demo_failed_duplicate_email', {
      email: normalizedEmail,
      ip: context.ipAddress,
      existingLeadId: existingAccount.id,
    })

    return {
      outcome: 'duplicate_email',
      message: DEMO_DUPLICATE_EMAIL_MESSAGE,
      status: 409,
    }
  }

  const activationToken = generateActivationToken()
  const activationTokenHash = hashActivationToken(activationToken)
  const activationExpiresAt = buildActivationExpiry()

  let lead: DemoLead

  try {
    lead = await createDemoAccount({
      ...input,
      email: normalizedEmail,
      document_limit: documentLimit,
      account_type: 'DEMO',
      activation_token_hash: activationTokenHash,
      activation_expires_at: activationExpiresAt,
      provision_status: 'PENDING',
    })
  } catch (error) {
    logApiError('demo_failed_creation', {
      email: normalizedEmail,
      ip: context.ipAddress,
    }, error)

    return {
      outcome: 'creation_failed',
      message: 'Demo hesabı oluşturulamadı. Lütfen daha sonra tekrar deneyin.',
      status: 500,
    }
  }

  const provision = await provisionDemoAccountSafely({
    email: normalizedEmail,
    companyName: input.company_name,
    contactName: input.contact_name,
    accountType: 'DEMO',
    documentLimit: documentLimit,
  })

  if (provision.provisionStatus === 'FAILED') {
    return {
      outcome: 'provision_failed',
      message: 'Demo hesabı oluşturulamadı. Lütfen daha sonra tekrar deneyin.',
      status: 500,
    }
  }

  lead =
    (await updateDemoLeadProvision({
      id: lead.id,
      customerUserId: provision.result?.userId ?? null,
      customerCompanyId: provision.result?.companyId ?? null,
      provisionStatus: provision.provisionStatus,
    })) ?? lead

  try {
    await notificationService.notifyDemoLeadCreated(lead, activationToken)
  } catch (error) {
    logApiError(
      'demo_notification_failed',
      {
        leadId: lead.id,
        email: normalizedEmail,
        ip: context.ipAddress,
      },
      error,
    )
  }

  return {
    outcome: 'created',
    lead,
    documentLimit,
  }
}
