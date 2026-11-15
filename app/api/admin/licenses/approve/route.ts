import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { approveDesktopLicense } from '@/lib/licensing/desktop-requests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const id = Number((body as { id?: unknown }).id)
  if (!Number.isInteger(id) || id <= 0) {
    return jsonError('Geçersiz talep numarası.', 400)
  }

  try {
    const result = await approveDesktopLicense(id)
    if (!result.ok) {
      return jsonError(result.error, result.status)
    }

    return jsonOk({
      id,
      status: 'APPROVED',
      hardwareId: result.hardwareId,
      licenseKey: result.licenseKey,
      expiresAt: result.expiresAt,
    })
  } catch (error) {
    logDbRouteError('admin_desktop_license_approve_failed', error, { operation: 'approveDesktopLicense', id })
    return jsonError('Lisans onaylanamadı.', 500)
  }
}
