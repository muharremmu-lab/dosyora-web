import type { Client, InArgs, ResultSet } from '@libsql/client'

import {
  buildExecuteDiagnostic,
  logDbExecuteDiagnostic,
  logDbExecuteStart,
} from './libsql-log'

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
  const startedAt = Date.now()

  logDbExecuteStart(operation, trimmedSql, normalizedArgs)

  try {
    const result = await client.execute({ sql: trimmedSql, args: normalizedArgs })
    logDbExecuteDiagnostic(
      buildExecuteDiagnostic(operation, trimmedSql, normalizedArgs, Date.now() - startedAt, result),
    )
    return result
  } catch (error) {
    logDbExecuteDiagnostic(
      buildExecuteDiagnostic(
        operation,
        trimmedSql,
        normalizedArgs,
        Date.now() - startedAt,
        undefined,
        error,
      ),
    )
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
  const startedAt = Date.now()

  logDbExecuteStart(
    operation,
    `[batch:${prepared.length}] ${prepared[0]?.sql ?? ''}`,
    prepared.map((statement) => ({ sql: statement.sql, args: statement.args })),
  )

  try {
    const results = await client.batch(prepared)
    logDbExecuteDiagnostic(
      buildExecuteDiagnostic(
        operation,
        `[batch:${prepared.length}] completed`,
        prepared,
        Date.now() - startedAt,
        results[0],
      ),
    )
    return results
  } catch (error) {
    prepared.forEach((statement, index) => {
      logDbExecuteDiagnostic(
        buildExecuteDiagnostic(
          `${operation}[${index}]`,
          statement.sql,
          statement.args ?? [],
          Date.now() - startedAt,
          undefined,
          error,
        ),
      )
    })
    throw error
  }
}
