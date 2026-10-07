import Database from 'better-sqlite3';
// require('dotenv').config();
import path from 'path';
import { Pattern, PatternEdit } from '../classes';

const patternFolderPath = process.env["PATTERN_FOLDER_PATH"] || 'C:/Users/louca/Documents/PatternFolder';
const dbPath = path.join(patternFolderPath, 'patterns.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

interface FileRow { file_path: string; }
interface CommentRow { id: number, text: string; date: string; }

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
  create table if not exists tech_drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  );
  create table if not exists files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  );
  create table if not exists comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id INTEGER NOT NULL,
    date DATE NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
  )
`);

function normalizeBrand(brand?: string | null) {
  if (typeof brand !== 'string') return null;
  const trimmedBrand = brand.trim();
  return trimmedBrand.length > 0 ? trimmedBrand : null;
}

function normalizeDifficulty(difficulty: number) {
  if (!Number.isFinite(difficulty)) return 1;
  return Math.min(5, Math.max(1, Math.round(difficulty)));
}

function normalizeBoolean(value: unknown, defaultValue: boolean): number {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === 1 || value === '1') return 1;
  if (value === 0 || value === '0') return 0;
  return defaultValue ? 1 : 0;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeResourceItems(items: unknown): Array<{ type: string; requirement: string }> {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => ({
      type: normalizeOptionalText((item as { type?: unknown }).type),
      requirement: normalizeOptionalText((item as { requirement?: unknown }).requirement)
    }))
    .filter((item): item is { type: string; requirement: string } => Boolean(item.type && item.requirement));
}

function hydratePatternFields(pattern: Pattern) {
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
  getComments: db.prepare('SELECT id, text, date FROM comments WHERE pattern_id = ? ORDER BY date DESC')
};

// Helper function to get all patterns
function getAllPatterns() {
  const patterns = db.prepare('SELECT id, name, brand, difficulty, free, used, category, description FROM patterns').all() as Pattern[];
  patterns.forEach(pattern => {
    pattern.fabric = statements.getFabrics.all(pattern.id) as Array<{ type: string; requirement: string }>;
    pattern.materials = statements.getMaterials.all(pattern.id) as Array<{ type: string; requirement: string }>;
    pattern.photos = (statements.getPhotos.all(pattern.id) as FileRow[]).map(row => row.file_path);
    pattern.techDrawings = (statements.getTechDrawings.all(pattern.id) as FileRow[]).map(row => row.file_path);
    pattern.files = [];
    pattern.comments = [];
    hydratePatternFields(pattern);
  });
  return patterns;
}

// Helper function to get pattern with all details
function getPatternDetails(id: number) {
  // Get the pattern record
  let pattern: Pattern;
  pattern = statements.getPatternById.get(id) as Pattern;
  
  // Return null if pattern not found
  if (!pattern) return null;
  
  // Get all related data
  pattern.fabric = statements.getFabrics.all(pattern.id) as Array<{ type: string; requirement: string }>;
  pattern.materials = statements.getMaterials.all(pattern.id) as Array<{ type: string; requirement: string }>;
  pattern.photos = (statements.getPhotos.all(pattern.id) as FileRow[]).map(row => row.file_path);
  pattern.techDrawings = (statements.getTechDrawings.all(pattern.id) as FileRow[]).map(row => row.file_path);
  pattern.files = (statements.getFiles.all(pattern.id) as FileRow[]).map(row => row.file_path);
  hydratePatternFields(pattern);
  pattern.comments = (statements.getComments.all(pattern.id) as CommentRow[]).map(row => ({ id: row.id, text: row.text, date: new Date(row.date) }));
  
  // Return complete pattern object
  return pattern;
}

// Helper function to add a new pattern
function addPattern(pattern: Pattern) {
  //add the pattern record
  const transacion = db.transaction(() => {
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
    const id = result.lastInsertRowid as number;

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

    return id;
  });
  
  return transacion();
}

// Helper function to update an existing pattern
function updatePattern(id: number, pattern: Pattern) {
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
  });

  return transaction();
}

// Helper to add comment to a pattern
function addComment(patternId: number, text: string) {
  const insert = db.prepare('INSERT INTO comments (pattern_id, date, text) VALUES (?, ?, ?)');
  insert.run(patternId, new Date().toISOString(), text);
}
// Helper to edit a comment
function editComment(commentId: number, newText: string) {
  const update = db.prepare('UPDATE comments SET text = ?, date = ? WHERE id = ?');
  update.run(newText, new Date().toISOString(), commentId);
}
// Helper to delete a comment
function deleteComment(commentId: number) {
  const del = db.prepare('DELETE FROM comments WHERE id = ?');
  del.run(commentId);
}
// Helper to delete a pattern
function deletePattern(patternId: number) {
  const del = db.prepare('DELETE FROM patterns WHERE id = ?');
  del.run(patternId);
}

export { getPatternDetails, getAllPatterns, addPattern, updatePattern, addComment, editComment, deleteComment, deletePattern };