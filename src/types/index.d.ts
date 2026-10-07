export {};

declare global {
  interface Window {
    ipcRenderer: any;
    ipcMain: any;
    getFilePath: (file: File) => string;
  }
}