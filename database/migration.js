require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';
const dbPath = path.join(patternFolderPath, 'patterns.db');
const db = new Database(dbPath);

// Foreign keys must be disabled for the whole migration run (and before any transaction
// is opened, since SQLite ignores changes to this pragma inside a transaction). Some
// migrations rebuild tables (copy -> drop -> rename) to work around SQLite's limited
// ALTER TABLE support; with foreign_keys = ON, dropping a parent table cascades
// ON DELETE CASCADE into every child table (photos, tech_drawings, files, etc.),
// wiping their rows even though the parent's data is only being recreated, not deleted.
db.pragma('foreign_keys = OFF');

const migrationsDir = path.join(__dirname, 'migrations');

function ensureMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);
}

function getAppliedMigrations() {
  const rows = db.prepare('SELECT name FROM schema_migrations').all();
  return new Set(rows.map(row => row.name));
}

function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();
}

function runMigrations() {
  console.log('Running database migrations from folder...');
  ensureMigrationsTable();

  const migrationFiles = getMigrationFiles();
  const appliedMigrations = getAppliedMigrations();

  if (migrationFiles.length === 0) {
    console.log('No migration files found in ./migrations');
    return;
  }

  const insertApplied = db.prepare(
    'INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)'
  );

  for (const fileName of migrationFiles) {
    if (appliedMigrations.has(fileName)) {
      console.log(`- Skipping already applied migration: ${fileName}`);
      continue;
    }

    const migrationPath = path.join(migrationsDir, fileName);
    const migration = require(migrationPath);
    const migrationFn = migration.up || migration;

    if (typeof migrationFn !== 'function') {
      throw new Error(`Migration ${fileName} must export a function or an { up } function.`);
    }

    db.transaction(() => {
      migrationFn(db);
      insertApplied.run(fileName, new Date().toISOString());
    })();

    console.log(`+ Applied migration: ${fileName}`);
  }

  console.log('Migrations completed.');
}

function checkForeignKeyViolations() {
  const violations = db.prepare('PRAGMA foreign_key_check').all();
  if (violations.length > 0) {
    console.warn(`⚠ Found ${violations.length} foreign key violation(s) after migrating:`);
    console.warn(violations);
  }
}

try {
  runMigrations();
  checkForeignKeyViolations();
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  db.pragma('foreign_keys = ON');
  db.close();
}
