module.exports = function up(db) {
  const hasColumn = (tableName, columnName) => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some(column => column.name === columnName);
  };

  if (!hasColumn('patterns', 'free')) {
    db.exec('ALTER TABLE patterns ADD COLUMN free INTEGER NOT NULL DEFAULT 1 CHECK(free IN (0, 1))');
  }

  if (!hasColumn('patterns', 'used')) {
    db.exec('ALTER TABLE patterns ADD COLUMN used INTEGER NOT NULL DEFAULT 0 CHECK(used IN (0, 1))');
  }

  if (!hasColumn('patterns', 'fabric_type')) {
    db.exec('ALTER TABLE patterns ADD COLUMN fabric_type TEXT');
  }

  if (!hasColumn('patterns', 'fabric_requirement')) {
    db.exec('ALTER TABLE patterns ADD COLUMN fabric_requirement TEXT');
  }
};