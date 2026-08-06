export const runtime = 'nodejs'

import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'
import { jsonOk } from '@/lib/api-response'

export async function POST() {
  const response = jsonOk({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
