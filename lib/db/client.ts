import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'

import { runMigrations } from './migrations'

let db: Database.Database | null = null

function getDatabasePath(): string {
  const configured = process.env.DATABASE_PATH
  if (configured) return configured

  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  return path.join(dataDir, 'dosyora.db')
}

function migrate(database: Database.Database) {
  runMigrations(database)
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDatabasePath())
    db.pragma('journal_mode = WAL')
    migrate(db)
  }

  return db
}
