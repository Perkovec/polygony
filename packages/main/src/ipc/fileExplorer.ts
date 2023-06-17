import type { BrowserWindow} from 'electron';
import { dialog, ipcMain } from 'electron';
import type { Stats } from 'fs';
import dirTree from 'directory-tree';
import * as chokidar from 'chokidar';
import path from 'path';
import { store } from '../helpers/store';
import fs from 'fs/promises';
import type { DevServer } from '../server';

export class IPCFileExplorer {
  private currentFolder?: string;
  private watcher?: chokidar.FSWatcher;

  constructor(private window: BrowserWindow, private server: DevServer) {
    ipcMain.handle('fileExplorer:readFile', (_: unknown, path: string) => this.readFile(path));
    ipcMain.handle('fileExplorer:addFile', (_: unknown, path: string, filename: string) => this.addFile(path, filename));
    ipcMain.handle('fileExplorer:addFolder', (_: unknown, path: string, foldername: string) => this.addFolder(path, foldername));
    ipcMain.handle('fileExplorer:getFiles', () => this.getFiles(this.currentFolder!));
  }

  private async readFile(path: string) {
    const content = await fs.readFile(path, 'utf-8');
    return content;
  }

  private async addFile(destPath: string, filename: string) {
    await fs.writeFile(path.join(destPath, filename),
`function main() {
  return [];
}

export default main;`,
    );
  }

  private async addFolder(destPath: string, foldername: string) {
    await fs.mkdir(path.join(destPath, foldername), { recursive: true });
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
    this.window.webContents.send('fileExplorer:folderOpened', path, files);

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
      exclude: [/node_modules/g, /\.polygony_temp/g],
      extensions: /\.js$/,
      attributes: ['size', 'type', 'extension'],
    });
  }

  private setCurrentFolder(path: string) {
    this.currentFolder = path;
    this.server.setCurrentFolder(path);

    if (this.watcher) {
      this.watcher?.close().then(() => this.watchPath(path));
    } else {
      this.watchPath(path);
    }
  }

  private handleWatchAdd(path: string, stats?: Stats) {
    this.window.webContents.send('fileExplorer:added', path, stats);
  }

  private handleWatchUnlink(path: string) {
    this.window.webContents.send('fileExplorer:unlinked', path);
  }

  private watchPath(path: string) {
    this.watcher = chokidar.watch(path, {
      ignoreInitial: true,
      ignored: [/node_modules/g, /\.polygony_temp/g],
    });
    this.watcher.on('add', (...args) => this.handleWatchAdd(...args));
    this.watcher.on('addDir', (...args) => this.handleWatchAdd(...args));
    this.watcher.on('unlink', (...args) => this.handleWatchUnlink(...args));
    this.watcher.on('unlinkDir', (...args) => this.handleWatchUnlink(...args));
  }
}
