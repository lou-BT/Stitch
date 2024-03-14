export {};

declare global {
  interface Window {
    ipcRenderer: any;
    ipcMain: any;
  }
}

declare global {interface File {
  path: string;
}}