export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import {
  createTebligatCompany,
  getTebligatCompanyByVkn,
  listTebligatCompanies,
} from '@/lib/db/tebligat-companies'
import { getUserSession } from '@/lib/user-auth'
import { hasPackageAccess } from '@/lib/packages-config'

export async function GET(request: NextRequest) {
  const session = await getUserSession()
  if (!session) {
    return jsonError('Oturum açmanız gerekmektedir.', 401)
  }

  // Sunucu tarafı paket kontrolü: Tebligat paketi veya admin olmalı
  if (!hasPackageAccess(session, 'tebligat')) {
    return jsonError('Tebligat paketine sahip değilsiniz.', 403)
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q') || undefined
  const status = searchParams.get('status') || undefined

  // Normal kullanıcılar sadece kendi firmalarını görür, admin hepsini görür
  const userId = session.role === 'admin' ? null : session.userId

  const companies = await listTebligatCompanies({
    userId,
    status,
    search,
  })

  return jsonOk({ companies })
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session) {
    return jsonError('Oturum açmanız gerekmektedir.', 401)
  }

  if (!hasPackageAccess(session, 'tebligat')) {
    return jsonError('Tebligat paketine sahip değilsiniz.', 403)
  }

  try {
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

    if (!body.company_name || !body.vkn) {
      return jsonError('Firma adı ve VKN alanları zorunludur.', 400)
    }

    const trimmedVkn = body.vkn.trim()
    if (!/^\d{10,11}$/.test(trimmedVkn)) {
      return jsonError('VKN / TCKN 10 veya 11 haneli sayı olmalıdır.', 400)
    }

    const userId = session.role === 'admin' ? null : session.userId

    // VKN mükerrerlik kontrolü
    const existing = await getTebligatCompanyByVkn(trimmedVkn, userId)
    if (existing) {
      return jsonError('Bu VKN / TCKN numarasına sahip bir firma zaten kayıtlı.', 409)
    }

    const created = await createTebligatCompany({
      user_id: userId,
      company_name: body.company_name,
      vkn: trimmedVkn,
      authorized_person: body.authorized_person,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      query_time: body.query_time || '09:00',
      status: body.status || 'active',
    })

    return jsonOk({ company: created })
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Firma eklenirken bir hata oluştu.',
      500,
    )
  }
}
