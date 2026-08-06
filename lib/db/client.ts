import fs from 'node:fs'
import path from 'node:path'

import { createClient, type Client } from '@libsql/client'

import { runMigrations } from './migrations'
import { logDbInitError, logDbInitStart, logDbInitSuccess } from './libsql-log'

let client: Client | null = null
let migrationPromise: Promise<void> | null = null

const REMOTE_DATABASE_URL_PATTERN = /^(libsql:|https?:)/

function maskDatabaseUrl(url: string): string {
  if (url.startsWith('file:')) return url

  try {
    const parsed = new URL(url.replace(/^libsql:/, 'https:'))
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`
  } catch {
    return '[invalid-url]'
  }
}

function validateDatabaseUrl(url: string): void {
  if (!url) {
    throw new Error('Database URL is empty.')
  }

  if (!REMOTE_DATABASE_URL_PATTERN.test(url) && !url.startsWith('file:')) {
    throw new Error(
      'Database URL must use libsql://, https://, http://, or file: scheme.',
    )
  }
}

function getDatabaseUrl(): string {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  if (tursoUrl) {
    validateDatabaseUrl(tursoUrl)
    return tursoUrl
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
  const fileUrl = `file:${dbPath.replace(/\\/g, '/')}`
  validateDatabaseUrl(fileUrl)
  return fileUrl
}

function getAuthToken(url: string): string | undefined {
  if (url.startsWith('file:')) {
    return undefined
  }

  const token = process.env.TURSO_AUTH_TOKEN
  if (!token) {
    throw new Error('TURSO_AUTH_TOKEN is required for remote libSQL databases.')
  }

  return token
}

export function getDbClient(): Client {
  if (!client) {
    const url = getDatabaseUrl()

    logDbInitStart({
      phase: 'createClient',
      databaseUrl: maskDatabaseUrl(url),
      remote: !url.startsWith('file:'),
    })

    try {
      client = createClient({
        url,
        authToken: getAuthToken(url),
      })
      logDbInitSuccess({ phase: 'createClient', databaseUrl: maskDatabaseUrl(url) })
    } catch (error) {
      logDbInitError('createClient', error, {
        phase: 'createClient',
        databaseUrl: maskDatabaseUrl(url),
      })
      throw error
    }
  }

  return client
}

export async function ensureDbReady(): Promise<void> {
  console.log('PRELIGHT_ENTER')
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
