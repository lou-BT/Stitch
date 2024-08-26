const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');
const url = require("url");

const patternFolderPath = 'C:/Users/louca/Documents/PatternFolder';
const path = require("path");
const fs = require("fs");


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

ipcMain.on('patterns:addNew', (event, pattern) => {
  var newPattern = pattern;
  newPattern.photos = [];
  newPattern.techDrawings = [];
  newPattern.files = [];
  const newFolderPath = path.join(patternFolderPath, pattern.name);
  // Create folder
  fs.mkdirSync(newFolderPath);

  //copy files in folder
  pattern.files.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, fileName);
    
    fs.copyFileSync(filePath, destPath);
    newPattern.files.push(destPath);
  })

  //copy pictures in folder
  pattern.photos.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, "pictures", fileName);

    fs.copyFileSync(filePath, destPath);
    newPattern.photos.push(destPath);
  });

  pattern.techDrawings.forEach(filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, "pictures", fileName);

    fs.copyFileSync(filePath, destPath);
    newPattern.techDrawings.push(destPath);
  });

  //update JSON index
  const patternIndexPath = path.join(patternFolderPath, 'patternIndex.json');

  if(fs.existsSync(this.patternIndexPath)) {
        const patternsJSON = fs.readFileSync(patternIndexPath, 'utf-8');
        var patterns = JSON.parse(patternsJSON);
        patterns.push(newPattern);

        fs.writeFileSync(patternIndexPath, JSON.stringify(patterns));
        event.sender.send('patterns:addNew:response', patterns);
  }

  else {
    event.sender.send('patterns:addNew:response', []);
  }

  //database operations
  //db.run('INSERT INTO patterns (name, files) VALUES (?, ?)', [pattern.name, pattern])
})

ipcMain.on('patterns:getAll', (event) => {
  db.all('SELECT * FROM patterns', (err, rows) => {
    if (err) {
      console.error('Error fetching patterns:', err);
      event.sender.send('patterns:getAll:response', []);
      return;
    }
    event.sender.send('patterns:getAll:response', rows);
  });
});

// ipcMain.on('')