export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import {
  deleteTebligatCompany,
  getTebligatCompanyById,
  updateTebligatCompany,
} from '@/lib/db/tebligat-companies'
import { getUserSession } from '@/lib/user-auth'
import { hasPackageAccess } from '@/lib/packages-config'

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session) {
    return jsonError('Oturum açmanız gerekmektedir.', 401)
  }

  if (!hasPackageAccess(session, 'tebligat')) {
    return jsonError('Tebligat paketine sahip değilsiniz.', 403)
  }

  const { id } = await params
  const company = await getTebligatCompanyById(id)
  if (!company) {
    return jsonError('Firma bulunamadı.', 404)
  }

  if (session.role !== 'admin' && company.user_id && company.user_id !== session.userId) {
    return jsonError('Bu firmayı görüntüleme yetkiniz yok.', 403)
  }

  return jsonOk({ company })
}

export async function PUT(request: NextRequest, { params }: Props) {
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
    return jsonError('Bu firmayı güncelleme yetkiniz yok.', 403)
  }

  const body = (await request.json()) as {
    company_name?: string
    vkn?: string
    authorized_person?: string
    phone?: string
    whatsapp?: string
    email?: string
    query_time?: string
    status?: 'active' | 'inactive' | 'error'
  }

  const updated = await updateTebligatCompany(id, body)
  return jsonOk({ company: updated })
}

export async function DELETE(_request: NextRequest, { params }: Props) {
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
    return jsonError('Bu firmayı silme yetkiniz yok.', 403)
  }

  await deleteTebligatCompany(id)
  return jsonOk({ success: true })
}
