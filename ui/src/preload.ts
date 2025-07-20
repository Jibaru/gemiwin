import { contextBridge, shell, ipcRenderer } from 'electron';

// Expose a minimal API to the renderer for opening external links
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => shell.openExternal(url),
});

// Expose the dynamically chosen Gemini API port & URL
contextBridge.exposeInMainWorld('geminiAPI', {
  port: Number(process.env.API_PORT ?? 8080),
  url: `http://localhost:${process.env.API_PORT ?? 8080}`,
});
