import type { devServerMethods } from '../packages/preload/src/dev-server';
import type { fileExplorerMethods } from '../packages/preload/src/file-explorer';

declare global {
  interface Window {
    devServer: typeof devServerMethods;
    fileExplorer: typeof fileExplorerMethods;
  }
}
