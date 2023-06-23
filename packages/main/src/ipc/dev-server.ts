import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import type dirTree from 'directory-tree';
import type { BrowserWindow} from 'electron';
import { ipcMain } from 'electron';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import previewJs from '../preview/index?rawBundle';
import previewHtml from '../preview/index.html?raw';

export class IPCDevServer {
  private currentFolder?: string;
  private currentFile?: string;

  constructor(private window: BrowserWindow) {
    ipcMain.handle('devServer:serveFile', (event: any, path: string) => this.setCurrentFile(path));
  }

  private plainArrayFromDirTree(tree: dirTree.DirectoryTree) {
    const array: string[] = [];
    tree.children?.forEach((child) => {
      if (child.type === 'directory') {
        array.push(...this.plainArrayFromDirTree(child));
      } else {
        array.push(child.path);
      }
    });
    return array;
  }

  private async writeIndexHtml() {
    if (!this.currentFolder) {
      return;
    }

    const content = previewHtml.replace('{PREVIEW_CODE}', previewJs);

    await fs.writeFile(path.join(this.currentFolder, '.polygony_temp', 'index.html'), content);
  }

  public async setCurrentFile(filePath: string) {
    if (!this.currentFolder) {
      return;
    }

    this.currentFile = filePath;

    this.buildCurrentFile();
  }

  public async buildCurrentFile() {
    if (!this.currentFolder || !this.currentFile) {
      return;
    }

    const tempPath = path.join(this.currentFolder, '.polygony_temp', 'model.js');
    const buildResult = await esbuild.build({
      entryPoints: [this.currentFile],
      bundle: true,
      outfile: tempPath,
      allowOverwrite: true,
      format: 'esm',
    });

    this.window.webContents.send('devServer:updateServer', 'http://localhost:23456');
    return buildResult;
  }

  private createTempDir(folder: string) {
    return fs.mkdir(path.join(folder, '.polygony_temp'), { recursive: true });
  }

  public async setCurrentFolder(folder: string) {
    this.currentFolder = folder;
    this.createTempDir(folder);

    await this.writeIndexHtml();

    const server = fastify();
    server.register(fastifyStatic, {
      root: path.join(folder, '.polygony_temp'),
    });

    server.listen({ port: 23456, host: 'localhost' }, () => {
      this.window.webContents.send('devServer:updateServer', 'http://localhost:23456');
    });
  }
}
