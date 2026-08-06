export const runtime = 'nodejs'

import { db } from '@/lib/db/client'

function envDiagnostics() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  return {
    urlPrefix: url ? url.slice(0, 20) : null,
    urlSuffix: url ? url.slice(-20) : null,
    urlLength: url?.length ?? null,
    tokenPrefix: token ? token.slice(0, 12) : null,
    tokenSuffix: token ? token.slice(-12) : null,
    tokenLength: token?.length ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    runtime: process.version,
  }
}

export async function GET() {
  const env = envDiagnostics()

  try {
    await db.execute('SELECT 1')
    return Response.json({ ...env, ok: true }, { status: 200 })
  } catch (error) {
    const err = error as Error & { code?: string }
    return Response.json(
      {
        ...env,
        name: err.name,
        message: err.message,
        code: err.code ?? null,
        stack: err.stack ?? null,
      },
      { status: 500 },
    )
  }
}
