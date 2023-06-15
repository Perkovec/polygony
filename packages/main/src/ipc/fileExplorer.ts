import type { BrowserWindow} from 'electron';
import { dialog, ipcMain } from 'electron';
import type { Stats } from 'fs';
import dirTree from 'directory-tree';
import * as chokidar from 'chokidar';
import { store } from '../helpers/store';
import fs from 'fs/promises';
import type { DevServer } from '../server';

export class IPCFileExplorer {
  private currentFolder?: string;
  private watcher?: chokidar.FSWatcher;

  constructor(private window: BrowserWindow, private server: DevServer) {
    ipcMain.handle('fileExplorer:readFile', (event: any, path: string) => this.readFile(path));
  }

  // Read file content from file system
  private async readFile(path: string) {
    const content = await fs.readFile(path, 'utf-8');
    return content;
  }


  public async chooseFolder() {
    const { filePaths } = await dialog.showOpenDialog(this.window, {
      properties: ['openDirectory'],
    });

    const path = filePaths?.[0];
    if (path) {
      this.openFolder(path);
    }
  }

  public async openFolder(path: string) {
    const files = await this.getFiles(path);
    this.window.webContents.send('fileExplorer:folderOpened', files);

    const recentProjects = store.get('recentProjects');

    if (!recentProjects.includes(path)) {
      recentProjects.unshift(path);

      if (recentProjects.length > 5) {
        recentProjects.splice(0, recentProjects.length - 5);
      }
      store.set('recentProjects', recentProjects);
    }

    this.setCurrentFolder(path);
  }

  private getFiles(path: string) {
    return dirTree(path, {
      exclude: [/node_modules/g, /\..*$/g, /\.polygony_temp/g],
      extensions: /\.js$/,
      attributes: ['size', 'type', 'extension'],
    });
  }

  private setCurrentFolder(path: string) {
    this.currentFolder = path;
    this.server.setCurrentFolder(path);

    this.watcher?.close().then(() => this.watchPath(path));
  }

  private handleWatchAdd(path: string, stats?: Stats) {
    this.window?.webContents.send('fileExplorer:added', path, stats);
  }

  private handleWatchUnlink(path: string) {
    this.window?.webContents.send('fileExplorer:unlinked', path);
  }

  private watchPath(path: string) {
    this.watcher = chokidar.watch(path);

    this.watcher.on('add', this.handleWatchAdd);
    this.watcher.on('unlink', this.handleWatchUnlink);
  }
}
