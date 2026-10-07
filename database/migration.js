require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';
const dbPath = path.join(patternFolderPath, 'patterns.db');
const db = new Database(dbPath);

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

try {
  runMigrations();
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
