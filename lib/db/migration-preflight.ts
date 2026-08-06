import type { Client } from '@libsql/client'

import { logApiError, logApiInfo } from '@/lib/api-logger'

import { executeWithClient } from './execute'
import { buildExecuteDiagnostic, logDbExecuteStart, logPreflightRootCause } from './libsql-log'

const PREFLIGHT_QUERIES = [
  { key: 'select1', operation: 'preflight.select1', sql: 'SELECT 1' },
  { key: 'sqlite_version', operation: 'preflight.sqlite_version', sql: 'SELECT sqlite_version()' },
  {
    key: 'current_timestamp',
    operation: 'preflight.current_timestamp',
    sql: 'SELECT CURRENT_TIMESTAMP',
  },
  {
    key: 'sqlite_master',
    operation: 'preflight.sqlite_master',
    sql: "SELECT name FROM sqlite_master WHERE type='table'",
  },
] as const

export async function runMigrationPreflight(client: Client): Promise<string[]> {
  logDbExecuteStart('preflight.begin', 'migration preflight sequence', [])

  const completed = new Set<string>()

  for (const query of PREFLIGHT_QUERIES) {
    try {
      const result = await executeWithClient(client, query.operation, query.sql)
      completed.add(query.key)

      if (query.key === 'sqlite_master') {
        const tables = result.rows.map((row) => String(row.name))
        logApiInfo('preflight.sqlite_master_ok', {
          event: 'preflight.sqlite_master_ok',
          operation: query.operation,
          sql: query.sql,
          args: [],
          tables,
        })
        return tables
      }
    } catch (error) {
      const diagnostic = buildExecuteDiagnostic(query.operation, query.sql, [], 0, undefined, error)

      if (
        completed.has('select1') &&
        completed.has('sqlite_version') &&
        completed.has('current_timestamp') &&
        query.key === 'sqlite_master'
      ) {
        logPreflightRootCause(
          'Root cause isolated: sqlite_master query rejected by Turso.',
          diagnostic,
        )
      }

      if (query.key === 'select1') {
        logApiError('preflight.select1_failed', {
          event: 'preflight.select1_failed',
          operation: query.operation,
          sql: query.sql,
          args: [],
          message: 'Migration aborted: SELECT 1 failed.',
        })
      }

      throw error
    }
  }

  return []
}
