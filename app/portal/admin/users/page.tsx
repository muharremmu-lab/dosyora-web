import { getUserActivePackageCodes } from '@/lib/db/packages'
import { listUsers } from '@/lib/db/users'
import { requireAdminSession } from '@/lib/user-auth'
import { AdminUsersPanel } from '@/components/portal/admin-users-panel'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  // Sunucu tarafı kontrol: Yalnızca admin rolü girebilir
  await requireAdminSession('/login')

  const users = await listUsers()
  const usersWithPackages = await Promise.all(
    users.map(async (u) => {
      const packages = await getUserActivePackageCodes(u.id)
      return {
        ...u,
        packages,
      }
    }),
  )

  return <AdminUsersPanel initialUsers={usersWithPackages} />
}
