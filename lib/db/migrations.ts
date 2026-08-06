import type { Client, ResultSet } from '@libsql/client'

import { logApiInfo } from '@/lib/api-logger'

import { executeWithClient, type SqlArgs } from './execute'
import { logDbInitError, logDbInitStart, logDbInitSuccess } from './libsql-log'

const REQUIRED_TABLES = ['demo_leads', 'contact_messages', 'ip_demo_quota'] as const
const ALLOWED_MIGRATION_TABLES = new Set<string>([...REQUIRED_TABLES])

const DEMO_LEADS_COLUMNS = ['document_limit', 'account_status', 'used_documents'] as const

const SQLITE_MASTER_TABLES_SQL = "SELECT name FROM sqlite_master WHERE type='table'"

function assertKnownTable(table: string) {
  if (!ALLOWED_MIGRATION_TABLES.has(table)) {
    throw new Error(`Unknown migration table: ${table}`)
  }
}

async function logExistingTables(client: Client, operation: string): Promise<string[]> {
  const result = await executeWithClient(client, operation, SQLITE_MASTER_TABLES_SQL)
  const tables = result.rows.map((row) => String(row.name))

  logApiInfo('migration_sqlite_master', {
    event: 'migration_sqlite_master',
    operation,
    sql: SQLITE_MASTER_TABLES_SQL,
    tables,
  })

  return tables
}

async function tableExists(client: Client, table: string): Promise<boolean> {
  const result = await executeWithClient(
    client,
    `migration.tableExists.${table}`,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    [table],
  )

  return result.rows.length > 0
}

async function columnExists(client: Client, table: string, column: string): Promise<boolean> {
  assertKnownTable(table)

  const result = await executeWithClient(
    client,
    `migration.columnExists.${table}.${column}`,
    `SELECT name FROM pragma_table_info('${table}') WHERE name = ?`,
    [column],
  )

  return result.rows.length > 0
}

async function runStatement(client: Client, operation: string, sql: string) {
  const trimmedSql = sql.trim()

  if (operation.startsWith('migration.create.')) {
    logApiInfo('migration_create_table_sql', {
      event: 'migration_create_table_sql',
      operation,
      sql: trimmedSql,
    })
  }

  await executeWithClient(client, operation, trimmedSql)
}

async function addColumnIfMissing(
  client: Client,
  table: string,
  column: string,
  definition: string,
) {
  assertKnownTable(table)

  if (!(await columnExists(client, table, column))) {
    await executeWithClient(
      client,
      `migration.addColumn.${table}.${column}`,
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    )
  }
}

export async function runMigrations(client: Client) {
  logDbInitStart({ phase: 'migrations' })

  let preflightTables: string[] = []

  const statements: Array<{ operation: string; sql: string }> = [
    {
      operation: 'migration.create.demo_leads',
      sql: `CREATE TABLE IF NOT EXISTS demo_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  employee_count TEXT,
  monthly_document_count TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  assigned_to TEXT,
  notes TEXT,
  source TEXT,
  ip_address TEXT,
  user_agent TEXT
)`,
    },
    {
      operation: 'migration.create.contact_messages',
      sql: `CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT
)`,
    },
    {
      operation: 'migration.create.ip_demo_quota',
      sql: `CREATE TABLE IF NOT EXISTS ip_demo_quota (
  ip_address TEXT PRIMARY KEY,
  demo_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TEXT NOT NULL,
  window_expires_at TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.index.demo_leads_status',
      sql: `CREATE INDEX IF NOT EXISTS idx_demo_leads_status ON demo_leads(status)`,
    },
    {
      operation: 'migration.index.demo_leads_created_at',
      sql: `CREATE INDEX IF NOT EXISTS idx_demo_leads_created_at ON demo_leads(created_at)`,
    },
    {
      operation: 'migration.index.demo_leads_email',
      sql: `CREATE INDEX IF NOT EXISTS idx_demo_leads_email ON demo_leads(email)`,
    },
    {
      operation: 'migration.index.contact_messages_status',
      sql: `CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status)`,
    },
    {
      operation: 'migration.index.contact_messages_created_at',
      sql: `CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at)`,
    },
  ]

  try {
    preflightTables = await logExistingTables(client, 'migration.preflight.sqlite_master')

    for (const statement of statements) {
      await runStatement(client, statement.operation, statement.sql)
    }

    await addColumnIfMissing(client, 'demo_leads', 'document_limit', 'INTEGER')
    await addColumnIfMissing(client, 'demo_leads', 'account_status', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'used_documents', 'INTEGER NOT NULL DEFAULT 0')

    await runStatement(
      client,
      'migration.index.demo_leads_account_status',
      `CREATE INDEX IF NOT EXISTS idx_demo_leads_account_status ON demo_leads(account_status)`,
    )

    await verifySchema(client)
    logDbInitSuccess({ phase: 'migrations' })
  } catch (error) {
    let failureTables = preflightTables

    try {
      failureTables = await logExistingTables(client, 'migration.failure.sqlite_master')
    } catch {
      // Keep preflight snapshot if sqlite_master cannot be queried after failure.
    }

    logDbInitError('runMigrations', error, {
      phase: 'migrations',
      sqliteMasterTables: failureTables,
      incompatibilityNote:
        'Turso/libSQL rejects DEFAULT (datetime(\'now\')) in CREATE TABLE; use DEFAULT CURRENT_TIMESTAMP for timestamp columns.',
    })
    throw error
  }
}

export async function verifySchema(client: Client) {
  const missingTables: string[] = []

  for (const table of REQUIRED_TABLES) {
    if (!(await tableExists(client, table))) {
      missingTables.push(table)
    }
  }

  if (missingTables.length > 0) {
    logApiInfo('db_schema_missing_tables', {
      event: 'db_schema_missing_tables',
      operation: 'verifySchema',
      sql: null,
      args: null,
      missingTables,
    })
    throw new Error(`Missing database tables: ${missingTables.join(', ')}`)
  }

  const missingColumns: string[] = []

  for (const column of DEMO_LEADS_COLUMNS) {
    if (!(await columnExists(client, 'demo_leads', column))) {
      missingColumns.push(`demo_leads.${column}`)
    }
  }

  if (missingColumns.length > 0) {
    logApiInfo('db_schema_missing_columns', {
      event: 'db_schema_missing_columns',
      operation: 'verifySchema',
      sql: null,
      args: null,
      missingColumns,
    })
    throw new Error(`Missing database columns: ${missingColumns.join(', ')}`)
  }

  logApiInfo('db_schema_verified', {
    event: 'db_schema_verified',
    operation: 'verifySchema',
    tables: REQUIRED_TABLES,
    demoLeadColumns: DEMO_LEADS_COLUMNS,
  })
}

export async function verifySchemaWithLogging(client: Client) {
  await verifySchema(client)
}

export type { SqlArgs, ResultSet }
