const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';
const dbPath = path.join(patternFolderPath, 'patterns.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

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
    return `WARN ${pattern.name}: folder not found at "${folderPath}", skipped`;
  }

  // let photosAdded = 0;
  let techDrawingsAdded = 0;
  // let filesAdded = 0;
  // let categoryAdded = false;

  // if (counts.photos === 0 && counts.techDrawings === 0) {
  //   for (const filePath of listFiles(path.join(folderPath, 'pictures'))) {
  //     if (IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
  //       statements.insertPhoto.run(pattern.id, filePath);
  //       photosAdded++;
  //     } else {
  //       statements.insertTechDrawing.run(pattern.id, filePath);
  //       techDrawingsAdded++;
  //     }
  //   }
  // }

   if (counts.techDrawings === 0) {
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

  // if (counts.files === 0) {
  //   for (const filePath of listFiles(folderPath).filter(p => path.basename(p) !== 'pictures')) {
  //     statements.insertFile.run(pattern.id, filePath);
  //     filesAdded++;
  //   }
  // }

  // if (counts.categories === 0 && statements.elseCategoryId) {
  //   statements.insertPatternCategory.run(pattern.id, statements.elseCategoryId);
  //   categoryAdded = true;
  // }

  return `${pattern.name}: +${techDrawingsAdded} tech drawings`;
}

function main() {
  const patterns = db.prepare('SELECT id, name FROM patterns').all();
  const elseCategory = db.prepare("SELECT id FROM categories WHERE name = 'Else'").get();

  const statements = {
    // insertPhoto: db.prepare('INSERT INTO photos (pattern_id, file_path) VALUES (?, ?)'),
    insertTechDrawing: db.prepare('INSERT INTO tech_drawings (pattern_id, file_path) VALUES (?, ?)'),
    // insertFile: db.prepare('INSERT INTO files (pattern_id, file_path) VALUES (?, ?)'),
    // insertPatternCategory: db.prepare('INSERT INTO pattern_categories (pattern_id, category_id) VALUES (?, ?)'),
    // elseCategoryId: elseCategory ? elseCategory.id : null
  };

  // const countPhotos = db.prepare('SELECT COUNT(*) AS c FROM photos WHERE pattern_id = ?');
  const countTechDrawings = db.prepare('SELECT COUNT(*) AS c FROM tech_drawings WHERE pattern_id = ?');
  // const countFiles = db.prepare('SELECT COUNT(*) AS c FROM files WHERE pattern_id = ?');
  // const countCategories = db.prepare('SELECT COUNT(*) AS c FROM pattern_categories WHERE pattern_id = ?');

  db.exec('BEGIN');
  const summaryLines = [];
  for (const pattern of patterns) {
    summaryLines.push(recoverPattern(pattern, {
      photos: 0,
      techDrawings: countTechDrawings.get(pattern.id).c,
      files: 0,
      categories: 0
    }, statements));
  }
  db.exec('COMMIT');

  console.log(summaryLines.join('\n'));
}

main();
db.close();
