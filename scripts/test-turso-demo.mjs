/**
 * Turso demo API smoke test via HTTP (no direct client.execute).
 * Usage (PowerShell):
 *   $env:TURSO_DATABASE_URL="libsql://..."
 *   $env:TURSO_AUTH_TOKEN="..."
 *   npm run start
 *   node scripts/test-turso-demo.mjs
 */
const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000'
const email = `turso-test-${Date.now()}@example.com`

const payload = {
  company_name: 'Turso Test',
  contact_name: 'Tester',
  email,
  phone: '+905551234567',
  employee_count: '10',
  monthly_document_count: '100',
  message: 'Turso smoke test',
  source: 'website',
}

async function main() {
  const response = await fetch(`${baseUrl}/api/demo-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await response.json()

  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${JSON.stringify(body)}`)
  }

  console.log(JSON.stringify({ ok: true, status: response.status, body }))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }))
  process.exit(1)
})
