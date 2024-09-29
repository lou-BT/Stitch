const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');
const url = require("url");

const patternFolderPath = 'C:/Users/louca/Documents/PatternFolder';
const path = require("path");
const fs = require("fs");
const { shell } = require("electron");


/*
const sqlite3 = require('sqlite3');

// Open SQLite database
const DB_FILE_PATH = './data/database.db';
const db = new sqlite3.Database(DB_FILE_PATH);

// // Create a table
db.serialize(() => {
  db.run('DROP TABLE patterns');
  db.run('CREATE TABLE IF NOT EXISTS patterns (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL, files TEXT[] NOT NULL)');
});

*/

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/browser/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

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
  const patternIndexPath = path.join(patternFolderPath, 'patternIndex.json');
  if(fs.existsSync(patternIndexPath)) {
    const patternsJSON = fs.readFileSync(patternIndexPath, 'utf-8');
    return JSON.parse(patternsJSON);
  }
  else return [];
})

ipcMain.on('patterns:addNew', (event, pattern) => {

  var photos = [];
  var techDrawings = [];
  var files = [];

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

  //update JSON index
  const patternIndexPath = path.join(patternFolderPath, 'patternIndex.json');
  const newPattern = {
    name: pattern.name,
    category: pattern.category,
    files: files,
    photos: photos,
    techDrawings: techDrawings
  }

  if(fs.existsSync(patternIndexPath)) {
        const patternsJSON = fs.readFileSync(patternIndexPath, 'utf-8');
        var patterns = JSON.parse(patternsJSON);
        patterns.push(newPattern);

        fs.writeFileSync(patternIndexPath, JSON.stringify(patterns));
        event.sender.send('patterns:update', patterns);
  }

  else {
    event.sender.send('patterns:addNew:response', []);
  }

  //database operations
  //db.run('INSERT INTO patterns (name, files) VALUES (?, ?)', [pattern.name, pattern])
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
  

  //get old list
  const patternIndexPath = path.join(patternFolderPath, 'patternIndex.json');
  if(fs.existsSync(patternIndexPath)) {
    const patternsJSON = fs.readFileSync(patternIndexPath, 'utf-8');
    var patterns = JSON.parse(patternsJSON);
    
    //delete pattern from list
    patterns = patterns.filter(obj => obj.name !== pattern.name);

    fs.writeFileSync(patternIndexPath, JSON.stringify(patterns));
    event.sender.send('patterns:update', patterns);
  }

  else {
    event.sender.send('patterns:delete:response', []);
  }
})

ipcMain.on('patterns:update', (event, pattern) => {
  var photos = [];
  var techDrawings = [];
  var files = [];

  const folderPath = path.join(patternFolderPath, pattern.name);

})

// ipcMain.on('patterns:getAll', (event) => {
//   db.all('SELECT * FROM patterns', (err, rows) => {
//     if (err) {
//       console.error('Error fetching patterns:', err);
//       event.sender.send('patterns:getAll:response', []);
//       return;
//     }
//     event.sender.send('patterns:getAll:response', rows);
//   });
// });

// ipcMain.on('')