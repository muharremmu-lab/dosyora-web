export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { approveLicenseOrder, displayStatus, revokeLicenseOrder } from '@/lib/licensing/orders'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) return authError

  const { id: rawId } = await context.params
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) {
    return jsonError('Başvuru bulunamadı.', 404)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const action = body && typeof body === 'object' ? (body as { action?: unknown }).action : null
  if (action !== 'approve' && action !== 'revoke') {
    return jsonError('İşlem geçersiz.', 400)
  }

  try {
    const order = action === 'approve' ? await approveLicenseOrder(id) : await revokeLicenseOrder(id)
    if (!order) return jsonError('Başvuru bulunamadı.', 404)
    return jsonOk({ ...order, displayStatus: displayStatus(order) })
  } catch (error) {
    logDbRouteError('gibtebligat_license_order_action_failed', error, { operation: action })
    return jsonError('İşlem kaydedilemedi.', 500)
  }
}
