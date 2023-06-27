import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TreeItem } from '../components/tree-view';
import { dirTreeToExplorerTree } from '../lib/dir-tree';
import type dirTree from 'directory-tree';
import { useEditorStore } from './editor';

export const useFileExplorer = defineStore('fileExplorer', () => {
  const editorStore = useEditorStore();

  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const projectPath = ref<string>();
  const fileTree = ref<TreeItem[]>([]);

  /*--------------------*/
  /*------MUTATIONS-----*/
  /*--------------------*/

  function setProjectPath(path: string) {
    projectPath.value = path;
  }

  function setFileTree(tree: TreeItem[]) {
    fileTree.value = tree;
  }

  function setDirTree(tree: dirTree.DirectoryTree) {
    setFileTree(dirTreeToExplorerTree(tree).children || []);
  }

  /*--------------------*/
  /*-------ACTIONS------*/
  /*--------------------*/

  async function updateFileTree() {
    const files = await window.fileExplorer.getFiles();
    setDirTree(files);
  }

  async function renamePath(path: string, newPath: string, isFile = false) {
    await window.fileExplorer.renamePath(path, newPath);
    await updateFileTree();

    if (isFile) {
      editorStore.updateTabPath(path, newPath);
    }
  }

  async function movePath(targetItem: TreeItem, destinationItem: TreeItem) {
    const destinationFolder = destinationItem.type === 'directory' ? destinationItem.id : destinationItem.id.split('/').slice(0, -1).join('/');
    const targetFolder = targetItem.type === 'directory' ? targetItem.id : targetItem.id.split('/').slice(0, -1).join('/');

    if (targetFolder !== destinationFolder) {
      const oldToNewPathMap = await window.fileExplorer.movePath(JSON.stringify(targetItem), JSON.stringify(destinationItem));
      for (const [oldPath, newPath] of Object.entries(oldToNewPathMap)) {
        editorStore.updateTabPath(oldPath, newPath);
      }
      await updateFileTree();
    }
  }

  return {
    // STATE
    projectPath,
    fileTree,

    // MUTATIONS
    setProjectPath,
    setDirTree,

    // ACTIONS
    updateFileTree,
    renamePath,
    movePath,
  };
});
