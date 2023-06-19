import { contextBridge, ipcRenderer } from 'electron';

export const devServerMethods = {
  serveFile: (path: string) => ipcRenderer.invoke('devServer:serveFile', path),
  onUpdateServer: (cb: any) => ipcRenderer.on('devServer:updateServer', cb),
};

contextBridge.exposeInMainWorld('devServer', devServerMethods);
