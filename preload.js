const { ipcRenderer, webUtils, contextBridge } = require('electron');

window.ipcRenderer = ipcRenderer;
window.ipcMain = ipcRenderer;

contextBridge.exposeInMainWorld('electronAPI', {
  // PATTERNS
  loadPatterns: () => ipcRenderer.invoke('patterns:getAll'),
  getPatternDetails: (patternId) => ipcRenderer.invoke('patterns:getDetails', patternId),
  addPattern: (pattern) => ipcRenderer.send('patterns:addNew', pattern),
  deletePattern: (pattern) => ipcRenderer.send('patterns:delete', pattern),
  editPattern: (oldPattern, newPattern) => ipcRenderer.invoke('patterns:edit', oldPattern, newPattern),
  // COMMENTS
  addComment: (patternId, text) => ipcRenderer.invoke('comments:add', patternId, text),
  editComment: (patternId, commentId, text) => ipcRenderer.invoke('comments:edit', patternId, commentId, text),
  deleteComment: (patternId, commentId) => ipcRenderer.invoke('comments:delete', patternId, commentId),
  // CATEGORIES
  getCategories: () => ipcRenderer.invoke('patterns:getCategories'),
  getCategoryById: (id) => ipcRenderer.invoke('patterns:getCategoryById', id),
  addCategory: (name) => ipcRenderer.invoke('patterns:addCategory', name),
  updateCategory: (id, name) => ipcRenderer.invoke('patterns:updateCategory', id, name),
  deleteCategory: (id) => ipcRenderer.invoke('patterns:deleteCategory', id),
  // SHARED FILES
  getSharedFiles: () => ipcRenderer.invoke('sharedFiles:getAll'),
  // addSharedFile: (file) => ipcRenderer.send('shared:add', file),
  // deleteSharedFile: (file) => ipcRenderer.send('shared:delete', file)
  onPatternsUpdate: (callback) => {
    ipcRenderer.on('patterns:update', (event, patterns) => callback(event,patterns));
    return () => ipcRenderer.removeAllListeners('patterns:update');
  },
  // FILES
  // webUtils must be called from the preload: with contextIsolation, anything
  // assigned to `window` here is invisible to the Angular app.
  getFilePath: (file) => webUtils.getPathForFile(file),
  // Opening a file needs `shell`, which lives in the main process (see 'patterns:openFile' in main.js)
  openFile: (filePath) => ipcRenderer.send('patterns:openFile', filePath),
});