export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import {
  getTebligatCompanyById,
  triggerTebligatQuery,
} from '@/lib/db/tebligat-companies'
import { getUserSession } from '@/lib/user-auth'
import { hasPackageAccess } from '@/lib/packages-config'

type Props = {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session) {
    return jsonError('Oturum açmanız gerekmektedir.', 401)
  }

  if (!hasPackageAccess(session, 'tebligat')) {
    return jsonError('Tebligat paketine sahip değilsiniz.', 403)
  }

  const { id } = await params
  const existing = await getTebligatCompanyById(id)
  if (!existing) {
    return jsonError('Firma bulunamadı.', 404)
  }

  if (session.role !== 'admin' && existing.user_id && existing.user_id !== session.userId) {
    return jsonError('Yetkisiz işlem.', 403)
  }

  const updated = await triggerTebligatQuery(id)
  return jsonOk({
    success: true,
    message: 'Tebligat sorgusu başarıyla tetiklendi.',
    company: updated,
  })
}
