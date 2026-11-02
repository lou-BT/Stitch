module.exports = function up(db) {

  db.exec(`
    CREATE TABLE IF NOT EXISTS shared_files  (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS pattern_shared_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_id     INTEGER NOT NULL,
        shared_file_id INTEGER NOT NULL,
        FOREIGN KEY (pattern_id)     REFERENCES patterns(id)     ON DELETE CASCADE,
        FOREIGN KEY (shared_file_id) REFERENCES shared_files(id) ON DELETE CASCADE
    );
  `);
};
