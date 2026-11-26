module.exports = function up(db) {
  const hasTable = tableName => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName);
    return Boolean(table);
  };

  const hasColumn = (tableName, columnName) => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some(column => column.name === columnName);
  };

  db.exec(`
    CREATE TABLE IF NOT EXISTS fabrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      requirement TEXT NOT NULL,
      FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      requirement TEXT NOT NULL,
      FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
    );
  `);

  if (hasTable('patterns') && hasColumn('patterns', 'fabric_type') && hasColumn('patterns', 'fabric_requirement')) {
    db.exec(`
      INSERT INTO fabrics (pattern_id, type, requirement)
      SELECT id, TRIM(fabric_type), TRIM(fabric_requirement)
      FROM patterns
      WHERE fabric_type IS NOT NULL
        AND TRIM(fabric_type) <> ''
        AND fabric_requirement IS NOT NULL
        AND TRIM(fabric_requirement) <> ''
        AND NOT EXISTS (
          SELECT 1
          FROM fabrics f
          WHERE f.pattern_id = patterns.id
            AND f.type = TRIM(patterns.fabric_type)
            AND f.requirement = TRIM(patterns.fabric_requirement)
        );
    `);
  }
};
