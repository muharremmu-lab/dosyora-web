import type { Client } from '@libsql/client'

import { logApiError, logApiInfo } from '@/lib/api-logger'

const REQUIRED_TABLES = ['demo_leads', 'contact_messages', 'ip_demo_quota'] as const

const DEMO_LEADS_COLUMNS = [
  'document_limit',
  'account_status',
  'used_documents',
] as const

async function tableExists(client: Client, table: string): Promise<boolean> {
  const result = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [table],
  })

  return result.rows.length > 0
}

async function columnExists(client: Client, table: string, column: string): Promise<boolean> {
  const result = await client.execute({
    sql: `PRAGMA table_info(${table})`,
  })

  return result.rows.some((row) => String(row.name) === column)
}

async function addColumnIfMissing(
  client: Client,
  table: string,
  column: string,
  definition: string,
) {
  if (!(await columnExists(client, table, column))) {
    await client.execute({
      sql: `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    })
  }
}

async function runStatement(client: Client, sql: string) {
  await client.execute({ sql: sql.trim() })
}

export async function runMigrations(client: Client) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS demo_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
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
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
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
    `CREATE TABLE IF NOT EXISTS ip_demo_quota (
      ip_address TEXT PRIMARY KEY,
      demo_count INTEGER NOT NULL DEFAULT 0,
      window_started_at TEXT NOT NULL,
      window_expires_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_demo_leads_status ON demo_leads(status)`,
    `CREATE INDEX IF NOT EXISTS idx_demo_leads_created_at ON demo_leads(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_demo_leads_email ON demo_leads(email)`,
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status)`,
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at)`,
  ]

  for (const statement of statements) {
    await runStatement(client, statement)
  }

  await addColumnIfMissing(client, 'demo_leads', 'document_limit', 'INTEGER')
  await addColumnIfMissing(client, 'demo_leads', 'account_status', 'TEXT')
  await addColumnIfMissing(client, 'demo_leads', 'used_documents', 'INTEGER NOT NULL DEFAULT 0')

  await runStatement(
    client,
    `CREATE INDEX IF NOT EXISTS idx_demo_leads_account_status ON demo_leads(account_status)`,
  )

  await verifySchema(client)
}

export async function verifySchema(client: Client) {
  const missingTables: string[] = []

  for (const table of REQUIRED_TABLES) {
    if (!(await tableExists(client, table))) {
      missingTables.push(table)
    }
  }

  if (missingTables.length > 0) {
    logApiError('db_schema_missing_tables', { missingTables })
    throw new Error(`Missing database tables: ${missingTables.join(', ')}`)
  }

  const missingColumns: string[] = []

  for (const column of DEMO_LEADS_COLUMNS) {
    if (!(await columnExists(client, 'demo_leads', column))) {
      missingColumns.push(`demo_leads.${column}`)
    }
  }

  if (missingColumns.length > 0) {
    logApiError('db_schema_missing_columns', { missingColumns })
    throw new Error(`Missing database columns: ${missingColumns.join(', ')}`)
  }

  logApiInfo('db_schema_verified', {
    tables: REQUIRED_TABLES,
    demoLeadColumns: DEMO_LEADS_COLUMNS,
  })
}

export async function verifySchemaWithLogging() {
  const { getDbClient } = await import('./client')
  await verifySchema(getDbClient())
}
