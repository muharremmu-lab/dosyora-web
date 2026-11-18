export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import {
  assignPackageToUser,
  getUserActivePackageCodes,
  getUserPackages,
  revokePackageFromUser,
} from '@/lib/db/packages'
import { getUserById } from '@/lib/db/users'
import { getUserSession } from '@/lib/user-auth'

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Yetkisiz erişim.', 403)
  }

  const { id } = await params
  const user = await getUserById(id)
  if (!user) {
    return jsonError('Kullanıcı bulunamadı.', 404)
  }

  const packages = await getUserPackages(id)
  return jsonOk({ packages })
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Yetkisiz erişim.', 403)
  }

  const { id } = await params
  const user = await getUserById(id)
  if (!user) {
    return jsonError('Kullanıcı bulunamadı.', 404)
  }

  const body = (await request.json()) as {
    package_code?: string
    end_date?: string | null
  }

  if (!body.package_code) {
    return jsonError('Paket kodu zorunludur.', 400)
  }

  const assigned = await assignPackageToUser(id, body.package_code, body.end_date)
  const activeCodes = await getUserActivePackageCodes(id)

  return jsonOk({
    assigned,
    activePackages: activeCodes,
  })
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Yetkisiz erişim.', 403)
  }

  const { id } = await params
  const body = (await request.json()) as { package_code?: string }

  if (!body.package_code) {
    return jsonError('Paket kodu zorunludur.', 400)
  }

  await revokePackageFromUser(id, body.package_code)
  const activeCodes = await getUserActivePackageCodes(id)

  return jsonOk({
    success: true,
    activePackages: activeCodes,
  })
}
