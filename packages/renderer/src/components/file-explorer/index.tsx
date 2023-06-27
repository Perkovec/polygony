import type { ComponentPublicInstance } from 'vue';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import style from './style.module.css';
import type { TreeItem, TreeViewPublicInstance } from '../tree-view';
import { TreeView } from '../tree-view';
import type { MenuItem } from '@imengyu/vue3-context-menu';
import ContextMenu from '@imengyu/vue3-context-menu';
import { showPromptModal } from '../modals';
import VueFeather from 'vue-feather';
import type dirTree from 'directory-tree';
import { useFileExplorer } from '/@/store/file-explorer';
import { useEditorStore } from '/@/store/editor';

export const FileExplorer = defineComponent({
  name: 'FileExplorer',
  setup() {
    const fileExplorerStore = useFileExplorer();
    const editorStore = useEditorStore();

    const treeViewRef = ref<ComponentPublicInstance<unknown, TreeViewPublicInstance>>();

    window.fileExplorer.onFolderOpened((_: unknown, path: string, files: dirTree.DirectoryTree) => {
      fileExplorerStore.setDirTree(files);
      fileExplorerStore.setProjectPath(path);
    });

    window.fileExplorer.onFileAdded(() => fileExplorerStore.updateFileTree());
    window.fileExplorer.onFileRemoved(() => fileExplorerStore.updateFileTree());

    function getEntityNameFromPath(path: string) {
      const segments = path.split('/');
      return segments[segments.length - 1];
    }

    function addFile(path?: string) {
      if (!path) {
        return;
      }
      showPromptModal({
        title: 'Add file',
        message: 'Enter file name',
        onConfirm: (filename: string) => {
          if (filename.length) {
            window.fileExplorer.addFile(path, filename + '.ts');
          }
        },
      });
    }

    function addFolder(path?: string) {
      if (!path) {
        return;
      }
      showPromptModal({
        title: 'Add folder',
        message: 'Enter folder name',
        onConfirm: (foldername: string) => {
          if (foldername.length) {
            window.fileExplorer.addFolder(path, foldername);
          }
        },
      });
    }

    function renameItem(item: TreeItem) {
      const segments = item.id.split('/');
      let itemName = segments[segments.length - 1];
      itemName = item.type === 'file' ? itemName.split('.')[0] : itemName;

      const path = segments.slice(0, segments.length - 1).join('/');

      showPromptModal({
        title: `Rename ${item.type === 'directory' ? 'folder' : 'file'}`,
        message: `Enter new ${item.type === 'directory' ? 'folder' : 'file'} name`,
        initialValue: itemName,
        onConfirm: (name: string) => {
          if (name.length) {
            fileExplorerStore.renamePath(
              item.id,
              `${path}/${name}${item.type === 'file' ? '.ts' : ''}`,
              item.type === 'file',
            );
          }
        },
      });
    }

    function handleContextMenu(event: MouseEvent, item: TreeItem) {
      event.stopPropagation();
      event.preventDefault();

      const items: (MenuItem | false)[] = [
        item.type === 'directory' && {
          label: 'Add file',
          onClick: () => addFile(item.id),
        },
        item.type === 'directory' && {
          label: 'Add folder',
          onClick: () => addFolder(item.id),
        },
        {
          label: 'Rename',
          onClick: () => renameItem(item),
        },
      ];

      ContextMenu.showContextMenu({
        x: event.x,
        y: event.y,
        theme: 'flat dark',
        items: items.filter(Boolean) as MenuItem[],
      });
    }

    function handleContainerContextMenu(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      if (!fileExplorerStore.projectPath) {
        return;
      }

      ContextMenu.showContextMenu({
        x: event.x,
        y: event.y,
        theme: 'flat dark',
        items: [
          {
            label: 'Add file',
            onClick: () => addFile(fileExplorerStore.projectPath),
          },
          {
            label: 'Add folder',
            onClick: () => addFolder(fileExplorerStore.projectPath),
          },
        ],
      });
    }

    function handleItemClick(item: TreeItem) {
      editorStore.openFile(item.id);
    }

    function handleMove(targetItem: TreeItem, destinationItem: TreeItem) {
      fileExplorerStore.movePath(targetItem, destinationItem);
    }

    return () => {
      return (
        <div class={style.fileExplorer}>
          {fileExplorerStore.projectPath && (
            <>
              <div class={style.topbar}>
                <div class={style.projectName}>{getEntityNameFromPath(fileExplorerStore.projectPath)}</div>

                <button class={style.actionButton} onClick={() => addFile(fileExplorerStore.projectPath)}>
                  <VueFeather class={style.buttonIcon} type="file-plus" />
                </button>
                <button class={style.actionButton} onClick={() => addFolder(fileExplorerStore.projectPath)}>
                  <VueFeather class={style.buttonIcon} type="folder-plus" />
                </button>
                <button class={style.actionButton} onClick={() => fileExplorerStore.updateFileTree()}>
                  <VueFeather class={style.buttonIcon} type="rotate-cw" />
                </button>
                <button class={style.actionButton} onClick={() => treeViewRef.value?.collapse()}>
                  <VueFeather class={style.buttonIcon} type="minus-square" />
                </button>
              </div>
              <div
                class={style.treeView}
                onContextmenu={handleContainerContextMenu}
              >
                <TreeView
                  ref={treeViewRef}
                  data={fileExplorerStore.fileTree}
                  activeItemId={editorStore.currentFile}
                  whenClick={handleItemClick}
                  whenContextMenu={handleContextMenu}
                  whenMove={handleMove}
                />
              </div>
            </>
          )}
        </div>
      );
    };
  },
});
