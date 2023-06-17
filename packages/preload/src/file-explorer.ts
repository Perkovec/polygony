import { contextBridge, ipcRenderer } from 'electron';

export const fileExplorerMethods = {
  onFolderOpened: (cb: any) => ipcRenderer.on('fileExplorer:folderOpened', cb),
  onFileAdded: (cb: any) => ipcRenderer.on('fileExplorer:added', cb),
  onFileRemoved: (cb: any) => ipcRenderer.on('fileExplorer:unlinked', cb),
  readFileContent: (path: string) => ipcRenderer.invoke('fileExplorer:readFile', path),
  addFile: (path: string, filename: string) => ipcRenderer.invoke('fileExplorer:addFile', path, filename),
  addFolder: (path: string, foldername: string) => ipcRenderer.invoke('fileExplorer:addFolder', path, foldername),
  getFiles: () => ipcRenderer.invoke('fileExplorer:getFiles'),
};

contextBridge.exposeInMainWorld('fileExplorer', fileExplorerMethods);
