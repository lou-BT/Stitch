// THIS FILE IS FOR CHECKING THE CONTENTS OF THE DATABASE AFTER THE MIGRATION FRON THE JSON FILE

require('dotenv').config();
const db = require('./database.js');

console.log('🔍 Checking database contents...\n');

try {
  // Get all patterns
  const patterns = db.getAllPatterns();
  
  console.log(`📊 Total patterns in database: ${patterns.length}\n`);
  
  if (patterns.length === 0) {
    console.log('⚠️  Database is empty!');
  } else {
    patterns.forEach((pattern, index) => {
      console.log(`Pattern ${index + 1}:`);
      console.log(`  ID: ${pattern.id}`);
      console.log(`  Name: ${pattern.name || '(empty)'}`);
      console.log(`  Brand: ${pattern.brand || '(empty)'}`);
      console.log(`  Difficulty: ${pattern.difficulty || 1}`);
      console.log(`  Category: ${pattern.category || '(empty)'}`);
      console.log(`  Description: ${pattern.description || '(empty)'}`);
      
      // Get details for this pattern
      const details = db.getPatternDetails(pattern.id);
      if (details) {
        console.log(`  Photos: ${details.photos?.length || 0}`);
        console.log(`  Tech Drawings: ${details.techDrawings?.length || 0}`);
        console.log(`  Files: ${details.files?.length || 0}`);
        console.log(`  Comments: ${details.comments?.length || 0}`);
      }
      console.log('');
    });
  }
  
  // Check if backup JSON exists
  const path = require('path');
  const fs = require('fs');
  const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';
  const backupPath = path.join(patternFolderPath, 'patternIndex.json.backup');
  
  if (fs.existsSync(backupPath)) {
    console.log(`\n✅ Backup JSON file exists at: ${backupPath}`);
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`   Original had ${backup.length} patterns\n`);
    
    if (backup.length > 0) {
      console.log('Sample pattern from backup:');
      console.log(JSON.stringify(backup[0], null, 2));
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}
