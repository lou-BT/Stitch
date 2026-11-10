require('dotenv').config();
const { app, BrowserWindow, ipcMain, shell, ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const settings = require('electron-settings');

// Import database functions
const db = require('./database/database.js');

const patternFolderPath = process.env.PATTERN_FOLDER_PATH || 'C:/Users/louca/Documents/PatternFolder';

// Enable hot reload in development
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}


let mainWindow;

function createPatternFolder(folderPath) {
  //check if folder exists, if not create folder
  if(!fs.existsSync(folderPath)) {
    console.log("creating folder");
    fs.mkdirSync(folderPath);
    //and create index file
    fs.writeFileSync(path.join(folderPath,'patternIndex.json'), JSON.stringify([]));
  }
}

async function loadConfig() {
  //check if predefined config exist
  const configPath = path.join(__dirname, 'config.json');
  if(fs.existsSync(configPath)) {
    //if yes, load config
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    await settings.set('settings', config);
    //and check if folder exists

  } else {
    //if not, check if file exists at default path
    const folderPath = path.join(app.getPath('documents'),'PatternFolder');
    //if it doesn't exists, create it with the JSON index
    createPatternFolder(folderPath);
    //and add default path to config
    await settings.set('settings', {
      'patternFolderPath': folderPath
    })
  }
}

async function updateConfig(config) {
  //check if config file already exists
  const configPath = path.join(__dirname, 'config.json');
  if(fs.existsSync(configPath)) {
    //if yes, update it
    fs.writeFileSync(configPath, JSON.stringify(config));
  } else {
    //if not, create it
    fs.writeFileSync(configPath, JSON.stringify(config));
  }

}

function createWindow () {
  // loadConfig();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allow loading local resources
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load from dev server in development, built files in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, `/dist/browser/index.html`),
        protocol: "file:",
        slashes: true
      })
    );
  }

  // Open the DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow();
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})



ipcMain.handle('patterns:getAll', (event) => {
  try {
    return db.getAllPatterns();
  } catch (error) {
    console.error('Error getting patterns:', error);
    return [];
  }
})



ipcMain.handle('patterns:getDetails', (event, patternId) => {
  try {
    return db.getPatternDetails(patternId); 
  } catch (error) {
    console.error('Error getting pattern details:', error);
    return null;
  }
})

ipcMain.handle('comments:add', (event, patternId, text) => {
  try {
    const trimmed = (text ?? '').trim();
    if (!trimmed) return db.getPatternDetails(patternId);
    db.addComment(patternId, trimmed);
    return db.getPatternDetails(patternId);
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
});

ipcMain.handle('comments:edit', (event, patternId, commentId, text) => {
  try {
    const trimmed = (text ?? '').trim();
    if (!trimmed) return db.getPatternDetails(patternId);
    db.editComment(commentId, trimmed);
    return db.getPatternDetails(patternId);
  } catch (error) {
    console.error('Error editing comment:', error);
    return null;
  }
});

ipcMain.handle('comments:delete', (event, patternId, commentId) => {
  try {
    db.deleteComment(commentId);
    return db.getPatternDetails(patternId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    return null;
  }
});

ipcMain.handle('sharedFiles:getAll', (event) => {
  try {
    return db.getAllSharedFiles();
  } catch (error) {
    console.error('Error getting shared files:', error);
    return [];
  }
});


ipcMain.on('patterns:addNew', (event, pattern) => {

  var photos = [];
  var techDrawings = [];
  var files = [];
  var newSharedFiles = [];

  const newFolderPath = path.join(patternFolderPath, pattern.name);
  // Create folder
  fs.mkdirSync(newFolderPath);

  //copy files in folder
  pattern.files.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, fileName);
    
    fs.copyFileSync(filePath, destPath);
    files.push(destPath);
  })

  // Create sub folder
  fs.mkdirSync(path.join(newFolderPath, "pictures"));

  //copy pictures in folder
  pattern.photos.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, "pictures", fileName);

    fs.copyFileSync(filePath, destPath);
    photos.push(destPath);
  });

  pattern.techDrawings.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, "pictures", fileName);

    fs.copyFileSync(filePath, destPath);
    techDrawings.push(destPath);
  });

  // Copy new shared files in the folder "shared"
  pattern.newSharedFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(patternFolderPath, "shared", fileName);
    // Create the "shared" folder if it doesn't exist
    if (!fs.existsSync(path.join(patternFolderPath, "shared"))) {
      fs.mkdirSync(path.join(patternFolderPath, "shared"));
    }

    fs.copyFileSync(filePath, destPath);
    newSharedFiles.push(destPath);
  });

  

  //update database
  const newPattern = {
    name: pattern.name,
    brand: pattern.brand ?? null,
    difficulty: pattern.difficulty,
    free: pattern.free ?? true,
    used: pattern.used ?? false,
    fabric: pattern.fabric ?? [],
    materials: pattern.materials ?? [],
    category: pattern.category,
    description: pattern.description,
    files: files,
    photos: photos,
    techDrawings: techDrawings,
    newSharedFiles: newSharedFiles,
    sharedFiles: pattern.sharedFiles ?? [],
    comments: []
  }

  try {
    db.addPattern(newPattern);
    const patterns = db.getAllPatterns();
    event.sender.send('patterns:update', patterns);
  } catch (error) {
    console.error('Error adding pattern to database:', error);
    event.sender.send('patterns:addNew:response', []);
  }
})



