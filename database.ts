import sqlite3 from 'sqlite3';

const DB_FILE_PATH = './data/database.db'; // Specify the file path for your SQLite database

// Open SQLite database
const db = new sqlite3.Database(DB_FILE_PATH);

// // Create a table
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS patterns (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, filepath TEXT)');
});

export default db;

// export function insertPattern(name: string, filepath: string) {
//     db.run('INSERT INTO patterns (name, filepath) VALUES (?, ?)', [name, filepath]);
// }
  
// export function getAllPatterns(callback: (patterns: any[]) => void) {
//     db.all('SELECT * FROM patterns', (err, rows) => {
//         if (err) {
//         console.error(err);
//         return;
//         }
//         callback(rows);
//     });
// }