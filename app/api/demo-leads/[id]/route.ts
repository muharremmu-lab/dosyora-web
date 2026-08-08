export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminApiAuth, requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { logApiError, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { getDemoLeadById, updateDemoLead } from '@/lib/db/demo-leads'
import { ACCOUNT_STATUSES, type AccountStatus } from '@/lib/db/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseId(rawId: string): number | null {
  const id = Number.parseInt(rawId, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const authError = await requireAdminApiAuth()
  if (authError) {
    return authError
  }

  try {
    const { id: rawId } = await context.params
    const id = parseId(rawId)

    if (!id) {
      return jsonError('Geçersiz kayıt.', 400)
    }

    const lead = await getDemoLeadById(id)
    if (!lead) {
      return jsonError('Kayıt bulunamadı.', 404)
    }

    return jsonOk({ lead })
  } catch (error) {
    logApiError('demo_lead_get_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) {
    return authError
  }

  try {
    const { id: rawId } = await context.params
    const id = parseId(rawId)

    if (!id) {
      return jsonError('Geçersiz kayıt.', 400)
    }

    const body = (await request.json()) as Record<string, unknown>
    const accountStatus = body.account_status ? String(body.account_status) : undefined

    if (accountStatus && !ACCOUNT_STATUSES.includes(accountStatus as AccountStatus)) {
      logApiWarning('demo_lead_patch_invalid_status', { id, accountStatus })
      return jsonError('Geçersiz durum.', 400)
    }

    let documentLimit: number | undefined
    if (body.document_limit !== undefined) {
      const parsed = Number.parseInt(String(body.document_limit), 10)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return jsonError('Geçersiz belge limiti.', 400)
      }
      documentLimit = parsed
    }

    const lead = await updateDemoLead(id, {
      account_status: accountStatus as AccountStatus | undefined,
      document_limit: documentLimit,
    })

    if (!lead) {
      return jsonError('Kayıt bulunamadı.', 404)
    }

    return jsonOk({ lead })
  } catch (error) {
    logApiError('demo_lead_patch_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
