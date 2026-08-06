import type { InArgs, ResultSet } from '@libsql/client'

import { ensureDbReady, getDbClient } from './client'
import { batchWithClient, executeWithClient, type SqlArgs } from './execute'

async function getClient() {
  await ensureDbReady()
  return getDbClient()
}

export async function dbExecute(
  operation: string,
  sql: string,
  args?: SqlArgs,
): Promise<ResultSet> {
  return executeWithClient(await getClient(), operation, sql, args)
}

export async function dbBatch(
  operation: string,
  statements: Array<{ sql: string; args?: SqlArgs }>,
): Promise<ResultSet[]> {
  return batchWithClient(await getClient(), operation, statements)
}

export async function dbQueryOne<T>(
  operation: string,
  sql: string,
  args?: InArgs,
): Promise<T | null> {
  const result = await dbExecute(operation, sql, args)
  const row = result.rows[0]
  return row ? (row as unknown as T) : null
}

export async function dbQueryAll<T>(
  operation: string,
  sql: string,
  args?: InArgs,
): Promise<T[]> {
  const result = await dbExecute(operation, sql, args)
  return result.rows as unknown as T[]
}

export async function dbRun(operation: string, sql: string, args?: SqlArgs): Promise<ResultSet> {
  return dbExecute(operation, sql, args)
}

export async function dbInsertReturningId(
  operation: string,
  sql: string,
  args?: SqlArgs,
): Promise<number> {
  const result = await dbRun(operation, sql, args)
  const row = result.rows[0] as { id?: number | bigint } | undefined

  if (row?.id !== undefined) {
    return Number(row.id)
  }

  return Number(result.lastInsertRowid ?? 0)
}
