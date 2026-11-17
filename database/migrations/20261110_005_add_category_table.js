const { defaultCategories } = require('./../../default-categories');

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
        
        db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE COLLATE NOCASE
            );
        `);

        // Insert default categories if they don't exist
        const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
        for (const category of defaultCategories) {
            insertCategory.run(category);
        }

        if (hasTable('patterns') && !hasColumn('patterns', 'category_id')) {
            db.exec(`ALTER TABLE patterns ADD COLUMN category_id INTEGER REFERENCES categories(id)`);
        }

        if (hasTable('patterns') && hasColumn('patterns', 'category')) {
            db.exec(`
                INSERT OR IGNORE INTO categories (name)
                SELECT DISTINCT category
                FROM patterns
                WHERE category IS NOT NULL
                AND category != ''
            `)

            db.exec(`
                UPDATE patterns
                SET category_id = (SELECT id FROM categories WHERE name = patterns.category)
                WHERE category_id IS NULL
            `);


            // fallback for empty or unknown values
            db.exec(`
                UPDATE patterns
                SET category_id = (SELECT id FROM categories WHERE name = 'Else')
                WHERE category_id IS NULL
            `);

            // only drop the old category column if it exists and the new category_id column has been populated
            const unmapped = db.prepare(`
                SELECT COUNT(*) AS n
                FROM patterns
                WHERE category_id IS NULL
            `).get().n;
            if (unmapped === 0) {
                db.exec(`ALTER TABLE patterns DROP COLUMN category`);
            }
        }

    });
    transaction();
};





// Drop the old category column after migrating data to the new category_id column
// db.exec(`ALTER TABLE patterns DROP COLUMN category`);

