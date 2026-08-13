import { hashActivationToken, generateActivationToken } from '@/lib/activation/tokens'
import { logApiError, logApiWarning } from '@/lib/api-logger'
import {
  createDemoAccount,
  createDemoInquiry,
  findDemoAccountByEmail,
  updateDemoLeadProvision,
} from '@/lib/db/demo-leads'
import {
  releaseDemoAttemptQuota,
  reserveDemoAttemptQuota,
} from '@/lib/db/demo-quota-reservation'
import type { CreateDemoLeadInput, DemoLead } from '@/lib/db/types'
import { ACTIVATION_TOKEN_TTL_MS } from '@/lib/entitlements/constants'
import { notificationService } from '@/lib/notifications/service'
import { provisionDemoAccountSafely } from '@/lib/provisioning/client'
import { isProductionRuntime } from '@/lib/security/production-env'

import type { DemoRequestContext } from './context'
import { DEMO_DUPLICATE_EMAIL_MESSAGE, DEMO_IP_QUOTA_EXCEEDED_MESSAGE } from './messages'

export type DemoPolicySuccess = {
  outcome: 'created'
  lead: DemoLead
  documentLimit: number
  activationUrl?: string
}

export type DemoPolicyFailure = {
  outcome: 'duplicate_email' | 'creation_failed' | 'provision_failed' | 'ip_quota_exceeded'
  message: string
  status: 409 | 429 | 500
}

export type DemoPolicyResult = DemoPolicySuccess | DemoPolicyFailure

function buildActivationExpiry(): string {
  return new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS).toISOString()
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  return message.includes('unique constraint failed') || message.includes('constraint failed')
}

export async function processDemoRequest(
  input: CreateDemoLeadInput,
  context: DemoRequestContext,
): Promise<DemoPolicyResult> {
  const normalizedEmail = context.email

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

  const reservation = await reserveDemoAttemptQuota(normalizedEmail, context.ipAddress)
  if (!reservation.reserved) {
    logApiWarning('demo_failed_repeat_quota_exceeded', {
      email: normalizedEmail,
      ip: context.ipAddress,
    })

    return {
      outcome: 'ip_quota_exceeded',
      message: DEMO_IP_QUOTA_EXCEEDED_MESSAGE,
      status: 429,
    }
  }

  const documentLimit = reservation.documentLimit

  const duplicateAfterReservation = await findDemoAccountByEmail(normalizedEmail)
  if (duplicateAfterReservation) {
    await releaseDemoAttemptQuota(normalizedEmail, context.ipAddress)
    logApiWarning('demo_failed_duplicate_email', {
      email: normalizedEmail,
      ip: context.ipAddress,
      existingLeadId: duplicateAfterReservation.id,
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
    await releaseDemoAttemptQuota(normalizedEmail, context.ipAddress)

    if (isUniqueConstraintError(error)) {
      logApiWarning('demo_failed_duplicate_email', {
        email: normalizedEmail,
        ip: context.ipAddress,
      })

      return {
        outcome: 'duplicate_email',
        message: DEMO_DUPLICATE_EMAIL_MESSAGE,
        status: 409,
      }
    }

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
    externalAccountId: String(lead.id),
    email: normalizedEmail,
    companyName: input.company_name,
    contactName: input.contact_name,
    accountType: 'DEMO',
    documentLimit: documentLimit,
  })

  if (provision.provisionStatus === 'FAILED') {
    await releaseDemoAttemptQuota(normalizedEmail, context.ipAddress)
    return {
      outcome: 'provision_failed',
      message: 'Demo hesabı oluşturulamadı. Lütfen daha sonra tekrar deneyin.',
      status: 500,
    }
  }

  if (provision.provisionStatus === 'LOCAL_ONLY' && isProductionRuntime()) {
    await releaseDemoAttemptQuota(normalizedEmail, context.ipAddress)
    logApiWarning('demo_provision_local_only_blocked', { leadId: lead.id, email: normalizedEmail })
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

export type DemoInquirySuccess = {
  outcome: 'inquiry_created'
  lead: DemoLead
}

export type DemoInquiryResult = DemoInquirySuccess | DemoPolicyFailure

export async function processDemoInquiry(
  input: CreateDemoLeadInput,
  context: DemoRequestContext,
): Promise<DemoInquiryResult> {
  let lead: DemoLead

  try {
    lead = await createDemoInquiry({
      ...input,
      email: context.email,
    })
  } catch (error) {
    logApiError(
      'demo_inquiry_failed_creation',
      {
        email: context.email,
        ip: context.ipAddress,
      },
      error,
    )

    return {
      outcome: 'creation_failed',
      message: 'Demo talebi kaydedilemedi. Lütfen daha sonra tekrar deneyin.',
      status: 500,
    }
  }

  try {
    await notificationService.notifyDemoInquiryCreated(lead)
  } catch (error) {
    logApiError(
      'demo_inquiry_notification_failed',
      {
        leadId: lead.id,
        email: context.email,
        ip: context.ipAddress,
      },
      error,
    )
  }

  return {
    outcome: 'inquiry_created',
    lead,
  }
}
