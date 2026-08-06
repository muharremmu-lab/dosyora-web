import { LibsqlError } from '@libsql/client'

import { logApiError, logApiInfo } from '@/lib/api-logger'

type SqlLogArgs = unknown[] | Record<string, unknown> | undefined

function serializeArgs(args: SqlLogArgs): unknown {
  if (args === undefined) return []
  if (Array.isArray(args)) return args
  return args
}

export function logDbExecuteStart(operation: string, sql: string, args?: SqlLogArgs) {
  logApiInfo('db_execute_start', {
    operation,
    sql: sql.trim(),
    args: serializeArgs(args),
  })
}

export function logDbExecuteSuccess(operation: string, sql: string) {
  logApiInfo('db_execute_success', {
    operation,
    sql: sql.trim(),
  })
}

export function logLibsqlError(operation: string, sql: string, args: SqlLogArgs, error: unknown) {
  const libsql =
    error instanceof LibsqlError
      ? {
          code: error.code,
          message: error.message,
          rawCode: error.rawCode,
          stack: error.stack,
        }
      : null

  logApiError(
    'db_libsql_error',
    {
      operation,
      sql: sql.trim(),
      args: serializeArgs(args),
      libsql,
    },
    error,
  )
}

export function isLibsqlError(error: unknown): error is LibsqlError {
  return error instanceof LibsqlError
}
