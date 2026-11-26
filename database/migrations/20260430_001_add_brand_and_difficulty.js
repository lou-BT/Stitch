module.exports = function up(db) {
  const hasColumn = (tableName, columnName) => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some(column => column.name === columnName);
  };

  if (!hasColumn('patterns', 'brand')) {
    db.exec('ALTER TABLE patterns ADD COLUMN brand TEXT');
  }

  if (!hasColumn('patterns', 'difficulty')) {
    db.exec('ALTER TABLE patterns ADD COLUMN difficulty INTEGER NOT NULL DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5)');
  }
};
