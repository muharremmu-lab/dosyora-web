import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { setDesktopLicenseDemo } from '@/lib/licensing/desktop-requests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) return authError

  let body: { id?: unknown; hardwareId?: unknown; hardware_id?: unknown }
  try {
    body = (await request.json()) as { id?: unknown; hardwareId?: unknown; hardware_id?: unknown }
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const id = body.id === undefined || body.id === null || body.id === '' ? undefined : Number(body.id)
  if (id !== undefined && (!Number.isInteger(id) || id <= 0)) {
    return jsonError('Geçersiz talep numarası.', 400)
  }

  const hardwareId = typeof body.hardwareId === 'string'
    ? body.hardwareId
    : typeof body.hardware_id === 'string'
      ? body.hardware_id
      : undefined

  if (id === undefined && !hardwareId) {
    return jsonError('Talep numarası veya donanım kimliği gerekli.', 400)
  }

  try {
    const result = await setDesktopLicenseDemo({ notificationId: id, hardwareId })
    if (!result.ok) {
      return jsonError(result.error, result.status)
    }

    return jsonOk({ hardwareId: result.hardwareId, status: result.status })
  } catch (error) {
    logDbRouteError('admin_desktop_license_set_demo_failed', error, { operation: 'setDesktopLicenseDemo', id })
    return jsonError('Lisans demo moda alınamadı.', 500)
  }
}
