/**
 * Turso demo API smoke test.
 * Usage (PowerShell):
 *   $env:TURSO_DATABASE_URL="libsql://..."
 *   $env:TURSO_AUTH_TOKEN="..."
 *   node scripts/test-turso-demo.mjs
 */
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required.')
  process.exit(1)
}

const client = createClient({ url, authToken })

const email = `turso-test-${Date.now()}@example.com`

async function main() {
  await client.execute(`
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
      user_agent TEXT,
      document_limit INTEGER,
      account_status TEXT,
      used_documents INTEGER NOT NULL DEFAULT 0
    )
  `)

  const result = await client.execute({
    sql: `
      INSERT INTO demo_leads (
        company_name, contact_name, email, phone, document_limit,
        account_status, status, used_documents
      ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', 'NEW', 0)
      RETURNING id
    `,
    args: ['Turso Test', 'Tester', email, '+905551234567', 100],
  })

  const id = Number(result.rows[0]?.id ?? 0)
  if (!id) {
    throw new Error('INSERT did not return id')
  }

  console.log(JSON.stringify({ ok: true, id, email }))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message, code: error.code }))
  process.exit(1)
})
