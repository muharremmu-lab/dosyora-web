import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { rejectDesktopLicense } from '@/lib/licensing/desktop-requests'

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
    const result = await rejectDesktopLicense(id)
    if (!result.ok) {
      return jsonError(result.error, result.status)
    }

    return jsonOk({ id, status: 'REJECTED' })
  } catch (error) {
    logDbRouteError('admin_desktop_license_reject_failed', error, { operation: 'rejectDesktopLicense', id })
    return jsonError('Lisans talebi reddedilemedi.', 500)
  }
}
