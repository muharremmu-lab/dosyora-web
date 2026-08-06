import type { Client, InArgs, ResultSet } from '@libsql/client'

import { ensureDbReady, getDbClient } from './client'

type SqlArgs = InArgs | undefined

async function getClient(): Promise<Client> {
  await ensureDbReady()
  return getDbClient()
}

export async function dbExecute(sql: string, args?: SqlArgs): Promise<ResultSet> {
  const client = await getClient()
  return client.execute({ sql, args })
}

export async function dbQueryOne<T>(sql: string, args?: SqlArgs): Promise<T | null> {
  const result = await dbExecute(sql, args)
  const row = result.rows[0]
  return row ? (row as unknown as T) : null
}

export async function dbQueryAll<T>(sql: string, args?: SqlArgs): Promise<T[]> {
  const result = await dbExecute(sql, args)
  return result.rows as unknown as T[]
}

export async function dbRun(sql: string, args?: SqlArgs): Promise<ResultSet> {
  return dbExecute(sql, args)
}

export async function dbInsert(sql: string, args?: SqlArgs): Promise<number> {
  const result = await dbRun(sql, args)
  return Number(result.lastInsertRowid ?? 0)
}
