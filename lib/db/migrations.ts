import type { Client } from '@libsql/client'

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

export async function runMigrations(client: Client) {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS demo_leads (
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
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
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
    );

    CREATE TABLE IF NOT EXISTS ip_demo_quota (
      ip_address TEXT PRIMARY KEY,
      demo_count INTEGER NOT NULL DEFAULT 0,
      window_started_at TEXT NOT NULL,
      window_expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_demo_leads_status ON demo_leads(status);
    CREATE INDEX IF NOT EXISTS idx_demo_leads_created_at ON demo_leads(created_at);
    CREATE INDEX IF NOT EXISTS idx_demo_leads_email ON demo_leads(email);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
  `)

  await addColumnIfMissing(client, 'demo_leads', 'document_limit', 'INTEGER')
  await addColumnIfMissing(client, 'demo_leads', 'account_status', 'TEXT')
  await addColumnIfMissing(client, 'demo_leads', 'used_documents', 'INTEGER NOT NULL DEFAULT 0')

  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_demo_leads_account_status ON demo_leads(account_status)`,
  })
}
