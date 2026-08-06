import type Database from 'better-sqlite3'

function columnExists(database: Database.Database, table: string, column: string): boolean {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return columns.some((item) => item.name === column)
}

function addColumnIfMissing(
  database: Database.Database,
  table: string,
  column: string,
  definition: string,
) {
  if (!columnExists(database, table, column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

export function runMigrations(database: Database.Database) {
  database.exec(`
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

  addColumnIfMissing(database, 'demo_leads', 'document_limit', 'INTEGER')
  addColumnIfMissing(database, 'demo_leads', 'account_status', 'TEXT')

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_demo_leads_account_status ON demo_leads(account_status);
  `)
}
