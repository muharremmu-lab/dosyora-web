export const runtime = 'nodejs'

import { createClient } from '@libsql/client/web'

import { isProductionRuntime } from '@/lib/security/production-env'

export async function GET() {
  if (isProductionRuntime()) {
    return new Response(null, { status: 404 })
  }

  const databaseUrl = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl || !authToken) {
    return Response.json({ ok: false, error: 'missing_local_db_env' }, { status: 503 })
  }

  const db = createClient({
    url: databaseUrl.startsWith('libsql://')
      ? databaseUrl.replace('libsql://', 'https://')
      : databaseUrl,
    authToken,
  })

  await db.execute('SELECT 1')
  return Response.json({ ok: true })
}
