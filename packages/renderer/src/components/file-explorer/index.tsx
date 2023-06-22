import type { ComponentPublicInstance } from 'vue';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import style from './style.module.css';
import type { TreeItem, TreeViewPublicInstance } from '../tree-view';
import { TreeView } from '../tree-view';
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

    function getFolderNameFromPath(path: string) {
      return path.split('/').slice(-1)[0];
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

    function handleContextMenu(event: MouseEvent, item: TreeItem) {
      event.stopPropagation();
      event.preventDefault();

      if (item.type === 'directory') {
        ContextMenu.showContextMenu({
          x: event.x,
          y: event.y,
          theme: 'flat dark',
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

    return () => {
      return (
        <div class={style.fileExplorer}>
          {fileExplorerStore.projectPath && (
            <>
              <div class={style.topbar}>
                <div class={style.projectName}>{getFolderNameFromPath(fileExplorerStore.projectPath)}</div>

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
                />
              </div>
            </>
          )}
        </div>
      );
    };
  },
});
