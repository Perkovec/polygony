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
  };
});
