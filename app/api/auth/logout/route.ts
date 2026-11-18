export const runtime = 'nodejs'

import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'
import { jsonOk } from '@/lib/api-response'
import { USER_SESSION_COOKIE } from '@/lib/user-auth'

export async function POST() {
  const response = jsonOk({ success: true })
  response.cookies.delete(USER_SESSION_COOKIE)
  response.cookies.delete(ADMIN_SESSION_COOKIE)
  return response
}
