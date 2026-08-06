import type { Client, InArgs, ResultSet } from '@libsql/client'

import { logDbExecuteStart, logDbExecuteSuccess, logLibsqlError } from './libsql-log'

export type SqlArgs = InArgs | undefined

export function normalizeSqlArgs(args?: SqlArgs): SqlArgs {
  if (args === undefined) return []
  if (Array.isArray(args)) {
    return args.map((value) => (value === undefined ? null : value))
  }

  return Object.fromEntries(
    Object.entries(args).map(([key, value]) => [key, value === undefined ? null : value]),
  )
}

/**
 * Single libSQL execute entry point. All database reads/writes must flow through here.
 */
export async function executeWithClient(
  client: Client,
  operation: string,
  sql: string,
  args?: SqlArgs,
): Promise<ResultSet> {
  const trimmedSql = sql.trim()
  const normalizedArgs = normalizeSqlArgs(args)

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

/**
 * Single libSQL batch entry point. All batched statements must flow through here.
 */
export async function batchWithClient(
  client: Client,
  operation: string,
  statements: Array<{ sql: string; args?: SqlArgs }>,
): Promise<ResultSet[]> {
  const prepared = statements.map((statement) => ({
    sql: statement.sql.trim(),
    args: normalizeSqlArgs(statement.args),
  }))

  logDbExecuteStart(
    operation,
    `[batch:${prepared.length}] ${prepared[0]?.sql ?? ''}`,
    prepared.map((statement) => ({ sql: statement.sql, args: statement.args })),
  )

  try {
    const results = await client.batch(prepared)
    logDbExecuteSuccess(operation, `[batch:${prepared.length}] completed`)
    return results
  } catch (error) {
    prepared.forEach((statement, index) => {
      logLibsqlError(`${operation}[${index}]`, statement.sql, statement.args ?? [], error)
    })
    throw error
  }
}
