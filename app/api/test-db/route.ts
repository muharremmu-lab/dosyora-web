export const runtime = 'nodejs'

import { db } from '@/lib/db/client'

export async function GET() {
  try {
    await db.execute('SELECT 1')
    return Response.json({ ok: true }, { status: 200 })
  } catch (error) {
    const err = error as Error & { code?: string }
    return Response.json(
      {
        name: err.name,
        message: err.message,
        code: err.code ?? null,
        stack: err.stack ?? null,
      },
      { status: 500 },
    )
  }
}
