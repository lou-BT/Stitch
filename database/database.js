require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';
const dbPath = path.join(patternFolderPath, 'patterns.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

// Create the tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    brand TEXT,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
    free INTEGER NOT NULL DEFAULT 1 CHECK(free IN (0, 1)),
    used INTEGER NOT NULL DEFAULT 0 CHECK(used IN (0, 1)),
    category TEXT NOT NULL,
    description TEXT
  );
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
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS tech_drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS shared_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS pattern_shared_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    shared_file_id INTEGER NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_file_id) REFERENCES shared_files(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    date DATE NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  )
`);

function normalizeBrand(brand) {
  if (typeof brand !== 'string') return null;
  const trimmedBrand = brand.trim();
  return trimmedBrand.length > 0 ? trimmedBrand : null;
}

function normalizeDifficulty(difficulty) {
  const numericDifficulty = Number(difficulty);
  if (!Number.isFinite(numericDifficulty)) return 1;
  return Math.min(5, Math.max(1, Math.round(numericDifficulty)));
}

function normalizeBoolean(value, defaultValue) {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === 1 || value === '1') return 1;
  if (value === 0 || value === '0') return 0;
  return defaultValue ? 1 : 0;
}

function normalizeOptionalText(value) {
  if (typeof value !== 'string') return null;
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeResourceItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => ({
      type: normalizeOptionalText(item?.type),
      requirement: normalizeOptionalText(item?.requirement)
    }))
    .filter(item => item.type && item.requirement);
}

function hydratePatternFields(pattern) {
  pattern.brand = normalizeBrand(pattern.brand);
  pattern.difficulty = normalizeDifficulty(pattern.difficulty);
  pattern.free = normalizeBoolean(pattern.free, true) === 1;
  pattern.used = normalizeBoolean(pattern.used, false) === 1;
}

// Prepared statements
const statements = {
  getPatternByName: db.prepare('SELECT * FROM patterns WHERE name = ?'),
  getPatternById: db.prepare('SELECT * FROM patterns WHERE id = ?'),
  getFabrics: db.prepare('SELECT type, requirement FROM fabrics WHERE pattern_id = ? ORDER BY id ASC'),
  getMaterials: db.prepare('SELECT type, requirement FROM materials WHERE pattern_id = ? ORDER BY id ASC'),
  getPhotos: db.prepare('SELECT file_path FROM photos WHERE pattern_id = ?'),
  getTechDrawings: db.prepare('SELECT file_path FROM tech_drawings WHERE pattern_id = ?'),
  getFiles: db.prepare('SELECT file_path FROM files WHERE pattern_id = ?'),
  getComments: db.prepare('SELECT id, text, date FROM comments WHERE pattern_id = ? ORDER BY date DESC'),
  getSharedFiles: db.prepare('SELECT shared_files.id, shared_files.file_path FROM shared_files JOIN pattern_shared_files ON pattern_shared_files.shared_file_id = shared_files.id WHERE pattern_shared_files.pattern_id = ?')
};

// Helper function to get all patterns
function getAllPatterns() {
  const patterns = db.prepare('SELECT id, name, brand, difficulty, free, used, category, description FROM patterns').all();
    if (patterns.length === 0) return [];
    patterns.forEach(pattern => {
        pattern.fabric = statements.getFabrics.all(pattern.id);
        pattern.materials = statements.getMaterials.all(pattern.id);
        pattern.photos = statements.getPhotos.all(pattern.id).map(row => row.file_path);
        pattern.techDrawings = statements.getTechDrawings.all(pattern.id).map(row => row.file_path);
    hydratePatternFields(pattern);
    });
    return patterns;
}

// Helper function to get pattern with all details
function getPatternDetails(id) {
  // Get the pattern record
  const pattern = statements.getPatternById.get(id);
  
  // Return null if pattern not found
  if (!pattern) return null;
  
  // Get all related data
  pattern.fabric = statements.getFabrics.all(pattern.id);
  pattern.materials = statements.getMaterials.all(pattern.id);
  pattern.photos = statements.getPhotos.all(pattern.id).map(row => row.file_path);
  pattern.techDrawings = statements.getTechDrawings.all(pattern.id).map(row => row.file_path);
  pattern.files = statements.getFiles.all(pattern.id).map(row => row.file_path);
  pattern.sharedFiles = statements.getSharedFiles.all(pattern.id).map(row => ({ id: row.id, filePath: row.file_path }));
  
  hydratePatternFields(pattern);
  pattern.comments = statements.getComments.all(pattern.id).map(row => ({ 
    id: row.id,
    text: row.text,
    date: new Date(row.date)
  }));
  
  // Return complete pattern object
  return pattern;
}

// Helper function to add a new pattern
function addPattern(pattern) {
  const transaction = db.transaction(() => {
    const insert = db.prepare('INSERT INTO patterns (name, brand, difficulty, free, used, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = insert.run(
      pattern.name,
      normalizeBrand(pattern.brand),
      normalizeDifficulty(pattern.difficulty),
      normalizeBoolean(pattern.free, true),
      normalizeBoolean(pattern.used, false),
      pattern.category,
      pattern.description ?? null
    );
    const id = result.lastInsertRowid;

    const insertFabric = db.prepare('INSERT INTO fabrics (pattern_id, type, requirement) VALUES (?, ?, ?)');
    normalizeResourceItems(pattern.fabric).forEach(item => insertFabric.run(id, item.type, item.requirement));

    const insertMaterial = db.prepare('INSERT INTO materials (pattern_id, type, requirement) VALUES (?, ?, ?)');
    normalizeResourceItems(pattern.materials).forEach(item => insertMaterial.run(id, item.type, item.requirement));
    
    // add related photos
    const insertPhoto = db.prepare('INSERT INTO photos (pattern_id, file_path) VALUES (?, ?)');
    pattern.photos.forEach(photo => insertPhoto.run(id, photo));
    
    // add related tech drawings
    const insertTechDrawing = db.prepare('INSERT INTO tech_drawings (pattern_id, file_path) VALUES (?, ?)');
    pattern.techDrawings.forEach(techDrawing => insertTechDrawing.run(id, techDrawing));
    
    // add related files
    const insertFile = db.prepare('INSERT INTO files (pattern_id, file_path) VALUES (?, ?)');
    pattern.files.forEach(file => insertFile.run(id, file));

    // add new shared files than add them to the pattern_shared_files table
    const insertNewSharedFile = db.prepare('INSERT INTO shared_files (file_path) VALUES (?)');
    const insertPatternSharedFile = db.prepare('INSERT INTO pattern_shared_files (pattern_id, shared_file_id) VALUES (?, ?)');
    pattern.newSharedFiles.forEach(file => {
      const result = insertNewSharedFile.run(file);
      const sharedFileId = result.lastInsertRowid;
      insertPatternSharedFile.run(id, sharedFileId);
    });
    // add existing shared files to the pattern_shared_files table
    const insertOldSharedFiles = db.prepare('INSERT INTO pattern_shared_files (pattern_id, shared_file_id) VALUES (?, ?)');
    (pattern.sharedFiles ?? []).forEach(file => insertOldSharedFiles.run(id, file.id));
    
    return id;
  });
  
  return transaction();
}

// Helper function to update an existing pattern
function updatePattern(id, pattern) {
  // pattern of type NewPattern
  const transaction = db.transaction(() => {
    const update = db.prepare(
      'UPDATE patterns SET name = ?, brand = ?, difficulty = ?, free = ?, used = ?, category = ?, description = ? WHERE id = ?'
    );

    update.run(
      pattern.name,
      normalizeBrand(pattern.brand),
      normalizeDifficulty(pattern.difficulty),
      normalizeBoolean(pattern.free, true),
      normalizeBoolean(pattern.used, false),
      pattern.category,
      pattern.description ?? null,
      id
    );

    db.prepare('DELETE FROM fabrics WHERE pattern_id = ?').run(id);
    db.prepare('DELETE FROM materials WHERE pattern_id = ?').run(id);
    db.prepare('DELETE FROM photos WHERE pattern_id = ?').run(id);
    db.prepare('DELETE FROM tech_drawings WHERE pattern_id = ?').run(id);
    db.prepare('DELETE FROM files WHERE pattern_id = ?').run(id);
    db.prepare('DELETE FROM pattern_shared_files WHERE pattern_id = ?').run(id);
    
    const insertFabric = db.prepare('INSERT INTO fabrics (pattern_id, type, requirement) VALUES (?, ?, ?)');
    normalizeResourceItems(pattern.fabric).forEach(item => insertFabric.run(id, item.type, item.requirement));

    const insertMaterial = db.prepare('INSERT INTO materials (pattern_id, type, requirement) VALUES (?, ?, ?)');
    normalizeResourceItems(pattern.materials).forEach(item => insertMaterial.run(id, item.type, item.requirement));

    const insertPhoto = db.prepare('INSERT INTO photos (pattern_id, file_path) VALUES (?, ?)');
    (pattern.photos ?? []).forEach(photo => insertPhoto.run(id, photo));

    const insertTechDrawing = db.prepare('INSERT INTO tech_drawings (pattern_id, file_path) VALUES (?, ?)');
    (pattern.techDrawings ?? []).forEach(techDrawing => insertTechDrawing.run(id, techDrawing));

    const insertFile = db.prepare('INSERT INTO files (pattern_id, file_path) VALUES (?, ?)');
    (pattern.files ?? []).forEach(file => insertFile.run(id, file));

    // Insert shared files and new shared files
    const insertSharedFile = db.prepare('INSERT INTO pattern_shared_files (pattern_id, shared_file_id) VALUES (?, ?)');
    (pattern.sharedFiles ?? []).forEach(file => insertSharedFile.run(id, file.id));

    const insertNewSharedFile = db.prepare('INSERT INTO shared_files (file_path) VALUES (?)');
    (pattern.newSharedFiles ?? []).forEach(file => {
      // insert new shared file into shared_files table
      const {lastInsertRowid} = insertNewSharedFile.run(file);
      // Insert the new shared file into the pattern_shared_files table (linking it to the current pattern)
      insertSharedFile.run(id, lastInsertRowid);
    });
  });

  return transaction();
}

// Helper to add comment to a pattern
function addComment(patternId, text) {
  const insert = db.prepare('INSERT INTO comments (pattern_id, date, text) VALUES (?, ?, ?)');
  insert.run(patternId, new Date().toISOString(), text);
}

// Helper to edit a comment
function editComment(commentId, newText) {
  const update = db.prepare('UPDATE comments SET text = ?, date = ? WHERE id = ?');
  update.run(newText, new Date().toISOString(), commentId);
}

// Helper to delete a comment
function deleteComment(commentId) {
  const del = db.prepare('DELETE FROM comments WHERE id = ?');
  del.run(commentId);
}

// Helper to delete a pattern
function deletePattern(patternId) {
  const del = db.prepare('DELETE FROM patterns WHERE id = ?');
  del.run(patternId);
}

// Helper to get every shared file
function getAllSharedFiles() {
  return db.prepare('SELECT id, file_path FROM shared_files ORDER BY file_path ASC').all()
    .map(row => ({ id: row.id, filePath: row.file_path }));
}

module.exports = {
  db,
  getPatternDetails,
  getAllPatterns,
  getAllSharedFiles,
  addPattern,
  updatePattern,
  addComment,
  editComment,
  deleteComment,
  deletePattern
};
