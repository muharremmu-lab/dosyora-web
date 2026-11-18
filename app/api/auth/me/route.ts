export const runtime = 'nodejs'

import { jsonError, jsonOk } from '@/lib/api-response'
import { getUserSession } from '@/lib/user-auth'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return jsonError('Oturum bulunamadı.', 401)
  }

  return jsonOk({
    user: {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      packages: session.packages,
    },
  })
}
