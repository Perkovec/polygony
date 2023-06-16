import type { PropType} from 'vue';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import type dirTree from 'directory-tree';
import style from './style.module.css';
import type { TreeItem } from '../tree-view';
import { TreeView } from '../tree-view';
import ContextMenu from '@imengyu/vue3-context-menu';
import { showPromptModal } from '../modals';

function dirTreeToExplorerTree(treeItem: dirTree.DirectoryTree): TreeItem {
  return {
    id: treeItem.path,
    name: treeItem.name,
    type: treeItem.type,
    children: treeItem.children?.map(item => dirTreeToExplorerTree(item)),
  };
}

export interface FileExplorerProps {
  whenClick: (item: TreeItem) => void;
}

export const FileExplorer = defineComponent({
  name: 'FileExplorer',
  props: {
    whenClick: {
      type: Function as PropType<FileExplorerProps['whenClick']>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
  },
  setup(props) {
    const items = ref<TreeItem[]>([]);
    const folderPath = ref('');

    (window as any).fileExplorer.onFolderOpened((event: any, path: string, files: dirTree.DirectoryTree) => {
      items.value = dirTreeToExplorerTree(files).children || [];
      folderPath.value = path;
    });

    (window as any).fileExplorer.onFileAdded(async () => {
      const files = await (window as any).fileExplorer.getFiles();
      items.value = dirTreeToExplorerTree(files).children || [];
    });

    (window as any).fileExplorer.onFileRemoved(async () => {
      const files = await (window as any).fileExplorer.getFiles();
      items.value = dirTreeToExplorerTree(files).children || [];
    });

    function getFolderNameFromPath(path: string) {
      return path.split('/').slice(-1)[0];
    }

    function addFile(path: string) {
      showPromptModal({
        title: 'Add file',
        message: 'Enter file name',
        onConfirm: (filename: string) => {
          if (filename.length) {
            (window as any).fileExplorer.addFile(path, filename + '.js');
          }
        },
      });
    }

    function addFolder(path: string) {
      showPromptModal({
        title: 'Add folder',
        message: 'Enter folder name',
        onConfirm: (foldername: string) => {
          if (foldername.length) {
            (window as any).fileExplorer.addFolder(path, foldername);
          }
        },
      });
    }

    function handleContextMenu(event: MouseEvent, item: TreeItem) {
      event.stopPropagation();
      event.preventDefault();

      if (item.type === 'directory') {
        ContextMenu.showContextMenu({
          x: event.x,
          y: event.y,
          items: [
            {
              label: 'Add file',
              onClick: () => addFile(item.id),
            },
            {
              label: 'Add folder',
              onClick: () => addFolder(item.id),
            },
          ],
        });
      }
    }

    function handleContainerContextMenu(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      if (!folderPath.value) {
        return;
      }

      ContextMenu.showContextMenu({
        x: event.x,
        y: event.y,
        theme: 'flat dark',
        items: [
          {
            label: 'Add file',
            onClick: () => addFile(folderPath.value),
          },
          {
            label: 'Add folder',
            onClick: () => addFolder(folderPath.value),
          },
        ],
      });
    }

    return () => {
      return (
        <div class={style.fileExplorer}>
          <div class={style.topbar}>
            <div class={style.projectName}>{getFolderNameFromPath(folderPath.value)}</div>
          </div>
          <div
            class={style.treeView}
            onContextmenu={handleContainerContextMenu}
          >
            <TreeView
              data={items.value}
              whenClick={props.whenClick}
              whenContextMenu={handleContextMenu}
            />
          </div>
        </div>
      );
    };
  },
});
