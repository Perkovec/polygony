import { contextBridge, ipcRenderer } from 'electron';

export const devServerMethods = {
  serveFile: (path: string) => ipcRenderer.invoke('devServer:serveFile', path),
};

contextBridge.exposeInMainWorld('devServer', devServerMethods);
