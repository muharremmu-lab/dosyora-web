import { logApiError, logApiWarning } from '@/lib/api-logger'
import {
  createDemoAccount,
  findDemoAccountByEmail,
} from '@/lib/db/demo-leads'
import {
  getDocumentLimitForIpCount,
  getIpDemoQuota,
  incrementIpDemoQuota,
  isIpQuotaExceeded,
} from '@/lib/db/ip-demo-quota'
import type { CreateDemoLeadInput, DemoLead } from '@/lib/db/types'
import { notificationService } from '@/lib/notifications/service'

import type { DemoRequestContext } from './context'
import {
  DEMO_DUPLICATE_EMAIL_MESSAGE,
  DEMO_IP_QUOTA_EXCEEDED_MESSAGE,
} from './messages'

export type DemoPolicySuccess = {
  outcome: 'created'
  lead: DemoLead
  documentLimit: number
}

export type DemoPolicyFailure = {
  outcome: 'duplicate_email' | 'ip_quota_exceeded' | 'creation_failed'
  message: string
  status: 409 | 403 | 500
}

export type DemoPolicyResult = DemoPolicySuccess | DemoPolicyFailure

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

  const ipQuota = await getIpDemoQuota(context.ipAddress)

  if (isIpQuotaExceeded(ipQuota.demo_count)) {
    logApiWarning('demo_failed_ip_quota_exceeded', {
      email: normalizedEmail,
      ip: context.ipAddress,
      demoCount: ipQuota.demo_count,
    })

    return {
      outcome: 'ip_quota_exceeded',
      message: DEMO_IP_QUOTA_EXCEEDED_MESSAGE,
      status: 403,
    }
  }

  const documentLimit = getDocumentLimitForIpCount(ipQuota.demo_count)
  if (documentLimit === null) {
    logApiWarning('demo_failed_ip_quota_exceeded', {
      email: normalizedEmail,
      ip: context.ipAddress,
      demoCount: ipQuota.demo_count,
    })

    return {
      outcome: 'ip_quota_exceeded',
      message: DEMO_IP_QUOTA_EXCEEDED_MESSAGE,
      status: 403,
    }
  }

  try {
    const lead = await createDemoAccount({
      ...input,
      email: normalizedEmail,
      document_limit: documentLimit,
    })

    await incrementIpDemoQuota(context.ipAddress)

    await notificationService.notifyDemoLeadCreated(lead)

    return {
      outcome: 'created',
      lead,
      documentLimit,
    }
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
}
