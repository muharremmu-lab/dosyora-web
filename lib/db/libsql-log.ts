import { LibsqlError } from '@libsql/client'

import { logApiError, logApiInfo } from '@/lib/api-logger'

type SqlLogArgs = unknown[] | Record<string, unknown> | undefined

function serializeArgs(args: SqlLogArgs): unknown {
  if (args === undefined) return []
  if (Array.isArray(args)) return args
  return args
}

function extractHttpStatus(error: unknown): number | null {
  if (!(error instanceof LibsqlError)) return null

  const match = error.message.match(/HTTP status (\d+)/i)
  if (match) return Number(match[1])

  return typeof error.rawCode === 'number' ? error.rawCode : null
}

function buildLibsqlErrorPayload(error: unknown) {
  if (!(error instanceof LibsqlError)) {
    return {
      libsqlCode: null,
      httpStatus: null,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
    }
  }

  return {
    libsqlCode: error.code,
    httpStatus: extractHttpStatus(error),
    message: error.message,
    stack: error.stack ?? null,
    rawCode: error.rawCode ?? null,
  }
}

export function logDbExecuteStart(operation: string, sql: string, args?: SqlLogArgs) {
  logApiInfo('db_execute_start', {
    event: 'db_execute_start',
    operation,
    sql: sql.trim(),
    args: serializeArgs(args),
  })
}

export function logDbExecuteSuccess(operation: string, sql: string) {
  logApiInfo('db_execute_success', {
    event: 'db_execute_success',
    operation,
    sql: sql.trim(),
  })
}

export function logLibsqlError(operation: string, sql: string, args: SqlLogArgs, error: unknown) {
  const libsql = buildLibsqlErrorPayload(error)

  logApiError(
    'db_libsql_error',
    {
      event: 'db_libsql_error',
      operation,
      sql: sql.trim(),
      args: serializeArgs(args),
      libsqlCode: libsql.libsqlCode,
      httpStatus: libsql.httpStatus,
      message: libsql.message,
      stack: libsql.stack,
      rawCode: 'rawCode' in libsql ? libsql.rawCode : null,
    },
    error,
  )
}

export function logDbInitStart(context: Record<string, unknown>) {
  logApiInfo('db_init_start', {
    event: 'db_init_start',
    ...context,
  })
}

export function logDbInitSuccess(context: Record<string, unknown>) {
  logApiInfo('db_init_success', {
    event: 'db_init_success',
    ...context,
  })
}

export function logDbInitError(operation: string, error: unknown, context: Record<string, unknown> = {}) {
  const libsql = buildLibsqlErrorPayload(error)

  logApiError(
    'db_init_error',
    {
      event: 'db_init_error',
      operation,
      sql: null,
      args: null,
      libsqlCode: libsql.libsqlCode,
      httpStatus: libsql.httpStatus,
      message: libsql.message,
      stack: libsql.stack,
      ...context,
    },
    error,
  )
}

export function logDbRouteError(event: string, error: unknown, context: Record<string, unknown> = {}) {
  const libsql = buildLibsqlErrorPayload(error)

  logApiError(
    event,
    {
      event,
      operation: context.operation ?? null,
      sql: context.sql ?? null,
      args: context.args ?? null,
      libsqlCode: libsql.libsqlCode,
      httpStatus: libsql.httpStatus,
      message: libsql.message,
      stack: libsql.stack,
      ...context,
    },
    error,
  )
}

export function isLibsqlError(error: unknown): error is LibsqlError {
  return error instanceof LibsqlError
}
