// One-off recovery script for the data loss caused by the foreign-key cascade bug in
// 20261117_006_add_multi_category_support.js (see database/migration.js for the fix).
// That migration recreated the `patterns` table while foreign key enforcement was on,
// which cascaded ON DELETE CASCADE into every child table and wiped their rows.
//
// This script rebuilds what it safely can from the files still present on disk:
//   - `files`: every file directly inside a pattern's folder (outside "pictures")
//   - `photos`/`tech_drawings`: files inside the pattern's "pictures" subfolder, split by
//     extension (images -> photos, anything else -> tech_drawings). In practice every
//     pattern folder only ever had image files added via the "pictures" folder, so this
//     heuristic currently assigns everything to `photos`; review tech_drawings afterwards.
//   - `pattern_categories`: defaulted back to "Else" for any pattern with none, matching
//     what the original migration did for uncategorized patterns.
//
// NOT recoverable from disk (no file-system trace): fabrics, materials, comments, and the
// original category assignments (now defaulted to "Else") - these must be re-entered by hand.
//
// Usage: node database/recover-missing-pattern-files.js
require('dotenv').config();
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';
const dbPath = path.join(patternFolderPath, 'patterns.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']);

function listFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .map(name => path.join(dirPath, name))
    .filter(entryPath => fs.statSync(entryPath).isFile());
}

function recoverPattern(pattern, counts, statements) {
  const folderPath = path.join(patternFolderPath, pattern.name);
  if (!fs.existsSync(folderPath)) {
    return `⚠ ${pattern.name}: folder not found at "${folderPath}", skipped`;
  }

  let photosAdded = 0;
  let techDrawingsAdded = 0;
  let filesAdded = 0;
  let categoryAdded = false;

  if (counts.photos === 0 && counts.techDrawings === 0) {
    for (const filePath of listFiles(path.join(folderPath, 'pictures'))) {
      if (IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
        statements.insertPhoto.run(pattern.id, filePath);
        photosAdded++;
      } else {
        statements.insertTechDrawing.run(pattern.id, filePath);
        techDrawingsAdded++;
      }
    }
  }

  if (counts.files === 0) {
    for (const filePath of listFiles(folderPath).filter(p => path.basename(p) !== 'pictures')) {
      statements.insertFile.run(pattern.id, filePath);
      filesAdded++;
    }
  }

  if (counts.categories === 0 && statements.elseCategoryId) {
    statements.insertPatternCategory.run(pattern.id, statements.elseCategoryId);
    categoryAdded = true;
  }

  return `${pattern.name}: +${photosAdded} photos, +${techDrawingsAdded} tech drawings, +${filesAdded} files` +
    (categoryAdded ? ', category defaulted to "Else"' : '');
}

function main() {
  const patterns = db.prepare('SELECT id, name FROM patterns').all();
  const elseCategory = db.prepare("SELECT id FROM categories WHERE name = 'Else'").get();

  const statements = {
    insertPhoto: db.prepare('INSERT INTO photos (pattern_id, file_path) VALUES (?, ?)'),
    insertTechDrawing: db.prepare('INSERT INTO tech_drawings (pattern_id, file_path) VALUES (?, ?)'),
    insertFile: db.prepare('INSERT INTO files (pattern_id, file_path) VALUES (?, ?)'),
    insertPatternCategory: db.prepare('INSERT INTO pattern_categories (pattern_id, category_id) VALUES (?, ?)'),
    elseCategoryId: elseCategory ? elseCategory.id : null
  };

  const countPhotos = db.prepare('SELECT COUNT(*) AS c FROM photos WHERE pattern_id = ?');
  const countTechDrawings = db.prepare('SELECT COUNT(*) AS c FROM tech_drawings WHERE pattern_id = ?');
  const countFiles = db.prepare('SELECT COUNT(*) AS c FROM files WHERE pattern_id = ?');
  const countCategories = db.prepare('SELECT COUNT(*) AS c FROM pattern_categories WHERE pattern_id = ?');

  const summaryLines = db.transaction(() => {
    return patterns.map(pattern => recoverPattern(pattern, {
      photos: countPhotos.get(pattern.id).c,
      techDrawings: countTechDrawings.get(pattern.id).c,
      files: countFiles.get(pattern.id).c,
      categories: countCategories.get(pattern.id).c
    }, statements));
  })();

  console.log(summaryLines.join('\n'));
  console.log(
    '\nNote: fabrics, materials, comments, and the original category assignments could not be ' +
    'recovered from disk. Categories were defaulted to "Else" where missing; please re-enter ' +
    'fabrics/materials/comments and reassign categories manually where needed.'
  );
}

main();
db.close();
