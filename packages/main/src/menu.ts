import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { Menu } from 'electron';
import type { IPCFileExplorer } from './ipc/file-explorer';
import { store } from './helpers/store';

export default function buildMenu(window: BrowserWindow, fileExplorer: IPCFileExplorer) {
  const recentProjects = store.get('recentProjects') || [];
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          click: () => {
            fileExplorer.chooseFolder();
          },
        },
        ...(recentProjects.length > 0 ? [
          { type: 'separator' as const },
          ...recentProjects.map(path => ({
            label: path,
            click: () => {
              fileExplorer.openFolder(path);
            },
          })),
        ] : []),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
