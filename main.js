const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');
const url = require("url");

const patternFolderPath = 'C:/Users/louca/Documents/PatternFolder';
const path = require("path");
const fs = require("fs");

const sqlite3 = require('sqlite3');

// Open SQLite database
const DB_FILE_PATH = './data/database.db';
const db = new sqlite3.Database(DB_FILE_PATH);

// // Create a table
db.serialize(() => {
  db.run('DROP TABLE patterns');
  db.run('CREATE TABLE IF NOT EXISTS patterns (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL, files TEXT[] NOT NULL)');
});



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

ipcMain.on('add-pattern', (event, pattern) => {
  const newFolderPath = path.join(patternFolderPath, pattern.name);
  // Create folder
  fs.mkdirSync(newFolderPath);
  //move files
  console.log(pattern.files);
  pattern.files.forEach(filePath => {
    console.log(filePath)
    const fileName = path.basename(filePath);
    const destPath = path.join(newFolderPath, fileName);
    fs.copyFileSync(filePath, destPath);
  })

  //database operations
  db.run('INSERT INTO patterns (name, files) VALUES (?, ?)', [pattern.name, pattern])
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