ipcMain.on('patterns:openFile', (event, file) => {
  shell.openPath(file).then( res => {
    if(res != "") shell.showItemInFolder(file);
  })
})



ipcMain.on('patterns:delete', (event, pattern) => {
  //delete folder
  const folderPath = path.join(patternFolderPath, pattern.name);
  if(fs.existsSync(folderPath)) {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error while deleting the folder:', err);
      } else {
        console.log('Folder and its contents deleted successfully');
      }
    });   
  }

  //delete from database
  try {
    db.deletePattern(pattern.id);
    const patterns = db.getAllPatterns();
    event.sender.send('patterns:update', patterns);
  } catch (error) {
    console.error('Error deleting pattern from database:', error);
    event.sender.send('patterns:delete:response', []);
  }
})



ipcMain.handle('patterns:edit', (event, oldPattern, newPattern) => {
  // old pattern of type Pattern
  // new pattern of type NewPattern (extra field for new shared files)

  console.log('edit is called')

  var pattern = newPattern;
  const folderPath = path.join(patternFolderPath, newPattern.name);

  function copyAndReplacePaths(targetList, sourcePaths, destinationBuilder) {
    const replacements = new Map();

    sourcePaths.forEach(sourcePath => {
      const fileName = path.basename(sourcePath);
      const destinationPath = destinationBuilder(fileName);

      fs.copyFileSync(sourcePath, destinationPath);

      if (!replacements.has(sourcePath)) {
        replacements.set(sourcePath, []);
      }
      replacements.get(sourcePath).push(destinationPath);
    });

    return (targetList || []).map(existingPath => {
      const replacementQueue = replacements.get(existingPath);
      if (replacementQueue && replacementQueue.length > 0) {
        return replacementQueue.shift();
      }
      return existingPath;
    });
  }

  // PHOTOS
  // photos to be removed (present in oldPattern but not in newPattern)
  const delPhotos = oldPattern.photos.filter(photo => !newPattern.photos.includes(photo));
  // photos to be added (present in newPattern but not in oldPattern)
  const addPhotos = newPattern.photos.filter(photo => !oldPattern.photos.includes(photo));

  // delete photos
  for( let i = 0; i < delPhotos.length; i++) {
    console.log('photo', delPhotos[i])
    if(fs.existsSync(delPhotos[i])) 
      fs.unlinkSync(delPhotos[i], { recursive: true, force: true }, (err) => {
        if (err) {
          console.error('Error while deleting the folder:', err);
        } else {
          console.log('Folder and its contents deleted successfully');
        }
      })
  }

  // add photos
    pattern.photos = copyAndReplacePaths(
    pattern.photos,
    addPhotos,
    fileName => path.join(folderPath, "pictures", fileName)
  );
  
  // TECH DRAWINGS
  // tech drawings to be removed (present in oldPattern but not in newPattern)
  const delTechDrawings = oldPattern.techDrawings.filter(td => !newPattern.techDrawings.includes(td));
  // tech drawings to be added (present in newPattern but not in oldPattern)
  const addTechDrawings = newPattern.techDrawings.filter(td => !oldPattern.techDrawings.includes(td));

  // delete tech drawings
  for( let i=0; i < delTechDrawings.length; i++) {
    if(fs.existsSync(delTechDrawings[i])) 
      fs.unlinkSync(delTechDrawings[i], { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error while deleting the folder:', err);
      } else {
        console.log('Folder and its contents deleted successfully');
      }
    })
  }

  // add tech drawings
  pattern.techDrawings = copyAndReplacePaths(
    pattern.techDrawings,
    addTechDrawings,
    fileName => path.join(folderPath, "techDrawings", fileName)
  );

  // FILES
  // files to be removed (present in oldPattern but not in newPattern)
  const delFiles = oldPattern.files.filter(f => !newPattern.files.includes(f));
  // files to be added (present in newPattern but not in oldPattern)
  const addFiles = newPattern.files.filter(f => !oldPattern.files.includes(f));

  // delete files
  for( let i=0; i < delFiles.length; i++) {
    if(fs.existsSync(delFiles[i])) 
      fs.unlinkSync(delFiles[i], { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error while deleting the folder:', err);
      } else {
        console.log('Folder and its contents deleted successfully');
      }
    })
  }

  // add files
  pattern.files = copyAndReplacePaths(
    pattern.files,
    addFiles,
    fileName => path.join(folderPath, fileName)
  );

  // SHARED FILES

  // shared files to be removed (present in oldPattern but not in newPattern)
  // const delSharedFiles = oldPattern.sharedFiles.filter(sf => !newPattern.sharedFiles.includes(sf));
  // const addSharedFiles = newPattern.sharedFiles.filter(sf => !oldPattern.sharedFiles.includes(sf)); 
  // => no need to handle old shared files, they are already in the right folder, only db references need to be updated
  
  // shared files to be added (new shared files field in newPattern type)
  const addSharedFiles = newPattern.newSharedFiles;

  // delete shared files
  // = > no files to delete for shared files only db references need to be updated

  //and add shared files
  pattern.newSharedFiles = copyAndReplacePaths(
    pattern.newSharedFiles,
    addSharedFiles,
    fileName => path.join(patternFolderPath, "shared", fileName)
  );



  //update database
  try {
    // Update the pattern in database with the edits
    db.updatePattern(pattern.id, pattern);
    const patterns = db.getAllPatterns();
    event.sender.send('patterns:update', patterns);
  } catch (error) {
    console.error('Error updating pattern in database:', error);
  }

})
