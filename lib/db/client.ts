import fs from 'node:fs'
import path from 'node:path'

import { createClient, type Client } from '@libsql/client'

import { runMigrations } from './migrations'

let client: Client | null = null
let migrationPromise: Promise<void> | null = null

function getDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL
  }

  if (process.env.VERCEL === '1') {
    throw new Error(
      'TURSO_DATABASE_URL is required on Vercel. Configure Turso (libSQL) for production persistence.',
    )
  }

  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, 'dosyora.db')
  return `file:${dbPath.replace(/\\/g, '/')}`
}

export function getDbClient(): Client {
  if (!client) {
    client = createClient({
      url: getDatabaseUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }

  return client
}

export async function ensureDbReady(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigrations(getDbClient())
  }

  await migrationPromise
}
