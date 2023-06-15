/**
 * @module preload
 */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('fileExplorer', {
  onFolderOpened: (cb: any) => ipcRenderer.on('fileExplorer:folderOpened', cb),
  readFileContent: (path: string) => ipcRenderer.invoke('fileExplorer:readFile', path),
  serveFile: (path: string) => ipcRenderer.invoke('devServer:serveFile', path),
});

contextBridge.exposeInMainWorld('devServer', {
  serveFile: (path: string) => ipcRenderer.invoke('devServer:serveFile', path),
});
