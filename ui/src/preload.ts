import { contextBridge, shell, ipcRenderer } from 'electron';

// Expose a minimal API to the renderer for opening external links
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => shell.openExternal(url),
});
