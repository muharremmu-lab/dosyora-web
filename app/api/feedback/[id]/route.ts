import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { updateSiteFeedbackStatus } from '@/lib/db/feedback'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { FEEDBACK_STATUSES, type FeedbackStatus } from '@/lib/db/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) return authError

  const { id: rawId } = await context.params
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) {
    return jsonError('Geçersiz kayıt.', 400)
  }

  let body: { status?: string }
  try {
    body = (await request.json()) as { status?: string }
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  if (!body.status || !FEEDBACK_STATUSES.includes(body.status as FeedbackStatus)) {
    return jsonError('Geçersiz durum.', 400)
  }

  try {
    const feedback = await updateSiteFeedbackStatus(id, body.status as FeedbackStatus)
    if (!feedback) return jsonError('Kayıt bulunamadı.', 404)
    return jsonOk({ feedback })
  } catch (error) {
    logDbRouteError('feedback_update_failed', error, { operation: 'updateSiteFeedbackStatus', id })
    return jsonError('Bildirim güncellenemedi.', 500)
  }
}
