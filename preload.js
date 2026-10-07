const { ipcRenderer, webUtils } = require('electron');

window.ipcRenderer = ipcRenderer;
window.ipcMain = ipcRenderer;

// Expose webUtils for getting file paths
window.getFilePath = (file) => {
  return webUtils.getPathForFile(file);
};