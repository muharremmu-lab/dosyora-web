import { createClient, type Client } from '@libsql/client/web'

import { runMigrations } from './migrations'
import { logDbInitError, logDbInitStart, logDbInitSuccess } from './libsql-log'

let client: Client | null = null

function createDbClient(): Client {
  const databaseUrl = process.env.TURSO_DATABASE_URL
  if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL tanımlı değil.')
  }

  const tursoUrl = databaseUrl.startsWith('libsql://')
    ? databaseUrl.replace('libsql://', 'https://')
    : databaseUrl

  return createClient({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}

export function getDbClient(): Client {
  client ??= createDbClient()
  return client
}

export const db: Client = new Proxy({} as Client, {
  get(_target, property) {
    const real = getDbClient()
    const value = real[property as keyof Client]
    return typeof value === 'function' ? value.bind(real) : value
  },
})

let migrationPromise: Promise<void> | null = null

export async function ensureDbReady(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      logDbInitStart({ phase: 'ensureDbReady' })
      try {
        await runMigrations(getDbClient())
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
