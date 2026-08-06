import type { Client, InArgs, ResultSet } from '@libsql/client'

import { ensureDbReady, getDbClient } from './client'
import {
  logDbExecuteStart,
  logDbExecuteSuccess,
  logLibsqlError,
} from './libsql-log'

type SqlArgs = InArgs | undefined

async function getClient(): Promise<Client> {
  await ensureDbReady()
  return getDbClient()
}

function normalizeArgs(args?: SqlArgs): SqlArgs {
  if (args === undefined) return []
  if (Array.isArray(args)) {
    return args.map((value) => (value === undefined ? null : value))
  }

  return Object.fromEntries(
    Object.entries(args).map(([key, value]) => [key, value === undefined ? null : value]),
  )
}

export async function dbExecute(
  operation: string,
  sql: string,
  args?: SqlArgs,
): Promise<ResultSet> {
  const client = await getClient()
  const trimmedSql = sql.trim()
  const normalizedArgs = normalizeArgs(args)

  logDbExecuteStart(operation, trimmedSql, normalizedArgs)

  try {
    const result = await client.execute({ sql: trimmedSql, args: normalizedArgs })
    logDbExecuteSuccess(operation, trimmedSql)
    return result
  } catch (error) {
    logLibsqlError(operation, trimmedSql, normalizedArgs, error)
    throw error
  }
}

export async function dbBatch(
  operation: string,
  statements: Array<{ sql: string; args?: SqlArgs }>,
): Promise<ResultSet[]> {
  const client = await getClient()

  logApiInfoBatchStart(operation, statements)

  try {
    const results = await client.batch(
      statements.map((statement) => ({
        sql: statement.sql.trim(),
        args: normalizeArgs(statement.args),
      })),
    )
    logApiInfoBatchSuccess(operation, statements.length)
    return results
  } catch (error) {
    logApiInfoBatchError(operation, statements, error)
    throw error
  }
}

function logApiInfoBatchStart(
  operation: string,
  statements: Array<{ sql: string; args?: SqlArgs }>,
) {
  logDbExecuteStart(operation, `[batch:${statements.length}] ${statements[0]?.sql ?? ''}`, statements)
}

function logApiInfoBatchSuccess(operation: string, count: number) {
  logDbExecuteSuccess(operation, `[batch:${count}] completed`)
}

function logApiInfoBatchError(
  operation: string,
  statements: Array<{ sql: string; args?: SqlArgs }>,
  error: unknown,
) {
  statements.forEach((statement, index) => {
    logLibsqlError(`${operation}[${index}]`, statement.sql, statement.args, error)
  })
}

export async function dbQueryOne<T>(
  operation: string,
  sql: string,
  args?: SqlArgs,
): Promise<T | null> {
  const result = await dbExecute(operation, sql, args)
  const row = result.rows[0]
  return row ? (row as unknown as T) : null
}

export async function dbQueryAll<T>(
  operation: string,
  sql: string,
  args?: SqlArgs,
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
