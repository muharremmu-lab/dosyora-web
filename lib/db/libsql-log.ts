import type { ResultSet } from '@libsql/client'

import { logApiError, logApiInfo } from '@/lib/api-logger'

type SqlLogArgs = unknown[] | Record<string, unknown> | undefined

function serializeArgs(args: SqlLogArgs): unknown {
  if (args === undefined) return []
  if (Array.isArray(args)) return args
  return args
}

export type DbExecuteDiagnostic = {
  event: string
  operation: string
  sql: string
  args: SqlLogArgs
  durationMs: number
  httpStatus: number | null
  libsqlCode: string | null
  response: unknown | null
  error: unknown | null
}

function extractHttpStatus(error: unknown): number | null {
  if (!(error instanceof Error)) return null

  const match = error.message.match(/HTTP status (\d+)/i)
  if (match) return Number(match[1])

  const libsql = error as { rawCode?: number; code?: string }
  return typeof libsql.rawCode === 'number' ? libsql.rawCode : null
}

function extractLibsqlCode(error: unknown): string | null {
  if (!(error instanceof Error)) return null
  const libsql = error as { code?: string }
  return libsql.code ?? null
}

export function summarizeResultSet(result: ResultSet): unknown {
  return {
    columns: result.columns,
    rows: result.rows,
    rowsAffected: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null,
  }
}

export function buildExecuteDiagnostic(
  operation: string,
  sql: string,
  args: SqlLogArgs,
  durationMs: number,
  result?: ResultSet,
  error?: unknown,
): DbExecuteDiagnostic {
  return {
    event: error ? 'db_execute_failed' : 'db_execute_ok',
    operation,
    sql: sql.trim(),
    args,
    durationMs,
    httpStatus: error ? extractHttpStatus(error) : null,
    libsqlCode: error ? extractLibsqlCode(error) : null,
    response: result ? summarizeResultSet(result) : null,
    error: error
      ? {
          name: error instanceof Error ? error.name : 'Error',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null,
        }
      : null,
  }
}

export function logDbExecuteDiagnostic(diagnostic: DbExecuteDiagnostic) {
  const payload = {
    event: diagnostic.event,
    operation: diagnostic.operation,
    sql: diagnostic.sql,
    args: serializeArgs(diagnostic.args),
    duration: diagnostic.durationMs,
    httpStatus: diagnostic.httpStatus,
    libsqlCode: diagnostic.libsqlCode,
    response: diagnostic.response,
    error: diagnostic.error,
  }

  if (diagnostic.error) {
    logApiError(diagnostic.event, payload, diagnostic.error)
  } else {
    logApiInfo(diagnostic.event, payload)
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
  logDbExecuteDiagnostic(
    buildExecuteDiagnostic(operation, sql, args, 0, undefined, error),
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
  logApiError(
    'db_init_error',
    {
      event: 'db_init_error',
      operation,
      sql: context.sql ?? null,
      args: context.args ?? null,
      duration: context.duration ?? null,
      httpStatus: extractHttpStatus(error),
      libsqlCode: extractLibsqlCode(error),
      response: null,
      error: {
        name: error instanceof Error ? error.name : 'Error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      ...context,
    },
    error,
  )
}

export function logDbRouteError(event: string, error: unknown, context: Record<string, unknown> = {}) {
  logApiError(
    event,
    {
      event,
      operation: context.operation ?? null,
      sql: context.sql ?? null,
      args: context.args ?? null,
      duration: context.duration ?? null,
      httpStatus: extractHttpStatus(error),
      libsqlCode: extractLibsqlCode(error),
      response: null,
      error: {
        name: error instanceof Error ? error.name : 'Error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      ...context,
    },
    error,
  )
}

export function logPreflightRootCause(message: string, diagnostic: DbExecuteDiagnostic) {
  logApiError('db_preflight_root_cause', {
    event: 'db_preflight_root_cause',
    message,
    operation: diagnostic.operation,
    sql: diagnostic.sql,
    args: serializeArgs(diagnostic.args),
    duration: diagnostic.durationMs,
    httpStatus: diagnostic.httpStatus,
    libsqlCode: diagnostic.libsqlCode,
    response: diagnostic.response,
    error: diagnostic.error,
  })
}
