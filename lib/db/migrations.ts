import type { Client, ResultSet } from '@libsql/client'

import { logApiError, logApiInfo } from '@/lib/api-logger'

import { executeWithClient, type SqlArgs } from './execute'
import { logDbInitError, logDbInitStart, logDbInitSuccess } from './libsql-log'
import { runMigrationPreflight } from './migration-preflight'

const REQUIRED_TABLES = [
  'demo_leads',
  'contact_messages',
  'ip_demo_quota',
  'email_demo_quota',
  'document_consumption_events',
  'trial_claims',
  'telemetry_logs',
  'download_logs',
  'license_orders',
  'license_settings',
  'device_heartbeats',
  'admin_password_resets',
  'admin_password_overrides',
  'license_notifications',
] as const
const ALLOWED_MIGRATION_TABLES = new Set<string>([...REQUIRED_TABLES])

const DEMO_LEADS_COLUMNS = [
  'document_limit',
  'account_status',
  'used_documents',
  'account_type',
  'activation_status',
  'provision_status',
  'lifecycle_status',
  'customer_user_id',
  'customer_company_id',
  'activation_token_hash',
  'activation_expires_at',
  'activation_used_at',
  'provisioned_at',
] as const

function assertKnownTable(table: string) {
  if (!ALLOWED_MIGRATION_TABLES.has(table)) {
    throw new Error(`Unknown migration table: ${table}`)
  }
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

  try {
    await executeWithClient(client, operation, trimmedSql)
  } catch (error) {
    if (operation.startsWith('migration.create.')) {
      logApiError('migration_create_table_failed', {
        event: 'migration_create_table_failed',
        operation,
        sql: trimmedSql,
        args: [],
        error: {
          name: error instanceof Error ? error.name : 'Error',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null,
        },
      })
    }
    throw error
  }
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
      operation: 'migration.create.email_demo_quota',
      sql: `CREATE TABLE IF NOT EXISTS email_demo_quota (
  email TEXT PRIMARY KEY,
  demo_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TEXT NOT NULL,
  window_expires_at TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.create.trial_claims',
      sql: `CREATE TABLE IF NOT EXISTS trial_claims (
  vkn_hash TEXT PRIMARY KEY,
  first_hwid TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.create.telemetry_logs',
      sql: `CREATE TABLE IF NOT EXISTS telemetry_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  app_version TEXT NOT NULL,
  hwid_hash TEXT NOT NULL,
  error_code TEXT NOT NULL,
  step TEXT NOT NULL,
  detail TEXT NOT NULL,
  os_version TEXT,
  critical_alert INTEGER NOT NULL DEFAULT 0,
  alert_sent INTEGER NOT NULL DEFAULT 0
)`,
    },
    {
      operation: 'migration.create.download_logs',
      sql: `CREATE TABLE IF NOT EXISTS download_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  source TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.create.document_consumption_events',
      sql: `CREATE TABLE IF NOT EXISTS document_consumption_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  demo_lead_id INTEGER NOT NULL,
  document_ref TEXT NOT NULL UNIQUE,
  consumed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'CONSUMED'
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
    {
      operation: 'migration.index.telemetry_logs_error_created',
      sql: `CREATE INDEX IF NOT EXISTS idx_telemetry_logs_error_created ON telemetry_logs(error_code, created_at)`,
    },
    {
      operation: 'migration.index.telemetry_logs_created_at',
      sql: `CREATE INDEX IF NOT EXISTS idx_telemetry_logs_created_at ON telemetry_logs(created_at)`,
    },
    {
      operation: 'migration.index.download_logs_created_at',
      sql: `CREATE INDEX IF NOT EXISTS idx_download_logs_created_at ON download_logs(created_at)`,
    },
    {
      operation: 'migration.create.license_orders',
      sql: `CREATE TABLE IF NOT EXISTS license_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  hwid TEXT NOT NULL,
  package_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  vkn TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL,
  license_key TEXT,
  expires_at TEXT,
  payment_code TEXT,
  price_tl INTEGER NOT NULL
)`,
    },
    {
      operation: 'migration.create.license_settings',
      sql: `CREATE TABLE IF NOT EXISTS license_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.index.license_orders_hwid',
      sql: `CREATE INDEX IF NOT EXISTS idx_license_orders_hwid ON license_orders(hwid)`,
    },
    {
      operation: 'migration.index.license_orders_vkn',
      sql: `CREATE INDEX IF NOT EXISTS idx_license_orders_vkn ON license_orders(vkn)`,
    },
    {
      operation: 'migration.index.license_orders_status',
      sql: `CREATE INDEX IF NOT EXISTS idx_license_orders_status ON license_orders(status)`,
    },
    {
      operation: 'migration.index.license_orders_one_provisional_hwid',
      sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_license_orders_one_provisional_hwid
ON license_orders(hwid) WHERE status = 'provisional'`,
    },
    {
      operation: 'migration.index.license_orders_one_provisional_vkn',
      sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_license_orders_one_provisional_vkn
ON license_orders(vkn) WHERE status = 'provisional'`,
    },
    {
      operation: 'migration.create.device_heartbeats',
      sql: `CREATE TABLE IF NOT EXISTS device_heartbeats (
  hwid TEXT PRIMARY KEY,
  app_version TEXT NOT NULL,
  license_status TEXT NOT NULL,
  os_user TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  seen_count INTEGER NOT NULL DEFAULT 1
)`,
    },
    {
      operation: 'migration.index.device_heartbeats_last_seen',
      sql: `CREATE INDEX IF NOT EXISTS idx_device_heartbeats_last_seen ON device_heartbeats(last_seen_at)`,
    },
    {
      operation: 'migration.create.admin_password_resets',
      sql: `CREATE TABLE IF NOT EXISTS admin_password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.create.admin_password_overrides',
      sql: `CREATE TABLE IF NOT EXISTS admin_password_overrides (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  password_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.create.license_notifications',
      sql: `CREATE TABLE IF NOT EXISTS license_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  tax_number TEXT NOT NULL,
  tax_office TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
    },
    {
      operation: 'migration.index.license_notifications_created_at',
      sql: `CREATE INDEX IF NOT EXISTS idx_license_notifications_created_at ON license_notifications(created_at)`,
    },
    {
      operation: 'migration.index.license_notifications_status',
      sql: `CREATE INDEX IF NOT EXISTS idx_license_notifications_status ON license_notifications(status)`,
    },
    {
      operation: 'migration.seed.license_settings',
      sql: `INSERT OR IGNORE INTO license_settings (setting_key, setting_value) VALUES
  ('iban', ''),
  ('account_name', 'DOSYORA'),
  ('note_prefix', 'GT')`,
    },
  ]

  try {
    console.log('BEFORE_PREFLIGHT')
    preflightTables = await runMigrationPreflight(client)

    for (const statement of statements) {
      await runStatement(client, statement.operation, statement.sql)
    }

    await addColumnIfMissing(client, 'license_notifications', 'source', 'TEXT')
    await addColumnIfMissing(client, 'license_notifications', 'hardware_id', 'TEXT')
    await addColumnIfMissing(client, 'license_notifications', 'license_key', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'document_limit', 'INTEGER')
    await addColumnIfMissing(client, 'demo_leads', 'account_status', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'used_documents', 'INTEGER NOT NULL DEFAULT 0')
    await addColumnIfMissing(client, 'demo_leads', 'account_type', "TEXT NOT NULL DEFAULT 'DEMO'")
    await addColumnIfMissing(client, 'demo_leads', 'activation_status', "TEXT NOT NULL DEFAULT 'PENDING'")
    await addColumnIfMissing(client, 'demo_leads', 'provision_status', "TEXT NOT NULL DEFAULT 'PENDING'")
    await addColumnIfMissing(client, 'demo_leads', 'lifecycle_status', "TEXT NOT NULL DEFAULT 'ACTIVE'")
    await addColumnIfMissing(client, 'demo_leads', 'customer_user_id', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'customer_company_id', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'activation_token_hash', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'activation_expires_at', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'activation_used_at', 'TEXT')
    await addColumnIfMissing(client, 'demo_leads', 'provisioned_at', 'TEXT')

    await runStatement(
      client,
      'migration.index.document_consumption_events_demo_lead_id',
      `CREATE INDEX IF NOT EXISTS idx_document_consumption_events_demo_lead_id ON document_consumption_events(demo_lead_id)`,
    )

    await runStatement(
      client,
      'migration.index.demo_leads_account_status',
      `CREATE INDEX IF NOT EXISTS idx_demo_leads_account_status ON demo_leads(account_status)`,
    )

    await runStatement(
      client,
      'migration.index.demo_leads_unique_active_demo_email',
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_leads_unique_active_demo_email
       ON demo_leads(email)
       WHERE account_type = 'DEMO'
         AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
         AND account_status IN ('ACTIVE', 'DISABLED')`,
    )

    await verifySchema(client)
    logDbInitSuccess({ phase: 'migrations' })
  } catch (error) {
    logDbInitError('runMigrations', error, {
      phase: 'migrations',
      sqliteMasterTables: preflightTables,
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
