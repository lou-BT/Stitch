module.exports = function up(db) {
    const hasTable = tableName => {
        const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName);
        return Boolean(table);
    };

    const hasColumn = (tableName, columnName) => {
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        return columns.some(column => column.name === columnName);
    };

    const transaction = db.transaction(() => {
        // Create the junction table for many-to-many pattern-category relationship
        db.exec(`
            CREATE TABLE IF NOT EXISTS pattern_categories (
                pattern_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                PRIMARY KEY (pattern_id, category_id),
                FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            );
        `);

        if (hasTable('patterns') && hasColumn('patterns', 'category_id')) {
            // Migrate existing category data to junction table
            // For each pattern with a category, insert into pattern_categories
            db.exec(`
                INSERT INTO pattern_categories (pattern_id, category_id)
                SELECT id, category_id FROM patterns
                WHERE category_id IS NOT NULL;
            `);

            // For patterns without a category, assign the default 'Else' category
            const elseCategory = db.prepare('SELECT id FROM categories WHERE name = ?').get('Else');
            if (elseCategory) {
                db.exec(`
                    INSERT INTO pattern_categories (pattern_id, category_id)
                    SELECT id, ? FROM patterns
                    WHERE category_id IS NULL;
                `, [elseCategory.id]);
            }

            // Verify all patterns now have at least one category
            const patternsWithoutCategory = db.prepare(`
                SELECT COUNT(*) AS count FROM patterns p
                WHERE NOT EXISTS (
                    SELECT 1 FROM pattern_categories pc WHERE pc.pattern_id = p.id
                )
            `).get();

            if (patternsWithoutCategory.count > 0) {
                throw new Error(
                    `Migration failed: ${patternsWithoutCategory.count} patterns have no categories. ` +
                    'Ensure "Else" category exists before running this migration.'
                );
            }

            // Drop the old category_id column from patterns table
            // SQLite doesn't support direct DROP COLUMN, so we recreate the table.
            // NOTE: dropping `patterns` here relies on the migration runner having
            // disabled `PRAGMA foreign_keys` for the run (see database/migration.js).
            // With foreign keys enabled, DROP TABLE patterns would cascade
            // ON DELETE CASCADE into every child table (photos, tech_drawings, files,
            // fabrics, materials, comments, pattern_shared_files, pattern_categories),
            // wiping their rows even though patterns itself is only being recreated.
            db.exec(`
                CREATE TABLE patterns_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    brand TEXT,
                    difficulty INTEGER NOT NULL DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
                    free INTEGER NOT NULL DEFAULT 1 CHECK(free IN (0, 1)),
                    used INTEGER NOT NULL DEFAULT 0 CHECK(used IN (0, 1)),
                    description TEXT
                );

                INSERT INTO patterns_new (id, name, brand, difficulty, free, used, description)
                SELECT id, name, brand, difficulty, free, used, description FROM patterns;

                DROP TABLE patterns;

                ALTER TABLE patterns_new RENAME TO patterns;
            `);
        }
    });

    transaction();
};
