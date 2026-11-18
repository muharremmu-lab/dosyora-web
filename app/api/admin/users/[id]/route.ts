export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { getUserActivePackageCodes } from '@/lib/db/packages'
import { deleteUser, getUserById, toSafeUser, updateUser, updateUserPassword } from '@/lib/db/users'
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

  const packages = await getUserActivePackageCodes(id)
  return jsonOk({
    user: {
      ...toSafeUser(user),
      packages,
    },
  })
}

export async function PUT(request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Yetkisiz erişim.', 403)
  }

  const { id } = await params
  const body = (await request.json()) as {
    full_name?: string
    role?: 'admin' | 'user'
    status?: 'active' | 'inactive' | 'suspended'
    password?: string
  }

  if (body.password) {
    await updateUserPassword(id, body.password)
  }

  const updated = await updateUser(id, {
    full_name: body.full_name,
    role: body.role,
    status: body.status,
  })

  if (!updated) {
    return jsonError('Kullanıcı güncellenemedi.', 404)
  }

  const packages = await getUserActivePackageCodes(id)
  return jsonOk({
    user: {
      ...updated,
      packages,
    },
  })
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Yetkisiz erişim.', 403)
  }

  const { id } = await params
  const success = await deleteUser(id)
  if (!success) {
    return jsonError('Kullanıcı silinemedi.', 404)
  }

  return jsonOk({ success: true })
}
