export const runtime = 'nodejs'

import { createClient } from '@libsql/client/web'

export async function GET() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  const result = await db.execute('SELECT 1')
  return Response.json({ ok: true, rows: result.rows, columns: result.columns })
}
