export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { assignPackageToUser, getUserActivePackageCodes, listPackages } from '@/lib/db/packages'
import { createUser, listUsers } from '@/lib/db/users'
import { getUserSession } from '@/lib/user-auth'

export async function GET() {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Bu işlem için yönetici yetkisi gereklidir.', 403)
  }

  const [users, allPackages] = await Promise.all([listUsers(), listPackages()])

  // Her kullanıcı için aktif paketleri getir
  const usersWithPackages = await Promise.all(
    users.map(async (u) => {
      const activePackageCodes = await getUserActivePackageCodes(u.id)
      return {
        ...u,
        packages: activePackageCodes,
      }
    }),
  )

  return jsonOk({
    users: usersWithPackages,
    packages: allPackages,
  })
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'admin') {
    return jsonError('Bu işlem için yönetici yetkisi gereklidir.', 403)
  }

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      full_name?: string
      role?: 'admin' | 'user'
      packages?: string[]
    }

    if (!body.email || !body.password || !body.full_name) {
      return jsonError('E-posta, şifre ve ad soyad alanları zorunludur.', 400)
    }

    const created = await createUser({
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      role: body.role ?? 'user',
    })

    // Paketler tanımlanmışsa ata
    if (Array.isArray(body.packages) && body.packages.length > 0) {
      for (const pkg of body.packages) {
        await assignPackageToUser(created.id, pkg)
      }
    }

    const userPackages = await getUserActivePackageCodes(created.id)

    return jsonOk({
      user: {
        ...created,
        packages: userPackages,
      },
    })
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata meydana geldi.',
      400,
    )
  }
}
