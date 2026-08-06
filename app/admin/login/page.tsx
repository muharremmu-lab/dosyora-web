import { redirect } from 'next/navigation'

import { AdminLoginPage } from '@/components/admin/admin-login-page'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginRoute() {
  if (await isAdminAuthenticated()) {
    redirect('/admin')
  }

  return <AdminLoginPage />
}
