export const runtime = 'nodejs'

// import { db } from '@/lib/db/client'

export async function GET() {
  // await db.execute('SELECT 1')
  return Response.json({
    urlPrefix: process.env.TURSO_DATABASE_URL?.slice(0, 20),
    urlSuffix: process.env.TURSO_DATABASE_URL?.slice(-20),
    tokenPrefix: process.env.TURSO_AUTH_TOKEN?.slice(0, 12),
    tokenSuffix: process.env.TURSO_AUTH_TOKEN?.slice(-12),
  })
}
