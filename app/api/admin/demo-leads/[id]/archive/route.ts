export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { logApiError } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { archiveDemoLead, getDemoLeadById } from '@/lib/db/demo-leads'

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseId(rawId: string): number | null {
  const id = Number.parseInt(rawId, 10)
  return Number.isFinite(id) && id > 0 ? id : null
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

    const body = (await request.json()) as { confirm?: boolean }
    if (body.confirm !== true) {
      return jsonError('Silme işlemi için onay zorunludur.', 400)
    }

    const existing = await getDemoLeadById(id)
    if (!existing) {
      return jsonError('Kayıt bulunamadı.', 404)
    }

    if (existing.account_type !== 'DEMO') {
      return jsonError('Yalnızca DEMO kayıtları arşivlenebilir.', 403)
    }

    const archived = await archiveDemoLead(id)
    return jsonOk({ lead: archived })
  } catch (error) {
    logApiError('demo_archive_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
