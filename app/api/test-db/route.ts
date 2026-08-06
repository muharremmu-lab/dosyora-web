export const runtime = 'nodejs'

import { db } from '@/lib/db/client'

function maskUrl(url: string | undefined): string | null {
  if (!url) return null
  if (url.length <= 40) {
    return `${url.slice(0, 10)}...${url.slice(-10)}`
  }
  return `${url.slice(0, 20)}...${url.slice(-20)}`
}

function envDiagnostics() {
  return {
    url: maskUrl(process.env.TURSO_DATABASE_URL),
    urlLength: process.env.TURSO_DATABASE_URL?.length ?? null,
    tokenExists: Boolean(process.env.TURSO_AUTH_TOKEN),
    tokenLength: process.env.TURSO_AUTH_TOKEN?.length ?? null,
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
