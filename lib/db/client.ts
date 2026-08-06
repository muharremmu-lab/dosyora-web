import { createClient, type Client } from '@libsql/client/web'

import { runMigrations } from './migrations'
import { logDbInitError, logDbInitStart, logDbInitSuccess } from './libsql-log'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

let migrationPromise: Promise<void> | null = null

export function getDbClient(): Client {
  return db
}

export async function ensureDbReady(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      logDbInitStart({ phase: 'ensureDbReady' })
      try {
        await runMigrations(db)
        logDbInitSuccess({ phase: 'ensureDbReady' })
      } catch (error) {
        logDbInitError('ensureDbReady', error, { phase: 'ensureDbReady' })
        migrationPromise = null
        throw error
      }
    })()
  }

  await migrationPromise
}
